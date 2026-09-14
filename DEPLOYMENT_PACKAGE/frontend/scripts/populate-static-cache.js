#!/usr/bin/env node
/**
 * 把 .open-next/cache 复制到 .open-next/assets/cdn-cgi/_next_cache/，
 * 使预渲染页面（含文章正文）作为 Worker 静态资产部署（static-assets 增量缓存）。
 *
 * open-next.config.ts 配置了 staticAssetsIncrementalCache 后，
 * `opennextjs-cloudflare deploy/preview` 会自动做同样的复制（幂等）。
 * 本脚本是兜底：即使部署流程分开执行 build 与 wrangler deploy、
 * 没有经过 opennextjs-cloudflare 的 populate 步骤，缓存也会随资产上传。
 *
 * 在 package.json 的 cf:build 末尾调用。
 */

const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = path.dirname(__dirname);
const OPEN_NEXT_DIR = path.join(FRONTEND_DIR, '.open-next');
const CACHE_DIR = path.join(OPEN_NEXT_DIR, 'cache');
const ASSETS_CACHE_DIR = path.join(OPEN_NEXT_DIR, 'assets', 'cdn-cgi', '_next_cache');

if (!fs.existsSync(CACHE_DIR)) {
  console.error(
    '[populate-static-cache] ❌ 未找到 .open-next/cache，请先执行 opennextjs-cloudflare build'
  );
  process.exit(1);
}

fs.rmSync(ASSETS_CACHE_DIR, { recursive: true, force: true });
fs.cpSync(CACHE_DIR, ASSETS_CACHE_DIR, { recursive: true });

const count = fs.readdirSync(ASSETS_CACHE_DIR, { recursive: true })
  .filter((f) => fs.statSync(path.join(ASSETS_CACHE_DIR, f)).isFile()).length;

console.log(
  `[populate-static-cache] ✅ 已复制增量缓存到 assets/cdn-cgi/_next_cache（顶层条目 ${count} 个）`
);
