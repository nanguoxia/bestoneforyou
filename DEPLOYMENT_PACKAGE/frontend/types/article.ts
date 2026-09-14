/**
 * 文章类型定义
 */

export interface Article {
  slug: string;
  title: string;
  content?: string;  // 列表场景不需要正文，仅文章详情页填充
  contentLength?: number;  // 正文字符数，用于列表页估算阅读时间，避免把正文打进 Worker bundle
  excerpt: string;
  category: string;
  date: string;  // 发布日期（字符串格式，从 Markdown frontmatter 读取）
  publishedAt?: Date;  // 可选的发布日期对象（用于兼容旧代码）
  updatedAt?: Date;  // 可选的更新日期对象
  author: string;
  tags: string[];
  featuredImage: string;
  seoTitle?: string;
  seoDescription?: string;
  canonical?: string;
  readingTime?: string;
  price?: string;
  rating?: number;
}

export interface ArticleMetadata {
  title: string;
  slug: string;
  category: string;
  publishedAt: string;
  updatedAt: string;
  author: string;
  tags: string[];
  excerpt: string;
  featuredImage: string;
  seoTitle?: string;
  seoDescription?: string;
  canonical?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
}

export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  categories: Category[];
}
