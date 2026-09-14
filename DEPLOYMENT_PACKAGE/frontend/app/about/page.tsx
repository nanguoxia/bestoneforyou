import { siteConfig } from '@/config/site.config';
import Link from 'next/link';

export async function generateMetadata() {
  return {
    title: 'About Us - ' + siteConfig.name,
    description: 'Learn about ' + siteConfig.name + ' and our mission to provide the best fitness, nutrition, and wellness guidance.',
  };
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-brand-bg py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-serif text-5xl font-bold text-brand-dark mb-8">
            About Us
          </h1>

          <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
            <section>
              <h2 className="font-serif text-2xl font-bold text-brand-dark mb-4">
                Our Mission
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                At {siteConfig.name}, we believe that fitness is more than just working out—it's about building strength, boosting energy, and becoming the healthiest version of yourself. Our mission is to provide comprehensive, evidence-based, and motivating health and fitness information that helps you train smarter and live better.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-brand-dark mb-4">
                What We Offer
              </h2>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start">
                  <span className="text-brand-primary mr-3">✓</span>
                  <span>Expertly designed training plans and workout programs</span>
                </li>
                <li className="flex items-start">
                  <span className="text-brand-primary mr-3">✓</span>
                  <span>Up-to-date nutrition guidance and healthy eating tips</span>
                </li>
                <li className="flex items-start">
                  <span className="text-brand-primary mr-3">✓</span>
                  <span>Honest gear reviews and recommendations</span>
                </li>
                <li className="flex items-start">
                  <span className="text-brand-primary mr-3">✓</span>
                  <span>Practical advice for athletes of all fitness levels</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-brand-dark mb-4">
                Our Team
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Our team consists of certified trainers, sports scientists, nutritionists, and passionate athletes who have helped people of all levels reach their goals. We combine firsthand coaching experience with thorough research to bring you content that is both motivating and practical.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-brand-dark mb-4">
                Contact Us
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We'd love to hear from you! Whether you have questions, suggestions, or just want to share your fitness journey, feel free to <Link href="/contact" className="text-brand-primary hover:underline">get in touch</Link>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
