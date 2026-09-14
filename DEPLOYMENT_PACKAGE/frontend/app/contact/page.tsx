import { siteConfig } from '@/config/site.config';

export async function generateMetadata() {
  return {
    title: 'Contact Us - ' + siteConfig.name,
    description: 'Get in touch with the ' + siteConfig.name + ' team. We\'d love to hear from you!',
  };
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-brand-bg py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-serif text-5xl font-bold text-brand-dark mb-8">
            Contact Us
          </h1>

          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="mb-8">
              <h2 className="font-serif text-2xl font-bold text-brand-dark mb-4">
                Get in Touch
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Have a question, suggestion, or just want to say hello? We'd love to hear from you! Fill out the form below and we'll get back to you as soon as possible.
              </p>
            </div>

            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-brand-dark mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-brand-dark mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-brand-dark mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition"
                  placeholder="How can we help?"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-brand-dark mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition resize-none"
                  placeholder="Tell us more..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-brand-primary text-white font-semibold py-3 px-6 rounded-lg hover:bg-brand-primary/90 transition-colors"
              >
                Send Message
              </button>
            </form>

            <div className="mt-8 pt-8 border-t">
              <h3 className="font-semibold text-brand-dark mb-4">Other Ways to Reach Us</h3>
              <div className="space-y-3 text-muted-foreground">
                <p>Follow us on social media for daily training inspiration and tips</p>
                <p>Email us directly at: contact@bestoneforyou.space</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
