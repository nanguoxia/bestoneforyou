/**
 * Cloudflare Image Loader
 * 替代 Vercel Image Optimization，利用 Cloudflare CDN 自带缓存
 */
export default function cloudflareLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  // 外部图片直接返回原始 URL，CDN 层做缓存优化
  if (src.startsWith("http")) {
    return src;
  }
  // 本地图片加参数（Cloudflare 缓存会自动处理）
  return `${src}?w=${width}&q=${quality || 75}`;
}
