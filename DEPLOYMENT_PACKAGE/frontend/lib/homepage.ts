/**
 * 首页数据处理工具
 * 自动根据文章分类和发布时间组织首页内容
 */

import { homepageConfig } from '@/config/homepage.config';

// 使用简化的 Article 接口
export interface Article {
  slug: string;
  title: string;
  date: string;
  category: string;
  tags: string[];
  author: string;
  featuredImage: string;
  excerpt: string;
  content?: string;  // 列表场景不需要正文
  contentLength?: number;  // 正文字符数，用于列表页估算阅读时间
}

// 首页配置
export interface HomepageConfig {
  stats: {
    domains: number;
    articlesPerDay: number;
    countries: number;
    updateFrequency: string;
  };
  sections: {
    hero: {
      enabled: boolean;
      title: string;
      subtitle: string;
      description: string;
    };
    featured: {
      enabled: boolean;
      count: number;
      category?: string;
    };
    latest: {
      enabled: boolean;
      count: number;
    };
    timeline: {
      enabled: boolean;
      articleSlug: string;
    };
    destinations: {
      enabled: boolean;
      categories: string[];
      count: number;
    };
  };
}

/**
 * 根据分类筛选文章（支持模糊匹配）
 */
export function getArticlesByCategory(
  articles: Article[],
  categoryName: string
): Article[] {
  const categoryLower = categoryName.toLowerCase();
  return articles.filter((article) => {
    const articleCategory = article.category.toLowerCase();
    return (
      articleCategory === categoryLower ||
      articleCategory.includes(categoryLower) ||
      categoryLower.includes(articleCategory)
    );
  });
}

/**
 * 根据分类列表筛选文章
 */
export function getArticlesByCategories(
  articles: Article[],
  categories: string[]
): Article[] {
  return articles.filter((article) => {
    const articleCategory = article.category.toUpperCase();
    return categories.some((cat) =>
      articleCategory.includes(cat.toUpperCase())
    );
  });
}

/**
 * 获取精选文章（最新发布的前N篇）
 */
export function getFeaturedArticles(
  articles: Article[],
  count: number = 3
): Article[] {
  return [...articles]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, count);
}

/**
 * 获取最新文章（排除精选文章后的前N篇）
 */
export function getLatestArticles(
  articles: Article[],
  excludeCount: number = 3,
  count: number = 9
): Article[] {
  return [...articles]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(excludeCount, excludeCount + count);
}

/**
 * 根据标签获取相关文章
 */
export function getArticlesByTag(
  articles: Article[],
  tag: string,
  limit: number = 3
): Article[] {
  return articles
    .filter((article) => article.tags.some((t) => t.toLowerCase().includes(tag.toLowerCase())))
    .slice(0, limit);
}

/**
 * 获取目的地推荐文章
 */
export function getDestinationArticles(
  articles: Article[],
  categories: string[] = homepageConfig.categoryMapping.destinations,
  count: number = 6
): Article[] {
  return getArticlesByCategories(articles, categories)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, count);
}

/**
 * 获取攻略类文章
 */
export function getGuideArticles(
  articles: Article[],
  count: number = 4
): Article[] {
  return getArticlesByCategories(articles, homepageConfig.categoryMapping.guides)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, count);
}

/**
 * 获取推荐行程文章（包含详细行程信息的文章）
 */
export function getItineraryArticles(
  articles: Article[],
  count: number = 3
): Article[] {
  return articles
    .filter((article) => detectItineraryArticle(article))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, count);
}

/**
 * 自动检测文章是否为行程类文章（用于时间线展示）
 */
export function detectItineraryArticle(article: Article): boolean {
  const { itineraryKeywords } = homepageConfig.autoDetection;
  const titleLower = article.title.toLowerCase();
  const tagsLower = article.tags.map((t) => t.toLowerCase());
  const excerptLower = (article.excerpt || '').toLowerCase();

  return (
    itineraryKeywords.some((keyword) => titleLower.includes(keyword)) ||
    tagsLower.some((tag) =>
      itineraryKeywords.some((keyword) => tag.includes(keyword))
    ) ||
    itineraryKeywords.some((keyword) => excerptLower.includes(keyword))
  );
}

/**
 * 获取首页统计信息
 */
export function getHomepageStats(articles: Article[]) {
  const categories = new Set(articles.map((a) => a.category));

  return {
    totalArticles: articles.length,
    totalCategories: categories.size,
    totalDomains: 1, // 独立站点
    latestArticle: articles[0] ? new Date(articles[0].date) : new Date(),
  };
}

/**
 * 智能分组文章（用于首页展示）
 */
export function groupArticlesForHomepage(articles: Article[]) {
  // 按分类分组
  const groupedByCategory = new Map<string, Article[]>();

  articles.forEach((article) => {
    const category = article.category;
    if (!groupedByCategory.has(category)) {
      groupedByCategory.set(category, []);
    }
    groupedByCategory.get(category)!.push(article);
  });

  // 每个分类按时间排序
  groupedByCategory.forEach((categoryArticles) => {
    categoryArticles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  return groupedByCategory;
}

/**
 * 获取首页各模块的文章（智能版本，跨区块去重）
 * 核心规则：每篇文章只出现在一个区块中，避免首页重复
 * @param articles 所有文章
 * @param excludeSlugs 需要预先排除的文章 slug（如已被 Hero 横幅使用的文章）
 */
export function getHomepageArticles(articles: Article[], excludeSlugs: string[] = []) {
  const sortedArticles = [...articles].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const usedSlugs = new Set<string>(excludeSlugs);

  // 辅助函数：从候选文章中排除已使用的，并标记新使用的
  const pickUnique = (candidates: Article[], count: number): Article[] => {
    const picked = candidates
      .filter((a) => !usedSlugs.has(a.slug))
      .slice(0, count);
    picked.forEach((a) => usedSlugs.add(a.slug));
    return picked;
  };

  // 1. 精选区（Featured This Week）：排除已使用的文章后取最新
  const hero = pickUnique(
    [...sortedArticles].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    ),
    homepageConfig.limits.hero
  );

  // 2. 目的地推荐：分类匹配 + 排除已使用
  const destinationCandidates = getDestinationArticles(
    sortedArticles,
    homepageConfig.categoryMapping.destinations,
    sortedArticles.length // 不限制，由 pickUnique 控制
  );
  const destinations = pickUnique(destinationCandidates, homepageConfig.limits.destinations);

  // 3. 行程推荐：关键词匹配 + 排除已使用
  const itineraryCandidates = getItineraryArticles(
    sortedArticles,
    sortedArticles.length
  );
  const itineraries = pickUnique(itineraryCandidates, homepageConfig.limits.itineraries || 6);

  // 4. 攻略指南：分类匹配 + 排除已使用
  const guideCandidates = getGuideArticles(
    sortedArticles,
    sortedArticles.length
  );
  const guides = pickUnique(guideCandidates, homepageConfig.limits.guides);

  // 5. 最新文章：排除所有已出现在上方区块的文章
  const latest = pickUnique(sortedArticles, homepageConfig.limits.latest);

  return {
    hero,
    latest,
    destinations,
    guides,
    itineraries,
    all: sortedArticles,
  };
}

/**
 * 自动提取时间线数据（从文章内容中提取）
 */
export function extractTimelineFromArticle(article: Article) {
  // 这里可以添加逻辑从文章内容中提取行程信息
  // 目前返回模拟数据
  return [
    {
      time: 'Day 1',
      title: '抵达目的地',
      description: article.excerpt || '开始您的旅程',
      icon: '✈️',
    },
  ];
}

/**
 * 检查是否应该显示某个模块
 */
export function shouldShowModule(moduleName: keyof typeof homepageConfig.modules): boolean {
  return homepageConfig.modules[moduleName] !== false;
}

/**
 * 获取配置的模块文章数量
 */
export function getModuleLimit(moduleName: keyof typeof homepageConfig.limits): number {
  return homepageConfig.limits[moduleName] || 3;
}
