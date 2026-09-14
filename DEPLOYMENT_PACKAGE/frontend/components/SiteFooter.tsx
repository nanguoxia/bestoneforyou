/**
 * Site Footer Component
 */

import { SiteConfig } from '@/types/article';
import Link from 'next/link';
import { X, Rss } from 'lucide-react';

interface SiteFooterProps {
  site: SiteConfig;
}

export function SiteFooter({ site }: SiteFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Us */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.svg"
                alt={site.name}
                width={40}
                height={40}
                className="h-10 w-10 rounded-lg object-cover shadow-md ring-1 ring-slate-200"
              />
              <span className="font-bold text-lg" style={{ fontFamily: 'var(--font-serif)' }}>
                {site.name}
              </span>
            </div>
            <p className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-inter)' }}>
              {site.description}
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider" style={{ fontFamily: 'var(--font-inter)' }}>
              Categories
            </h3>
            <ul className="space-y-2 text-sm">
              {site.categories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/category/${category.slug}`}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    style={{ fontFamily: 'var(--font-inter)' }}
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider" style={{ fontFamily: 'var(--font-inter)' }}>
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  style={{ fontFamily: 'var(--font-inter)' }}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  style={{ fontFamily: 'var(--font-inter)' }}
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  style={{ fontFamily: 'var(--font-inter)' }}
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider" style={{ fontFamily: 'var(--font-inter)' }}>
              Follow Us
            </h3>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="X"
              >
                <X className="h-5 w-5" />
              </a>
              <a
                href="/rss.xml"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="RSS"
              >
                <Rss className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-12 pt-8 border-t text-sm text-muted-foreground">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p style={{ fontFamily: 'var(--font-inter)' }}>
              © {currentYear} {site.name}. All rights reserved.
            </p>
            <div className="flex gap-4">
              <Link
                href="/privacy"
                className="hover:text-foreground transition-colors"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="hover:text-foreground transition-colors"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
