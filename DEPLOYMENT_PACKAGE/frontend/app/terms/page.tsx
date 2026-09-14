import { siteConfig } from '@/config/site.config';

export async function generateMetadata() {
  return {
    title: 'Terms of Service - ' + siteConfig.name,
    description: 'Terms of Service of ' + siteConfig.name,
  };
}

export default function TermsPage() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-brand-bg py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-serif text-5xl font-bold text-brand-dark mb-8">
            Terms of Service
          </h1>

          <div className="bg-white rounded-lg shadow-sm p-8 space-y-8 text-muted-foreground">
            <section>
              <p className="text-sm">
                Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-brand-dark mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="leading-relaxed">
                By accessing and using {siteConfig.name} ("the Website"), you accept and agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Website.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-brand-dark mb-4">
                2. Changes to Terms
              </h2>
              <p className="leading-relaxed">
                We reserve the right to modify these Terms at any time. All changes are effective immediately when we post them. Your continued use of the Website following the posting of revised Terms means that you accept and agree to the changes.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-brand-dark mb-4">
                3. Use License
              </h2>
              <p className="leading-relaxed mb-4">Permission is granted to temporarily download one copy of the materials on {siteConfig.name} for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to reverse engineer any software contained on the website</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-brand-dark mb-4">
                4. User Content
              </h2>
              <p className="leading-relaxed mb-4">You may submit comments, feedback, or other content ("User Content") to the Website. By submitting User Content, you grant us a non-exclusive, royalty-free, perpetual, irrevocable, and fully sub-licensable right to use, reproduce, modify, adapt, publish, translate, create derivative works from, distribute, and display such User Content throughout the world.</p>
              <p className="leading-relaxed">
                You represent and warrant that you own or have the necessary licenses, rights, consents, and permissions to publish the User Content you submit.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-brand-dark mb-4">
                5. Disclaimer
              </h2>
              <p className="leading-relaxed mb-4">The materials on {siteConfig.name} are provided "as is". {siteConfig.name} makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
              <p className="leading-relaxed">
                Further, {siteConfig.name} does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its website or otherwise relating to such materials or on any sites linked to this site.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-brand-dark mb-4">
                6. Limitations
              </h2>
              <p className="leading-relaxed">
                In no event shall {siteConfig.name} or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on {siteConfig.name}, even if {siteConfig.name} or an authorized representative has been notified orally or in writing of the possibility of such damage.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-brand-dark mb-4">
                7. Accuracy of Materials
              </h2>
              <p className="leading-relaxed">
                The materials appearing on {siteConfig.name} could include technical, typographical, or photographic errors. We do not warrant that any of the materials on its website are accurate, complete, or current. We may make changes to the materials contained on its website at any time without notice.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-brand-dark mb-4">
                8. Links to Other Websites
              </h2>
              <p className="leading-relaxed">
                {siteConfig.name} has not reviewed all of the sites linked to our website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by {siteConfig.name} of the site. Use of any such linked website is at the user's own risk.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-brand-dark mb-4">
                9. Intellectual Property
              </h2>
              <p className="leading-relaxed mb-4">All content on this website, including text, graphics, logos, images, and software, is the property of {siteConfig.name} or its content suppliers and is protected by international copyright laws.</p>
              <p className="leading-relaxed">
                You may not reproduce, distribute, create derivative works, publicly display, or otherwise use any of the content on this website without our express written permission.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-brand-dark mb-4">
                10. Termination
              </h2>
              <p className="leading-relaxed">
                We may terminate or suspend access to our website immediately, without prior notice, for any breach of these Terms. Upon termination, your right to use the website will cease.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-brand-dark mb-4">
                11. Governing Law
              </h2>
              <p className="leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which {siteConfig.name} is based, without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-brand-dark mb-4">
                12. Contact Information
              </h2>
              <p className="leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at:
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
