/**
 * 优化的文章卡片组件 - 杂志风格
 */

import { Article } from '@/types/article';
import Link from 'next/link';
import { Clock, User, Calendar } from 'lucide-react';
import { slugify } from '@/lib/utils';

interface ArticleCardProps {
  article: Article;
  showExcerpt?: boolean;
  showReadingTime?: boolean;
  showAuthor?: boolean;
  className?: string;
}

export function ArticleCard({
  article,
  showExcerpt = true,
  showReadingTime = true,
  showAuthor = true,
  className = '',
}: ArticleCardProps) {
  const readingTime = Math.ceil((article.contentLength ?? article.content?.length ?? 0) / 400);
  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, string> = {
      '价格监测': '💰',
      '攻略': '📖',
      '签证攻略': '✈️',
      '续航测试': '🔋',
      '价格追踪': '📊',
      '价格对比': '💳',
      '护肤评测': '💄',
      '化妆教程': '💅',
      '产品对比': '⚖️',
    };
    return iconMap[category] || '📰';
  };

  return (
    <Link
      href={`/article/${article.slug}`}
      className={`block group ${className}`}
    >
      <article className="bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-soft transition-all duration-300 border border-slate-100">
        {/* 图片容器 */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-brand-light to-slate-100">
          {article.featuredImage && !article.featuredImage.includes('/images/') && (
            <img
              src={article.featuredImage}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          )}
          {/* 分类标签 */}
          <div className="absolute top-3 left-3 z-10">
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold shadow-md">
              <span>{getCategoryIcon(article.category)}</span>
              <span className="text-brand-dark">{article.category}</span>
            </span>
          </div>
          {/* Date Badge */}
          {(article.publishedAt || article.date) && (
            <div className="absolute top-3 right-3 z-10">
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-brand-accent/90 backdrop-blur-sm rounded-full text-xs font-medium text-white shadow-md">
                <Calendar className="h-3 w-3" />
                <span>
                  {article.publishedAt
                    ? new Date(article.publishedAt).toLocaleDateString('en-US')
                    : new Date(article.date).toLocaleDateString('en-US')
                  }
                </span>
              </span>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="p-5">
          {/* Title */}
          <h3 className="font-serif text-lg font-semibold text-brand-dark leading-tight mb-3 group-hover:text-brand-primary transition-colors line-clamp-2" style={{ fontFamily: 'var(--font-serif)' }}>
            {article.title}
          </h3>

          {/* Excerpt */}
          {showExcerpt && article.excerpt && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2" style={{ fontFamily: 'var(--font-inter)', lineHeight: '1.6' }}>
              {article.excerpt}
            </p>
          )}

          {/* Meta Information */}
          <div className="flex items-center justify-between meta-text">
            <div className="flex items-center gap-3">
              {showAuthor && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>{article.author}</span>
                </div>
              )}
              {showReadingTime && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{readingTime} min read</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="font-medium">{article.tags[0]}</span>
                {article.tags.length > 1 && (
                  <span className="text-muted-foreground">+{article.tags.length - 1}</span>
                )}
              </div>
            )}
          </div>

          {/* 数据亮点（如果有） */}
          {article.price && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-brand-accent">
                <span>💰</span>
                <span>{article.price}</span>
              </span>
            </div>
          )}

          {article.rating && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold text-brand-dark">评分</span>
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={i < Math.floor(article.rating!) ? 'text-yellow-400' : 'text-slate-200'}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-muted-foreground">({article.rating})</span>
              </div>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}

/**
 * 紧凑型文章卡片（用于侧边栏或相关文章）
 */
export function ArticleCardCompact({ article }: { article: Article }) {
  return (
    <Link
      href={`/article/${article.slug}`}
      className="block group"
    >
      <article className="flex gap-3 p-3 rounded-xl hover:bg-brand-light transition-colors">
        <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-brand-light to-slate-100">
          {article.featuredImage && (
            <img
              src={article.featuredImage}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-serif text-sm font-bold text-brand-dark leading-tight mb-1 group-hover:text-brand-primary transition-colors line-clamp-2" style={{ fontFamily: 'var(--font-serif)' }}>
            {article.title}
          </h4>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{article.category}</span>
            <span>•</span>
            <span>{Math.ceil((article.contentLength ?? article.content?.length ?? 0) / 400)} min</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
