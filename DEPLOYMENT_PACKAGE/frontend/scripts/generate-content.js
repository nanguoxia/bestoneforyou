#!/usr/bin/env node
/**
 * 构建前生成文章数据 JSON
 *
 * Worker bundle 体积控制（方案 A）—— 数据分三层：
 *
 *   1. lib/articles-meta.json          全量元数据（按 slug 去重后），
 *                                      仅构建期通过 fs 读取，用于
 *                                      generateStaticParams / sitemap / 列表页预渲染，
 *                                      不静态 import，不进 Worker bundle。
 *
 *   2. lib/articles-meta-recent.json   最近 RECENT_DAYS 天的文章元数据，
 *                                      会被静态 import 进 server bundle，
 *                                      供运行时 SSR 兜底（增量缓存 MISS 时），
 *                                      体积极小（几 KB），Worker 体积不再随文章总量增长。
 *
 *   3. lib/articles-content/<slug>.json 每篇文章正文，仅在构建时 fs 读取，
 *                                      不进 Worker bundle。
 *
 * 背景数据（2026-08 实测）：机器人每天重复生成相同 slug 的文章，
 * 2922 条记录中唯一 slug 仅 116 个 —— 不去重时 meta 高达 1.9MB，
 * 全量静态 import 会把 Worker bundle 撑到危险体积。
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// 运行时兜底数据的时间窗口（天）
const RECENT_DAYS = 30;

// 使用绝对路径，避免构建时工作目录问题
const SCRIPT_DIR = path.resolve(__dirname);
const FRONTEND_DIR = path.dirname(SCRIPT_DIR);
const CONTENT_DIR = path.join(FRONTEND_DIR, 'content', 'articles', 'fitness');
const META_FILE = path.join(FRONTEND_DIR, 'lib', 'articles-meta.json');
const META_RECENT_FILE = path.join(FRONTEND_DIR, 'lib', 'articles-meta-recent.json');
const CONTENT_DIR_OUT = path.join(FRONTEND_DIR, 'lib', 'articles-content');
// 兼容旧文件：构建产物不再使用，但保留以便本地过渡
const LEGACY_FILE = path.join(FRONTEND_DIR, 'lib', 'articles-data.json');

function generate() {
  console.log('[prebuild] Generating articles JSON...');
  console.log('[prebuild] CONTENT_DIR:', CONTENT_DIR);
  console.log('[prebuild] META_FILE:', META_FILE);
  console.log('[prebuild] META_RECENT_FILE:', META_RECENT_FILE);
  console.log('[prebuild] RECENT_DAYS:', RECENT_DAYS);

  if (!fs.existsSync(CONTENT_DIR)) {
    console.error('[prebuild] Content directory not found:', CONTENT_DIR);
    fs.writeFileSync(META_FILE, '[]');
    fs.writeFileSync(META_RECENT_FILE, '[]');
    return;
  }

  const allFiles = fs.readdirSync(CONTENT_DIR);
  console.log('[prebuild] All files in directory:', allFiles.length);

  const files = allFiles.filter(f => f.endsWith('.md'));
  console.log('[prebuild] Markdown files:', files.length);

  const articles = files.map(file => {
    const filePath = path.join(CONTENT_DIR, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    return {
      slug: data.slug || file.replace(/\.md$/, ''),
      title: data.title || '',
      date: data.date || '',
      category: data.category || '',
      tags: data.tags || [],
      author: data.author || 'BestOneForYou Editorial Team',
      featuredImage: data.featuredImage || '',
      excerpt: data.excerpt || '',
      content,
    };
  });

  // 过滤无日期的，按日期倒序（新 → 旧）
  const validArticles = articles
    .filter(a => a.date && a.date !== '')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // ⚠️ 按 slug 去重（同 slug 保留最新一篇）：
  // 机器人每次运行会重复生成相同 slug 的文章，不去重时
  // 2922 条记录里唯一 slug 只有 116 个，meta 体积膨胀 25 倍。
  const seenSlugs = new Set();
  const dedupedArticles = validArticles.filter(a => {
    if (seenSlugs.has(a.slug)) return false;
    seenSlugs.add(a.slug);
    return true;
  });
  console.log(
    `[prebuild] Deduplicated: ${validArticles.length} → ${dedupedArticles.length} articles ` +
      `(${validArticles.length - dedupedArticles.length} duplicate slugs dropped)`
  );

  const toMeta = a => {
    const { content, ...rest } = a;
    return { ...rest, contentLength: content.length };
  };

  // 1. 全量 meta（去重后）：构建期专用，不进 Worker bundle
  const meta = dedupedArticles.map(toMeta);
  fs.writeFileSync(META_FILE, JSON.stringify(meta, null, 2));
  console.log(`[prebuild] Generated ${meta.length} article metadata → ${META_FILE}`);

  // 2. 最近 N 天 meta：静态 import 进 Worker bundle，供运行时 SSR 兜底
  const cutoff = Date.now() - RECENT_DAYS * 24 * 60 * 60 * 1000;
  const recentMeta = meta.filter(
    a => new Date(a.date).getTime() >= cutoff
  );
  // 保底：窗口内一篇都没有时至少保留最新的 1 篇，避免运行时完全无数据
  const recentFinal = recentMeta.length > 0 ? recentMeta : meta.slice(0, 1);
  fs.writeFileSync(META_RECENT_FILE, JSON.stringify(recentFinal, null, 2));
  console.log(
    `[prebuild] Generated ${recentFinal.length} recent (within ${RECENT_DAYS}d) metadata ` +
      `→ ${META_RECENT_FILE} (${(fs.statSync(META_RECENT_FILE).size / 1024).toFixed(1)} KB)`
  );

  // 3. 每篇文章的正文单独存一个文件，仅构建时通过 fs 读取，不进 Worker bundle
  fs.rmSync(CONTENT_DIR_OUT, { recursive: true, force: true });
  fs.mkdirSync(CONTENT_DIR_OUT, { recursive: true });
  dedupedArticles.forEach(a => {
    fs.writeFileSync(
      path.join(CONTENT_DIR_OUT, `${a.slug}.json`),
      JSON.stringify({ content: a.content })
    );
  });
  console.log(`[prebuild] Generated ${dedupedArticles.length} content files → ${CONTENT_DIR_OUT}`);

  // 4. 兼容：旧的 articles-data.json 不再使用，删除避免误打进 bundle
  try {
    fs.rmSync(LEGACY_FILE, { force: true });
    console.log('[prebuild] Removed legacy file:', LEGACY_FILE);
  } catch (e) {
    // ignore
  }
}

generate();
