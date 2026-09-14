#!/usr/bin/env node
/**
 * 构建后自检：抽查文章静态页是否真的渲染出了正文。
 *
 * 背景：2026-08 曾因文章正文在构建/运行链路中丢失，导致全站文章页
 * 只有标题/作者/标签、正文为空，且构建日志无任何报错。
 * 本脚本在 next build 之后运行（见 package.json 的 build 命令），
 * 抽查最新一篇 + 均匀抽取的若干篇文章，用"字母数字签名"比对
 * （剥离标点/空白/Markdown/HTML 标签差异后）校验静态 HTML
 * 包含对应正文的指纹片段；失败时以非零码退出，阻断部署。
 *
 * 已知差异处理：正文里的图片语法不参与指纹——
 * alt 在 HTML 中是 <img> 的属性（剥离标签后不在文本流中），且
 * cf-image-loader 会给图片 URL 追加 ?w=&h=&fit= 查询参数并做实体转义，
 * 直接比对必然误报。因此源侧把 ![alt](url) 整体删除、[text](url) 归一为 text。
 */

const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = path.dirname(__dirname);
const META_FILE = path.join(FRONTEND_DIR, 'lib', 'articles-meta.json');
const CONTENT_DIR = path.join(FRONTEND_DIR, 'lib', 'articles-content');
const ARTICLE_SSR_DIR = path.join(FRONTEND_DIR, '.next', 'server', 'app', 'article');

function fail(msg) {
  console.error('[verify-build] ❌ ' + msg);
  process.exit(1);
}

/** 去掉 HTML 标签并解码常见实体 */
function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#x27;|&apos;|&#39;/gi, "'")
    .replace(/&quot;/gi, '"');
}

/**
 * 源 markdown 预处理，消除与 HTML 文本流的差异：
 *   1. ![alt](url) 整体删除 —— alt 在 HTML 中是 <img> 的属性，
 *      剥离标签后不会出现在文本流里；且 URL 会被 image loader
 *      追加 ?w=&h=&fit= 查询参数并做实体转义，无法比对。
 *   2. [text](url) → text —— 链接文本会渲染为 <a> 的子节点，保留。
 */
function stripMarkdownUrls(md) {
  return md
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
}

/**
 * 归一化签名：只保留字母与数字（Unicode 感知）。
 * 剥离 Markdown 符号、HTML 标签、标点、空白与大小写差异，
 * 使源 markdown 与渲染后 HTML 可直接比对。
 */
function signature(text) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, '');
}

/** 递归查找构建产物中的静态 HTML（不同 Next 版本目录略有差异） */
function findHtmlFile(slug) {
  const direct = path.join(ARTICLE_SSR_DIR, `${slug}.html`);
  if (fs.existsSync(direct)) return direct;

  const appDir = path.join(FRONTEND_DIR, '.next', 'server', 'app');
  if (!fs.existsSync(appDir)) return null;
  const stack = [appDir];
  while (stack.length) {
    const dir = stack.pop();
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      if (fs.statSync(full).isDirectory()) {
        stack.push(full);
      } else if (full.endsWith(`${slug}.html`)) {
        return full;
      }
    }
  }
  return null;
}

if (!fs.existsSync(META_FILE)) {
  fail('缺少 lib/articles-meta.json，请先运行 node scripts/generate-content.js');
}

const meta = JSON.parse(fs.readFileSync(META_FILE, 'utf-8'));
if (!Array.isArray(meta) || meta.length === 0) {
  fail('lib/articles-meta.json 为空，文章数据异常');
}

// 抽样：最新 1 篇 + 全量均匀抽取至多 5 篇（覆盖老文章）
const samples = [meta[0]];
const step = Math.max(1, Math.floor(meta.length / 5));
for (let i = step; i < meta.length && samples.length < 6; i += step) {
  samples.push(meta[i]);
}

let checked = 0;
for (const article of samples) {
  const htmlPath = findHtmlFile(article.slug);
  if (!htmlPath) {
    fail(`文章 ${article.slug} 的静态 HTML 未在 .next 产物中找到`);
  }

  const contentFile = path.join(CONTENT_DIR, `${article.slug}.json`);
  if (!fs.existsSync(contentFile)) {
    fail(`正文数据缺失: ${contentFile}`);
  }

  const content = JSON.parse(fs.readFileSync(contentFile, 'utf-8')).content || '';
  const html = fs.readFileSync(htmlPath, 'utf-8');

  const srcSig = signature(stripMarkdownUrls(content));
  const htmlSig = signature(htmlToText(html));

  // 取正文签名前 400 个字符数字作为指纹（正文极短时取全部，但至少需要 80）
  if (srcSig.length < 80) {
    fail(`文章 ${article.slug} 的正文数据过短（${srcSig.length} 字符），疑似空正文数据`);
  }
  const fingerprint = srcSig.slice(0, 400);

  if (!htmlSig.includes(fingerprint)) {
    fail(
      `文章 ${article.slug} 的静态页中未找到正文指纹，疑似空正文页面。` +
        `指纹前缀: ${fingerprint.slice(0, 60)}...`
    );
  }
  checked++;
}

console.log(`[verify-build] ✅ 抽查 ${checked}/${meta.length} 篇文章静态页，正文渲染均正常`);
