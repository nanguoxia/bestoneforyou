/**
 * Newsletter订阅组件
 * 邮件订阅表单
 */

'use client';

import { useState } from 'react';

interface NewsletterSubscribeProps {
  title?: string;
  description?: string;
  placeholder?: string;
  buttonText?: string;
}

export function NewsletterSubscribe({
  title = 'Subscribe to Your Health Journey',
  description = 'Get the latest training tips, nutrition advice, and recovery strategies',
  placeholder = 'Enter your email address',
  buttonText = 'Subscribe Now',
}: NewsletterSubscribeProps) {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 这里添加实际的订阅逻辑
    setIsSubscribed(true);
    setTimeout(() => setIsSubscribed(false), 3000);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-brand-primary to-brand-secondary text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          {/* 图标 */}
          <div className="mb-6">
            <svg className="w-16 h-16 mx-auto text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          {/* Title */}
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
            {title}
          </h2>

          {/* Description */}
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto" style={{ fontFamily: 'var(--font-inter)', lineHeight: '1.6' }}>
            {description}
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={placeholder}
              required
              className="flex-1 px-6 py-4 rounded-full text-brand-dark placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-brand-accent/50"
              style={{ fontFamily: 'var(--font-inter)' }}
            />
            <button
              type="submit"
              className="px-8 py-4 bg-brand-accent hover:bg-brand-accent/90 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg whitespace-nowrap btn-text"
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              {buttonText}
            </button>
          </form>

          {/* Success Message */}
          {isSubscribed && (
            <div className="mt-6 p-4 bg-white/20 rounded-lg inline-block">
              <p className="font-semibold">✓ Successfully subscribed! Thank you for joining us.</p>
            </div>
          )}

          {/* Privacy Note */}
          <p className="mt-6 text-sm text-white/70">
            We respect your privacy and you can unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  );
}
