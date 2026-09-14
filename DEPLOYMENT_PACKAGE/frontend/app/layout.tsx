import type { Metadata } from "next";
import { Inter, Playfair_Display, JetBrains_Mono, Oswald } from "next/font/google";
import "./globals.css";
import "./typography.css";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { siteConfig } from "@/config/site.config";
import { getAllArticles } from "@/lib/content";
// Cloudflare Web Analytics: 在 CF Dashboard > Web Analytics 获取 token
// 或直接在 CF 控制台注入脚本，无需代码改动

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

const oswald = Oswald({
  variable: "--font-oswald",
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 顶栏 Featured：自动取最新一篇文章
  const articles = await getAllArticles();
  const latest = [...articles].sort((a, b) => (a.date < b.date ? 1 : -1))[0];
  const featuredArticle = latest ? { title: latest.title, slug: latest.slug } : undefined;

  return (
    <html
      lang="en-US"
      className={`${inter.variable} ${playfair.variable} ${jetbrainsMono.variable} ${oswald.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-brand-bg">
        <SiteHeader site={siteConfig} featuredArticle={featuredArticle} />
        <main className="flex-1">{children}</main>
        <SiteFooter site={siteConfig} />
      </body>
    </html>
  );
}
