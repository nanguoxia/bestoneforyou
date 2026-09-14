/**
 * 英雄网格布局组件 - 杂志风格的首屏展示
 */

import { Article } from '@/types/article';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, User } from 'lucide-react';

interface HeroGridProps {
  featuredArticles: Article[];
}

export function HeroGrid({ featuredArticles }: HeroGridProps) {
  if (!featuredArticles || featuredArticles.length === 0) {
    return null;
  }

  const mainArticle = featuredArticles[0];
  const sideArticles = featuredArticles.slice(1, 3);

  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, string> = {
      '价格监测': '💰',
      '攻略': '📖',
      '签证攻略': '✈️',
      '续航测试': '🔋',
      '价格追踪': '📊',
      '价格对比': '⚖️',
    };
    return iconMap[category] || '📰';
  };

  return (
    <section className="mb-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-auto md:h-[600px]">
        {/* 主文章 - 占2/3宽度 */}
        <div className="md:col-span-2 relative overflow-hidden rounded-2xl group shadow-soft bg-white">
          <Link href={`/article/${mainArticle.slug}`} className="block h-full">
            <div className="relative h-full">
              {/* 实际图片 */}
              {mainArticle.featuredImage && (
                <Image
                  src={mainArticle.featuredImage}
                  alt={mainArticle.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              )}
              {/* 渐变遮罩 */}
              {mainArticle.featuredImage && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
              )}
              {/* 备用背景 */}
              {!mainArticle.featuredImage && (
                <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 to-brand-light z-0" />
              )}
              <div className="absolute top-4 left-4 z-20">
                <span className="badge-primary shadow-lg">
                  JUST IN
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 z-20 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-lg">{getCategoryIcon(mainArticle.category)}</span>
                  <span className="text-sm opacity-90">{mainArticle.category}</span>
                </div>
                <h2 className="font-serif text-3xl md:text-4xl font-bold leading-tight mb-3 group-hover:text-brand-accent transition-colors">
                  {mainArticle.title}
                </h2>
                <p className="text-sm opacity-90 line-clamp-2 mb-3">
                  {mainArticle.excerpt}
                </p>
                <div className="flex items-center gap-4 text-xs opacity-75">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{Math.ceil((mainArticle.contentLength ?? mainArticle.content?.length ?? 0) / 400)} min read</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{mainArticle.author}</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* 侧边文章 - 占1/3宽度 */}
        <div className="md:col-span-2 grid grid-rows-2 gap-4">
          {sideArticles.map((article, index) => (
            <div
              key={article.slug}
              className="relative overflow-hidden rounded-2xl group shadow-card bg-white hover:shadow-lg transition-all duration-300"
            >
              <Link href={`/article/${article.slug}`} className="block h-full">
                <div className="relative h-full">
                  {/* 实际图片 */}
                  {article.featuredImage && (
                    <Image
                      src={article.featuredImage}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 25vw"
                    />
                  )}
                  {/* 渐变遮罩 */}
                  {article.featuredImage && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10" />
                  )}
                  {/* 备用背景 */}
                  {!article.featuredImage && (
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-light to-white z-0" />
                  )}
                  <div className="absolute top-3 left-3 z-20">
                    <span className="badge-secondary text-xs shadow-md">
                      TRENDING
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-20 text-white">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm">{getCategoryIcon(article.category)}</span>
                      <span className="text-xs opacity-90">{article.category}</span>
                    </div>
                    <h3 className="font-serif text-xl font-bold leading-tight mb-2 group-hover:text-brand-accent transition-colors">
                      {article.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs opacity-75">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{Math.ceil((article.contentLength ?? article.content?.length ?? 0) / 400)} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{article.author}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
