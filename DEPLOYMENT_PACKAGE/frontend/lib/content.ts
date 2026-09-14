/**
 * 文章内容工具函数
 *
 * Worker bundle 体积控制（方案 A）—— 数据分三层：
 *
 *   1. lib/articles-meta-recent.json    最近 30 天文章的元数据，静态 import 进
 *                                       server bundle（仅几 KB），供运行时 SSR 兜底
 *                                       （增量缓存 MISS 时），Worker 体积不随文章总量增长。
 *   2. lib/articles-meta.json           全量元数据（按 slug 去重），仅构建期 fs 读取，
 *                                       用于 generateStaticParams / sitemap / 列表页预渲染，
 *                                       不进 Worker bundle。
 *   3. lib/articles-content/<slug>.json 正文 content，仅构建期 fs 读取，不进 Worker bundle。
 *
 * 预渲染页面（含正文）写入 .open-next/cache，由 static-assets 增量缓存
 * （open-next.config.ts 配置 + scripts/populate-static-cache.js 复制到
 * .open-next/assets/cdn-cgi/_next_cache/）随 Worker 静态资产一起部署，
 * 运行时优先从缓存返回完整页面。
 *
 * 失败策略（区分构建期与运行期）：
 *   - 构建期（Node 环境）：读取失败直接抛错，让 next build 失败（fail fast），
 *     配合 scripts/verify-build.js 双保险，杜绝空正文页面静默上线
 *   - 运行期（Cloudflare Worker）：fs 不可用，30 天前的文章元数据不在 bundle 中，
 *     查不到时返回 null（404）；正常情况下这些页面由静态资产增量缓存提供
 *     （s-maxage=31536000，一年缓存），不会触发 SSR。
 */

import fs from 'fs';
import path from 'path';
import articlesMetaRecent from './articles-meta-recent.json';

export interface Article {
  slug: string;
  title: string;
  date: string;
  category: string;
  tags: string[];
  author: string;
  featuredImage: string;
  excerpt: string;
  content: string;
  contentLength: number;
}

type ArticleMeta = Omit<Article, 'content'>;

/** 运行时兜底数据（最近 30 天），静态 import 进 Worker bundle */
const recentMetaList = articlesMetaRecent as ArticleMeta[];

/** 是否运行在 Cloudflare Worker 运行时（workerd），标准检测方式 */
const isCloudflareWorker =
  typeof navigator !== 'undefined' && navigator.userAgent === 'Cloudflare-Workers';

/**
 * 解析 frontend/lib 的真实目录。
 *
 * 构建时 cwd 可能是：
 *   - frontend 目录（本地 dev / 正常构建）
 *   - 仓库根目录（CI 从根目录构建，需拼上 DEPLOYMENT_PACKAGE/frontend）
 *   - 其他更深的子目录（从 cwd 逐级向上查找兜底）
 *
 * 解析结果缓存，进程内只找一次。
 */
let libDirCache: string | null | undefined;

function resolveLibDir(): string | null {
  if (libDirCache !== undefined) return libDirCache;

  const markers = ['articles-meta.json', 'articles-content'];
  const isLibDir = (dir: string) => markers.some((m) => fs.existsSync(path.join(dir, m)));

  const candidates: string[] = [
    // 1. cwd 即 frontend 目录
    path.join(process.cwd(), 'lib'),
    // 2. cwd 为仓库根目录
    path.join(process.cwd(), 'DEPLOYMENT_PACKAGE', 'frontend', 'lib'),
  ];

  // 3. 从 cwd 逐级向上查找（最多 6 层），覆盖 cwd 嵌套更深的场景
  let dir = process.cwd();
  for (let i = 0; i < 6; i++) {
    candidates.push(path.join(dir, 'lib'));
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  const found = candidates.find(isLibDir);
  if (!found) {
    console.error(
      '[content] ❌ 未找到 lib 数据目录，已尝试以下路径：\n  ' +
        candidates.join('\n  ') +
        '\n请先在 frontend 目录运行 node scripts/generate-content.js 生成数据文件。'
    );
  }
  libDirCache = found ?? null;
  return libDirCache;
}

/** 全量元数据缓存（仅构建期使用，fs 读取 articles-meta.json） */
let fullMetaCache: ArticleMeta[] | null = null;

/**
 * 获取元数据列表（按环境自动分层）：
 * - 构建期（Node，fs 可用）：读全量 articles-meta.json（去重后的所有文章，
 *   供 generateStaticParams / sitemap / 列表页预渲染，保证 SEO 不丢页面）
 * - 运行期（Worker）：使用 bundle 内的 articles-meta-recent.json（最近 30 天，
 *   SSR 兜底数据；30 天前的文章由静态资产增量缓存提供）
 */
function loadMeta(): ArticleMeta[] {
  if (isCloudflareWorker || fullMetaCache !== null) {
    return fullMetaCache ?? recentMetaList;
  }
  const libDir = resolveLibDir();
  if (!libDir) {
    // 找不到全量文件时降级用 recent，构建会因正文读取失败而 fail fast
    return recentMetaList;
  }
  try {
    const raw = fs.readFileSync(path.join(libDir, 'articles-meta.json'), 'utf-8');
    fullMetaCache = JSON.parse(raw) as ArticleMeta[];
    return fullMetaCache;
  } catch (err) {
    throw new Error(
      `[content] ❌ 读取全量元数据失败: ${path.join(libDir, 'articles-meta.json')}\n` +
        `原因: ${err instanceof Error ? err.message : String(err)}\n` +
        `请先运行 node scripts/generate-content.js。`
    );
  }
}

/**
 * 构建时从文件系统读取正文。
 * - 构建期（Node）：失败抛错，next build 失败（fail fast）
 * - 运行期（Worker）：正文不在 bundle 中，由增量缓存的预渲染页面提供
 */
function readArticleContent(slug: string): string {
  if (isCloudflareWorker) {
    // Worker 运行时没有 fs，正文应来自静态资产增量缓存的预渲染页面
    console.error(
      `[content] 运行时请求正文(slug=${slug})，正文不在 bundle 中，返回空串降级（正常情况正文应由增量缓存提供）`
    );
    return '';
  }

  const libDir = resolveLibDir();
  const contentPath = libDir
    ? path.join(libDir, 'articles-content', `${slug}.json`)
    : `(lib 目录未解析, cwd=${process.cwd()})`;

  try {
    const raw = fs.readFileSync(contentPath, 'utf-8');
    const content = (JSON.parse(raw).content as string) ?? '';
    if (!content.trim()) {
      throw new Error('正文内容为空');
    }
    return content;
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    throw new Error(
      `[content] ❌ 读取文章正文失败: ${slug}\n` +
        `尝试路径: ${contentPath}\n` +
        `原因: ${reason}\n` +
        `请先运行 node scripts/generate-content.js 生成 lib/articles-content/<slug>.json。`
    );
  }
}

/**
 * 获取所有文章（仅元数据，不含正文）
 * 构建期返回全量（预渲染用）；运行时返回最近 30 天（SSR 兜底用）。
 * 列表页 / sitemap / 分类页都用这个。
 */
export async function getAllArticles(): Promise<ArticleMeta[]> {
  return loadMeta();
}

/**
 * 根据 slug 获取单篇文章（含正文）
 * 构建时读取磁盘正文用于预渲染（全量可查）；运行时仅最近 30 天可查，
 * 30 天前的文章查不到返回 null（404），正常由增量缓存提供页面。
 */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const meta = loadMeta().find(a => a.slug === slug);
  if (!meta) return null;
  return { ...meta, content: readArticleContent(slug) };
}

/**
 * 根据分类获取文章（仅元数据）
 */
export async function getArticlesByCategory(category: string): Promise<ArticleMeta[]> {
  const categoryLower = category.toLowerCase();
  return loadMeta().filter(article =>
    article.category.toLowerCase() === categoryLower
  );
}

/**
 * 获取所有分类
 */
export async function getCategories(): Promise<string[]> {
  const categories = new Set(loadMeta().map(article => article.category));
  return Array.from(categories);
}

// 保持向后兼容
import { Article as OldArticle } from '@/types/article';

/**
 * 获取所有文章（旧接口兼容）
 */
export async function getAllArticlesOld(): Promise<OldArticle[]> {
  return loadMeta().map(article => ({
    ...article,
    content: '', // 旧接口的列表场景不需要正文
    publishedAt: new Date(article.date),
    updatedAt: new Date(article.date),
  }));
}

/**
 * 根据 slug 获取文章（旧接口兼容）
 */
export async function getArticleBySlugOld(slug: string): Promise<OldArticle | null> {
  const article = await getArticleBySlug(slug);
  if (!article) return null;

  return {
    ...article,
    publishedAt: new Date(article.date),
    updatedAt: new Date(article.date),
  };
}
