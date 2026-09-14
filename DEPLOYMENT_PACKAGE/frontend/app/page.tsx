/**
 * 首页 - 智能自动更新版本
 * 根据文章分类和时间自动组织内容，无需手动维护
 */

// 强制静态输出，Cloudflare Workers 没有 fs，不能动态渲染
export const dynamic = 'force-static';

import { siteConfig } from '@/config/site.config';
import { getAllArticles } from '@/lib/content';
import {
  getHomepageArticles,
  groupArticlesForHomepage,
} from '@/lib/homepage';
import { ArticleCard } from '@/components/ArticleCard';
import { HeroGrid } from '@/components/HeroGrid';
import { ImageScrollHero } from '@/components/ImageScrollHero';
import { ItineraryCard } from '@/components/ItineraryCard';
import { NewsletterSubscribe } from '@/components/NewsletterSubscribe';
import Link from 'next/link';

export async function generateMetadata() {
  return {
    title: siteConfig.name,
    description: siteConfig.description,
  };
}

export default async function HomePage() {
  const articles = await getAllArticles();

  // 智能组织首页内容（排除已被 Hero 横幅使用的文章，确保全页去重）
  const heroBannerSlug = articles.length > 0 ? [articles[0].slug] : [];
  const homepageArticles = getHomepageArticles(articles, heroBannerSlug);
  const groupedCategories = groupArticlesForHomepage(articles);

  // 检查各分类是否有文章
  const hasDestinations = homepageArticles.destinations.length > 0;
  const hasGuides = homepageArticles.guides.length > 0;

  return (
    <div className="min-h-screen bg-brand-bg">
      {/* 1. Image Scroll Hero - Health & Fitness News */}
      <ImageScrollHero
        title={articles.length > 0 ? articles[0].title : 'Health & Fitness News & Insights'}
        subtitle="Train Smarter, Live Healthier"
        description={
          articles.length > 0
            ? articles[0].excerpt || 'In-depth coverage of fitness, nutrition, and wellness with expert training guides and practical health advice.'
            : 'In-depth coverage of fitness, nutrition, and wellness with expert training guides and practical health advice.'
        }
        backgroundImage={articles.length > 0 ? articles[0].featuredImage : ''}
        ctaText="Read Latest News"
        ctaLink={articles.length > 0 ? `/article/${articles[0].slug}` : `/`}
      />

      {/* 2. Featured This Week - Latest 3 Articles */}
      {homepageArticles.hero.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2
                className="font-bold text-brand-dark mb-4"
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '2.5rem',
                  lineHeight: '1.2',
                  letterSpacing: '-0.02em'
                }}
              >
                Featured This Week
              </h2>
              <p
                className="text-muted-foreground max-w-2xl mx-auto"
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: '1.125rem',
                  lineHeight: '1.6'
                }}
              >
                Handpicked quality content to power your fitness journey
              </p>
            </div>
            <HeroGrid featuredArticles={homepageArticles.hero} />
          </div>
        </section>
      )}

      {/* 3. Training & Workouts - FITNESS TRAINING / RUNNING Category */}
      {hasDestinations && homepageArticles.destinations.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-brand-dark mb-4">
                Training & Workouts
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Build strength, endurance, and confidence with expert-led workouts
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {homepageArticles.destinations.slice(0, 6).map((article, index) => (
                <div key={article.slug}>
                  <ArticleCard
                    article={article}
                    showExcerpt={true}
                    showReadingTime={true}
                    showAuthor={false}
                  />
                </div>
              ))}
            </div>
            {homepageArticles.destinations.length > 6 && (
              <div className="text-center mt-8">
                <Link
                  href="/category/fitness-training"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white font-semibold rounded-full hover:bg-brand-primary/90 transition-all"
                >
                  View More Workouts
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 4. Training Plans & Programs - Auto-detect Plan Articles */}
      {homepageArticles.itineraries.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-brand-dark mb-4">
                Training Plans & Programs
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Structured programs to guide you from day one to your goal
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {homepageArticles.itineraries.map((article) => (
                <ItineraryCard
                  key={article.slug}
                  article={article}
                />
              ))}
            </div>
            {homepageArticles.itineraries.length > 6 && (
              <div className="text-center mt-8">
                <Link
                  href="/category/running"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white font-semibold rounded-full hover:bg-brand-primary/90 transition-all"
                >
                  View More Plans
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 5. Practical Guides - Auto-filter Guide Articles */}
      {hasGuides && homepageArticles.guides.length > 0 && (
        <section className="py-16 bg-brand-bg">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-brand-dark">
                Practical Guides
              </h2>
              <Link
                href="/"
                className="text-sm text-brand-primary hover:underline font-medium"
              >
                View All Guides →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {homepageArticles.guides.map((article) => (
                <div key={article.slug}>
                  <ArticleCard
                    article={article}
                    showExcerpt={true}
                    showReadingTime={false}
                    showAuthor={false}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. More Articles - All Remaining Articles */}
      {homepageArticles.latest.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-brand-dark">
                Latest Articles
              </h2>
              <Link
                href="/"
                className="text-sm text-brand-primary hover:underline font-medium"
              >
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {homepageArticles.latest.map((article, index) => (
                <div
                  key={article.slug}
                  className={index === 0 ? 'md:col-span-2' : ''}
                >
                  <ArticleCard
                    article={article}
                    showExcerpt={true}
                    showReadingTime={true}
                    showAuthor={true}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. Empty State - Show when no articles */}
      {articles.length === 0 && (
        <section className="py-32">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto">
              <div className="text-6xl mb-6">🏋️</div>
              <h2 className="font-serif text-3xl font-bold text-brand-dark mb-4">
                Coming Soon
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                We're preparing exciting fitness and wellness content for you. Stay tuned for expert guides and training programs coming soon.
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Daily Updates</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Original Content</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                  </svg>
                  <span>All Fitness Levels</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 8. Newsletter Subscription */}
      <NewsletterSubscribe
        title="Subscribe to Your Health Journey"
        description="Get weekly training tips, nutrition advice, and recovery strategies to become the best version of yourself"
      />

    </div>
  );
}
