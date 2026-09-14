/**
 * OpenNext Cloudflare 配置
 *
 * 启用 static-assets 增量缓存：next build 产出的预渲染页面（含文章正文）
 * 会写入 .open-next/cache，部署时复制到 .open-next/assets/cdn-cgi/_next_cache/
 * （由 opennextjs-cloudflare deploy/preview 自动完成，scripts/populate-static-cache.js 兜底），
 * 运行时 Worker 直接从静态资产返回完整预渲染页面。
 *
 * 背景：此前未配置任何增量缓存，运行时所有页面回退到 Worker SSR，
 * 而 Worker 运行时没有 fs 无法读取文章正文，导致全站文章页正文为空。
 */
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
});
