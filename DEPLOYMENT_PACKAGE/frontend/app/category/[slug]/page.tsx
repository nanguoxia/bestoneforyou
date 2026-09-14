/**
 * 分类页面
 */

// 强制静态输出
export const dynamic = 'force-static';

// 仅预渲染 siteConfig.categories 中的分类，未知分类直接 404
export const dynamicParams = false;

import { notFound } from 'next/navigation';
import { getArticlesByCategory } from '@/lib/content';
import { siteConfig } from '@/config/site.config';
import { ArticleCard } from '@/components/ArticleCard';

export async function generateStaticParams() {
  return siteConfig.categories.map((category) => ({
    slug: category.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = siteConfig.categories.find((cat) => cat.slug === slug);

  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  return {
    title: `${category.name} - ${siteConfig.name}`,
    description: category.description,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = siteConfig.categories.find((cat) => cat.slug === slug);

  if (!category) {
    notFound();
  }

  const articles = await getArticlesByCategory(category.name);

  return (
    <div className="min-h-screen bg-brand-bg py-12">
      <div className="container mx-auto px-4">
        {/* Category Header */}
        <div className="text-center mb-12">
          {category.icon && (
            <div className="text-6xl mb-4">{category.icon}</div>
          )}
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-brand-dark mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
            {category.name}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {category.description}
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            {articles.length} articles
          </p>
        </div>

        {/* Articles Grid */}
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <ArticleCard
                key={article.slug}
                article={article}
                showExcerpt={true}
                showReadingTime={true}
                showAuthor={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No articles found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
