/**
 * 搜索页 - Google Programmable Search
 *
 * 配置了 NEXT_PUBLIC_SEARCH_CX（搜索引擎 ID）时，内嵌 Google 搜索结果；
 * 未配置时，自动跳转到 Google site: 限定搜索（零配置兜底）。
 *
 * 获取 CX：https://programmablesearchengine.google.com/
 *   新建搜索引擎 → 站点填 bestoneforyou.space/* → 复制"搜索引擎 ID"
 */

'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { siteConfig } from '@/config/site.config';

function SearchResults() {
  const params = useSearchParams();
  const q = params.get('q') || '';
  const cx = process.env.NEXT_PUBLIC_SEARCH_CX || '';
  const domain = siteConfig.url.replace(/^https?:\/\//, '').replace(/\/$/, '');

  useEffect(() => {
    // 未配置 CX：跳转 Google site: 限定搜索
    if (!cx && q) {
      window.location.replace(
        `https://www.google.com/search?q=${encodeURIComponent(`site:${domain} ${q}`)}`
      );
      return;
    }
    // 已配置 CX：加载 Programmable Search 脚本（results-only 模式自动读取 ?q=）
    if (cx && !document.getElementById('gcse-script')) {
      const s = document.createElement('script');
      s.async = true;
      s.src = `https://cse.google.com/cse.js?cx=${encodeURIComponent(cx)}`;
      s.id = 'gcse-script';
      document.body.appendChild(s);
    }
  }, [cx, q, domain]);

  if (!q) {
    return (
      <p className="text-muted-foreground">
        请输入关键词进行搜索。返回{' '}
        <Link href="/" className="text-brand-primary hover:underline">首页</Link>。
      </p>
    );
  }

  if (!cx) {
    return (
      <p className="text-muted-foreground">
        正在跳转 Google 搜索 “{q}”… 如果没有自动跳转，{' '}
        <a
          href={`https://www.google.com/search?q=${encodeURIComponent(`site:${domain} ${q}`)}`}
          className="text-brand-primary hover:underline"
        >
          点这里
        </a>
      </p>
    );
  }

  return <div className="gcse-searchresults-only" />;
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-brand-bg py-12">
      <div className="container mx-auto px-4">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-brand-dark mb-8" style={{ fontFamily: 'var(--font-serif)' }}>
          Search
        </h1>
        <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6 min-h-[300px]">
          <Suspense fallback={<p className="text-muted-foreground">加载中…</p>}>
            <SearchResults />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
