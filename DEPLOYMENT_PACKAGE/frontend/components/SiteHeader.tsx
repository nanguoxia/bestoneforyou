/**
 * 站点头部组件 - 杂志风格导航栏
 */

'use client';

import { SiteConfig } from '@/types/article';
import Link from 'next/link';
import { Search, Menu, X, User, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SiteHeaderProps {
  site: SiteConfig;
}

export function SiteHeader({ site }: SiteHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200">
      {/* Top Toolbar */}
      <div className="bg-gradient-to-r from-brand-dark via-slate-900 to-brand-dark text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-9 text-xs">
            <div className="flex items-center space-x-4">
              <span className="opacity-90">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <span className="hidden lg:inline opacity-50">|</span>
              <span className="hidden lg:inline text-brand-accent font-medium">Featured: 12-Week Strength Training Blueprint</span>
            </div>
            <div className="flex items-center space-x-5">
              <button className="hover:text-brand-accent transition-colors font-medium tracking-wide">SUBSCRIBE</button>
              <button className="hover:text-brand-accent transition-colors font-medium tracking-wide">SIGN IN</button>
              <div className="hidden md:flex items-center space-x-2 pl-4 border-l border-white/20">
                <Globe className="h-3 w-3 opacity-70" />
                <span className="opacity-90">English</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主导航区域 */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          {/* Logo 和搜索 */}
          <div className="flex items-center justify-between py-5">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.jpg"
                alt={site.name}
                width={56}
                height={56}
                className="h-14 w-14 rounded-lg object-cover shadow-md ring-1 ring-slate-100"
              />
              <div>
                <h1 className="font-serif text-3xl font-bold text-brand-dark leading-none tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>
                  {site.name}
                </h1>
                <p className="text-[10px] text-muted-foreground mt-1 tracking-widest uppercase" style={{ fontFamily: 'var(--font-inter)' }}>
                  Train Smarter, Live Better
                </p>
              </div>
            </Link>

            {/* Search and User */}
            <div className="flex items-center space-x-2">
              <div className="hidden md:flex items-center bg-slate-100 rounded-full px-4 py-2">
                <Search className="h-4 w-4 text-muted-foreground mr-2" />
                <input
                  type="text"
                  placeholder="Search workouts, nutrition..."
                  className="bg-transparent text-sm outline-none w-48"
                />
              </div>
              <button
                className="hidden md:flex items-center justify-center p-2 text-brand-dark hover:text-brand-primary hover:bg-brand-light rounded-md transition-colors"
              >
                <User className="h-5 w-5" />
              </button>
              <button
                className="md:hidden flex items-center justify-center p-2 text-brand-dark rounded-md"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Main Navigation - Desktop */}
          <nav className="hidden md:block border-t border-slate-200">
            <ul className="flex items-center justify-between py-3 nav-link">
              {site.categories.map((category, index) => (
                <li key={category.id} className="flex items-center">
                  {index > 0 && <span className="mx-4 text-slate-300">/</span>}
                  <Link
                    href={`/category/${category.slug}`}
                    className="text-brand-dark hover:text-brand-primary transition-colors relative group text-lg font-light tracking-wider uppercase"
                    style={{ fontFamily: 'var(--font-oswald)' }}
                  >
                    {category.name}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-primary transition-all group-hover:w-full"></span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* 移动端菜单 */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 animate-slide-down">
          <nav className="container mx-auto px-4 py-6">
            <div className="space-y-1">
              {site.categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="block py-3 px-4 rounded-lg hover:bg-brand-light transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{category.icon}</span>
                      <div>
                        <p
                          className="text-base font-light text-brand-dark uppercase tracking-wider leading-tight"
                          style={{ fontFamily: 'var(--font-oswald)' }}
                        >
                          {category.name}
                        </p>
                        {category.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {category.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
