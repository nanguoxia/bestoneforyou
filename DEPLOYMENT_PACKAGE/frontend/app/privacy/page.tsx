import { siteConfig } from '@/config/site.config';

export async function generateMetadata() {
  return {
    title: 'Privacy Policy - ' + siteConfig.name,
    description: 'Privacy Policy of ' + siteConfig.name,
  };
}

export default function PrivacyPage() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-brand-bg py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-serif text-5xl font-bold text-brand-dark mb-8">
            Privacy Policy
          </h1>

          <div className="bg-white rounded-lg shadow-sm p-8 space-y-8 text-muted-foreground">
            <section>
              <p className="text-sm">
                Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-brand-dark mb-4">
                1. Introduction
              </h2>
              <p className="leading-relaxed">
                Welcome to {siteConfig.name} ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-brand-dark mb-4">
                2. Information We Collect
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-brand-dark mb-2">2.1 Information You Provide to Us</h3>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Contact information (name, email address) when you reach out to us</li>
                    <li>Comments and feedback you provide</li>
                    <li>Any other information you voluntarily provide</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-brand-dark mb-2">2.2 Information Automatically Collected</h3>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Device information (browser type, operating system)</li>
                    <li>Usage information (pages visited, time spent, referral source)</li>
                    <li>IP address and general location information</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-brand-dark mb-4">
                3. How We Use Your Information
              </h2>
              <p className="leading-relaxed mb-4">We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Respond to your comments, questions, and requests</li>
                <li>Analyze usage patterns to enhance user experience</li>
                <li>Monitor and analyze trends, usage, and activities</li>
                <li>Detect, prevent, and address technical issues and security threats</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-brand-dark mb-4">
                4. Cookies and Tracking Technologies
              </h2>
              <p className="leading-relaxed mb-4">
                We use cookies and similar tracking technologies to track activity on our website and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-brand-dark mb-2">4.1 Types of Cookies We Use</h3>
                  <ul className="list-disc list-inside space-y-2">
                    <li><strong>Essential cookies:</strong> Necessary for the website to function properly</li>
                    <li><strong>Analytical/performance cookies:</strong> Help us understand how visitors interact with our website</li>
                    <li><strong>Advertising cookies:</strong> Used to deliver advertisements relevant to you and your interests</li>
                    <li><strong>Third-party cookies:</strong> Placed by third-party services that appear on our website</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-brand-dark mb-2">4.2 Managing Cookies</h3>
                  <p className="leading-relaxed">
                    You can control and/or delete cookies as you wish through your browser settings. You can delete all cookies that are already on your computer, and you can set most browsers to prevent them from being placed. If you do this, however, you may have to manually adjust some preferences every time you visit our website.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-brand-dark mb-4">
                5. Third-Party Services
              </h2>
              <p className="leading-relaxed mb-4">We may use third-party services to help operate our website, including:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Analytics services (e.g., Google Analytics)</li>
                <li>Content delivery networks</li>
                <li>Hosting services</li>
                <li>Advertising services</li>
              </ul>
              <p className="leading-relaxed">
                These third parties have access to your Personal Information only to perform specific tasks on our behalf and are obligated not to disclose or use it for any other purpose.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-brand-dark mb-4">
                6. Third-Party Advertising
              </h2>
              <p className="leading-relaxed mb-4">
                We use third-party advertising companies to serve ads when you visit our website. These companies may use information about your visits to this and other websites to provide advertisements about goods and services of interest to you.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-brand-dark mb-2">6.1 How Third-Party Advertising Works</h3>
                  <p className="leading-relaxed">
                    Third-party advertising partners may use cookies, web beacons, or other tracking technologies to collect information about your activities on our website and other websites. This information may be used to provide you with personalized advertisements based on your interests.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-brand-dark mb-2">6.2 Opting Out of Personalized Advertising</h3>
                  <p className="leading-relaxed mb-2">
                    You can opt out of personalized advertising by visiting:
                  </p>
                  <ul className="list-disc list-inside space-y-2">
                    <li><a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">Digital Advertising Alliance (DAA)</a></li>
                    <li><a href="https://www.networkadvertising.org" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">Network Advertising Initiative (NAI)</a></li>
                    <li><a href="https://www.youronlinechoices.eu" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">Your Online Choices (EU)</a></li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-brand-dark mb-4">
                7. Google AdSense
              </h2>
              <p className="leading-relaxed mb-4">
                We use Google AdSense to display advertisements on our website. Google AdSense uses cookies to serve ads based on your prior visits to this website or other websites.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-brand-dark mb-2">7.1 Google's Use of Advertising Cookies</h3>
                  <p className="leading-relaxed">
                    Google uses cookies to serve ads on our site. Google's use of advertising cookies enables it and its partners to serve ads to you based on your visit to our sites and/or other sites on the Internet.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-brand-dark mb-2">7.2 How to Opt Out of Google AdSense Personalized Ads</h3>
                  <p className="leading-relaxed mb-2">
                    You can opt out of personalized advertising by visiting Google's Ads Settings. Alternatively, you can opt out of a third-party vendor's use of cookies for personalized advertising by visiting:
                  </p>
                  <ul className="list-disc list-inside space-y-2">
                    <li><a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">Google Ads Settings</a></li>
                    <li><a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">Digital Advertising Alliance</a></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-brand-dark mb-2">7.3 Google's Privacy Policy</h3>
                  <p className="leading-relaxed">
                    For more information about how Google handles data for advertising purposes, please refer to <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">Google's Privacy Policy</a> and <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">Google's Advertising Policies</a>.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-brand-dark mb-4">
                8. Data Security
              </h2>
              <p className="leading-relaxed">
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized or unlawful processing, accidental loss, destruction, or damage. However, no method of transmission over the Internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-brand-dark mb-4">
                9. Your Privacy Rights
              </h2>
              <p className="leading-relaxed mb-4">Depending on your location, you may have certain rights regarding your personal information, including:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>The right to access and receive a copy of your personal information</li>
                <li>The right to rectification of inaccurate information</li>
                <li>The right to request deletion of your personal information</li>
                <li>The right to object to processing of your personal information</li>
                <li>The right to data portability</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-brand-dark mb-4">
                10. Children's Privacy
              </h2>
              <p className="leading-relaxed">
                Our website is not intended for children under the age of 16. We do not knowingly collect personal information from children under 16. If you are a parent or guardian and you believe your child has provided us with personal information, please contact us.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-brand-dark mb-4">
                11. Changes to This Privacy Policy
              </h2>
              <p className="leading-relaxed">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-brand-dark mb-4">
                12. Contact Us
              </h2>
              <p className="leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <p className="mt-4">
                <a href="mailto:contact@bestoneforyou.space" className="text-brand-primary hover:underline">
                  contact@bestoneforyou.space
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
