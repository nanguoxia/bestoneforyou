/**
 * 图片滚动英雄区组件
 * 全屏背景图片 + 视差滚动效果
 */

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface ImageScrollHeroProps {
  title: string;
  subtitle: string;
  description: string;
  backgroundImage?: string;
  ctaText?: string;
  ctaLink?: string;
}

export function ImageScrollHero({
  title,
  subtitle,
  description,
  backgroundImage,
  ctaText = '探索更多',
  ctaLink = '#',
}: ImageScrollHeroProps) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="relative h-screen overflow-hidden">
      {/* 背景图片 - 视差效果 */}
      <div
        className="absolute inset-0 transform scale-110 bg-gradient-to-br from-brand-primary to-brand-secondary"
        style={{
          transform: `translateY(${scrollY * 0.5}px) scale(1.1)`,
          transition: 'transform 0.1s ease-out',
        }}
      >
        {backgroundImage && (
          <Image
            src={backgroundImage}
            alt={title}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
      </div>

      {/* 内容 */}
      <div className="relative h-full flex items-center justify-center text-white px-4">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <p className="text-sm md:text-base font-semibold tracking-[0.3em] uppercase text-brand-accent animate-fade-in">
            {subtitle}
          </p>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold leading-tight animate-slide-up">
            {title}
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed animate-slide-up-delayed">
            {description}
          </p>
          {ctaText && ctaLink && (
            <Link
              href={ctaLink}
              className="inline-block mt-8 px-8 py-4 bg-brand-accent hover:bg-brand-accent/90 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg animate-fade-in-delayed"
            >
              {ctaText}
            </Link>
          )}
        </div>
      </div>

      {/* 滚动指示器 */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
          <div className="w-1 h-3 bg-white/70 rounded-full animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}
