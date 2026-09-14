/**
 * Markdown解析和渲染工具
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Article, ArticleMetadata } from '@/types/article';
import { slugify, getReadingTime } from './utils';

/**
 * 解析Markdown文件
 */
export async function parseMarkdownFile(
  filePath: string
): Promise<Article> {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContent);

  const metadata = data as ArticleMetadata;

  return {
    slug: metadata.slug || slugify(metadata.title),
    title: metadata.title,
    content,
    excerpt: metadata.excerpt || extractExcerpt(content, 150),
    category: metadata.category,
    publishedAt: new Date(metadata.publishedAt),
    updatedAt: new Date(metadata.updatedAt),
    author: metadata.author,
    tags: metadata.tags || [],
    featuredImage: metadata.featuredImage || '/images/default.jpg',
    seoTitle: metadata.seoTitle,
    seoDescription: metadata.seoDescription,
    canonical: metadata.canonical,
    readingTime: getReadingTime(content),
  };
}

/**
 * 从内容中提取摘要
 */
function extractExcerpt(content: string, maxLength: number = 150): string {
  // 移除Markdown语法
  const plainText = content
    .replace(/^#{1,6}\s+/gm, '') // 移除标题
    .replace(/\*\*([^*]+)\*\*/g, '$1') // 移除粗体
    .replace(/\*([^*]+)\*/g, '$1') // 移除斜体
    .replace(/!\[.*?\]\(.*?\)/g, '') // 移除图片
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 移除链接，保留文本
    .replace(/\n+/g, ' ') // 替换换行符
    .trim();

  if (plainText.length <= maxLength) {
    return plainText;
  }

  return plainText.slice(0, maxLength).trim() + '...';
}

/**
 * 获取目录下的所有Markdown文件
 */
export async function getMarkdownFiles(
  directory: string
): Promise<string[]> {
  const fullPath = path.join(process.cwd(), directory);

  if (!fs.existsSync(fullPath)) {
    return [];
  }

  const files = fs.readdirSync(fullPath);
  return files
    .filter(file => file.endsWith('.md'))
    .map(file => path.join(fullPath, file));
}
