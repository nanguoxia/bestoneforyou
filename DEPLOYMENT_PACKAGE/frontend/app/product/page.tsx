/**
 * 推广落地页 /product - 站内产品展示页（兼作投流落地页）
 * 风格与站点杂志风一致：衬线大标题 + 蓝橙金配色
 */

// 强制静态输出，Cloudflare Workers 没有 fs，不能动态渲染
export const dynamic = 'force-static';

import { siteConfig } from '@/config/site.config';
import { PRODUCTS } from '@/config/products.config';
import { ProductShowcase } from '@/components/ProductShowcase';

export async function generateMetadata() {
  return {
    title: 'Product Picks - ' + siteConfig.name,
    description:
      'Hand-picked health supplements worth buying — top-rated picks from Amazon, screened for ingredients, dosage and value by ' +
      siteConfig.name +
      ' editors.',
  };
}

export default function ProductPage() {
  const now = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-brand-bg">
      {/* Hero - 深色杂志风横幅（呼应顶栏工具条配色） */}
      <section className="bg-gradient-to-r from-brand-dark via-slate-900 to-brand-dark text-white py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <div
            className="inline-block text-xs tracking-[0.25em] uppercase text-brand-accent border border-brand-accent/40 rounded-full px-4 py-1.5 mb-6"
            style={{ fontFamily: 'var(--font-oswald)' }}
          >
            Editor&rsquo;s Selection · {now}
          </div>
          <h1
            className="font-bold text-white mb-5"
            style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.15, letterSpacing: '-0.02em' }}
          >
            Hand-Picked Health Essentials
          </h1>
          <p
            className="max-w-2xl mx-auto text-white/80 text-lg"
            style={{ fontFamily: 'var(--font-inter)', lineHeight: 1.6 }}
          >
            We compare ingredients, dosages and value across Amazon&rsquo;s best-selling supplements — so you
            only see the ones worth buying.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {['Ingredient-First Screening', 'Ships from Amazon', 'Checked for Value'].map((chip) => (
              <span
                key={chip}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/25 text-sm text-white/90"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                <span className="text-brand-accent">✦</span>
                {chip}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 产品展示区 */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-brand-dark mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
              Shop the Picks
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto" style={{ fontFamily: 'var(--font-inter)' }}>
              Top-rated supplements our editors actually recommend, updated regularly
            </p>
          </div>
          <ProductShowcase products={PRODUCTS} />
        </div>
      </section>
    </div>
  );
}
