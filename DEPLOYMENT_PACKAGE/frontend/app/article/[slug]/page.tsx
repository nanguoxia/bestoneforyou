/**
 * 文章详情页
 */

// 强制静态输出
export const dynamic = 'force-static';

// 仅预渲染 generateStaticParams 返回的文章，未知 slug 直接 404。
// 避免 Worker 运行时尝试动态渲染文章页——运行时没有 fs，无法读取正文。
export const dynamicParams = false;

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getArticleBySlug, getAllArticles } from '@/lib/content';
import { siteConfig } from '@/config/site.config';
import { ArticleContent } from '@/components/ArticleContent';

export async function generateStaticParams() {
  const articles = await getAllArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return {
      title: 'Article Not Found',
    };
  }

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: [article.featuredImage],
      type: 'article',
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <article className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-[60vh] overflow-hidden">
        {article.featuredImage && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${article.featuredImage})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="container mx-auto">
            <div className="max-w-4xl">
              <span className="inline-block px-3 py-1 mb-4 text-sm font-semibold bg-brand-accent rounded-full">
                {article.category}
              </span>
              <h1 className="font-serif text-4xl md:text-6xl font-bold mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
                {article.title}
              </h1>
              <div className="flex items-center gap-4 text-sm">
                <span>By {article.author}</span>
                <span>•</span>
                <span>{new Date(article.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <ArticleContent content={article.content} />

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t">
              <h3 className="font-semibold mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-sm bg-brand-light rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Author Info */}
      <div className="container mx-auto px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-brand-light rounded-xl p-8">
            <h3 className="font-serif text-2xl font-bold mb-2">About the Author</h3>
            <p className="text-muted-foreground mb-4">{article.author}</p>
            <p className="text-sm text-muted-foreground">
              Certified fitness coach and health writer. Passionate about evidence-based training and helping people of all levels build stronger, healthier lives.
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
