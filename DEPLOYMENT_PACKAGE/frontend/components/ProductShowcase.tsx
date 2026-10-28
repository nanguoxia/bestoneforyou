/**
 * 推广产品展示组件 - 杂志风格（分类筛选 + 产品卡片）
 */

'use client';

import { useState } from 'react';
import { Product } from '@/config/products.config';

interface ProductShowcaseProps {
  products: Product[];
}

export function ProductShowcase({ products }: ProductShowcaseProps) {
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];
  const countOf = (c: string) =>
    c === 'All' ? products.length : products.filter((p) => p.category === c).length;
  const visible = activeCategory === 'All' ? products : products.filter((p) => p.category === activeCategory);

  return (
    <div>
      {/* 分类筛选 Tab */}
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            className={`px-5 py-2 rounded-full border text-sm uppercase tracking-wider transition-all ${
              activeCategory === c
                ? 'bg-brand-primary border-brand-primary text-white shadow-md'
                : 'bg-white border-slate-200 text-brand-dark hover:border-brand-primary hover:text-brand-primary'
            }`}
            style={{ fontFamily: 'var(--font-oswald)' }}
          >
            {c}
            <span className={`ml-2 ${activeCategory === c ? 'text-white/70' : 'text-muted-foreground'}`}>
              ({countOf(c)})
            </span>
          </button>
        ))}
      </div>

      {/* 产品卡片网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {visible.map((p) => (
          <article
            key={p.link}
            className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-soft transition-all duration-300 border border-slate-100"
          >
            {/* 产品图（亚马逊白底图，用 contain 保持完整） */}
            <div className="relative aspect-square bg-white border-b border-slate-100 p-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.image}
                alt={p.name}
                loading="lazy"
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
              />
              {/* 分类标签 */}
              <div className="absolute top-3 left-3 z-10">
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold shadow-md">
                  <span>{p.categoryIcon}</span>
                  <span className="text-brand-dark">{p.category}</span>
                </span>
              </div>
              {/* 价格徽章 */}
              <div className="absolute top-3 right-3 z-10">
                <span className="inline-flex items-center px-2.5 py-1 bg-brand-accent/90 backdrop-blur-sm rounded-full text-xs font-bold text-white shadow-md">
                  ${p.price.toFixed(2)}
                </span>
              </div>
            </div>

            {/* 内容区 */}
            <div className="flex flex-col flex-1 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-primary mb-1.5" style={{ fontFamily: 'var(--font-inter)' }}>
                {p.brand}
              </p>
              <h3
                className="font-serif text-lg font-semibold text-brand-dark leading-tight mb-3 group-hover:text-brand-primary transition-colors line-clamp-2"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {p.name}
              </h3>

              <ul className="space-y-1.5 mb-4">
                {p.points.map((pt) => (
                  <li key={pt} className="flex items-start gap-2 text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-inter)' }}>
                    <span className="text-brand-primary font-bold">✓</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="leading-none">
                  <span className="font-serif text-2xl font-bold text-brand-dark">${p.price.toFixed(2)}</span>
                  <span className="block text-xs text-muted-foreground mt-1">on Amazon</span>
                </div>
                <a
                  href={p.link}
                  target="_blank"
                  rel="noopener sponsored"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-brand-primary text-white text-sm font-semibold rounded-full hover:bg-brand-primary/90 transition-all"
                  style={{ fontFamily: 'var(--font-inter)' }}
                >
                  View on Amazon
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* 联盟披露 */}
      <p className="mt-12 text-center text-xs text-muted-foreground max-w-2xl mx-auto" style={{ fontFamily: 'var(--font-inter)' }}>
        Affiliate Disclosure: As an Amazon Associate, we may earn from qualifying purchases made through
        links on this page. Prices shown are indicative and may change — see Amazon for the current price.
      </p>
    </div>
  );
}
