/**
 * 训练计划卡片组件
 * 用于展示训练计划，包含周期、要点等关键信息
 */

import { Article } from '@/types/article';
import Link from 'next/link';
import Image from 'next/image';

interface ItineraryCardProps {
  article: Article;
}

export function ItineraryCard({ article }: ItineraryCardProps) {
  // Extract duration from title or content
  const extractDays = (title: string, excerpt: string): string => {
    const dayMatch = title.match(/(\d+)\s*Day/) || excerpt.match(/(\d+)\s*Day/);
    const weekMatch = title.match(/(\d+)\s*Week/) || excerpt.match(/(\d+)\s*Week/);
    if (dayMatch) return `${dayMatch[1]}-Day Plan`;
    if (weekMatch) return `${weekMatch[1]}-Week Plan`;
    return 'Training Plan';
  };

  // Extract key highlights (top 3 attractions or keywords)
  const extractHighlights = (excerpt: string): string[] => {
    // Try to extract locations, attractions, etc.
    const highlights: string[] = [];
    const lines = excerpt.split(/[,.。、\n]/).filter(line => line.length < 20);

    for (const line of lines) {
      if (highlights.length >= 3) break;
      if (line.length > 2 && !line.includes('Trip') && !line.includes('Price')) {
        highlights.push(line.trim());
      }
    }

    return highlights.length > 0 ? highlights : ['Structured Program', 'Expert Coaching', 'Measurable Progress'];
  };

  const days = extractDays(article.title, article.excerpt);
  const highlights = extractHighlights(article.excerpt);

  return (
    <Link href={`/article/${article.slug}`} className="group">
      <div className="bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-xl transition-all duration-300 h-full">
        {/* 封面图 */}
        <div className="relative h-48 overflow-hidden">
          {article.featuredImage ? (
            <Image
              src={article.featuredImage}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-brand-primary/20 to-brand-accent/20 flex items-center justify-center">
              <span className="text-6xl">📋</span>
            </div>
          )}
          {/* 天数标签 */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
            <span className="text-sm font-semibold text-brand-primary">{days}</span>
          </div>
        </div>

        {/* 内容 */}
        <div className="p-6">
          {/* 标题 */}
          <h3 className="font-serif text-xl font-bold text-brand-dark mb-3 line-clamp-2 group-hover:text-brand-primary transition-colors">
            {article.title}
          </h3>

          {/* 行程亮点 */}
          {highlights.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {highlights.map((highlight, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-1 bg-brand-light/50 text-brand-dark/70 rounded-full"
                >
                  {highlight}
                </span>
              ))}
            </div>
          )}

          {/* 简短描述 */}
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {article.excerpt}
          </p>

          {/* Bottom Info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{new Date(article.publishedAt).toLocaleDateString('en-US')}</span>
            </div>
            <div className="flex items-center gap-1 text-brand-primary font-medium group-hover:gap-2 transition-all">
              <span>View Details</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
