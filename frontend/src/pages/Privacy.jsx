import PublicNav from '../components/PublicNav';
import PublicFooter from '../components/PublicFooter';

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-surface-primary)' }}>
      <PublicNav />
      
      <main className="flex-1 pt-20">
        <section className="section">
          <div className="container">
            <div className="max-w-2xl mx-auto">
              <h1 className="text-display text-4xl mb-2 animate-fade-in" style={{ color: 'var(--color-neutral-900)' }}>
                Privacy Policy
              </h1>
              <p className="text-caption mb-8 animate-fade-in animate-delay-100">Last updated: January 2026</p>

              <div className="card p-8 scroll-reveal">
                <div className="prose-custom space-y-6">
                  <section>
                    <h2 className="text-heading text-xl mb-3">Information We Collect</h2>
                    <p className="text-body">
                      We collect information you provide directly to us, including your email address when 
                      you create an account, and the gear configurations and trip data you choose to save.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-heading text-xl mb-3">How We Use Your Information</h2>
                    <p className="text-body">We use the information we collect to:</p>
                    <ul className="list-disc list-inside text-body space-y-2 mt-2" style={{ color: 'var(--color-neutral-600)' }}>
                      <li>Provide, maintain, and improve our services</li>
                      <li>Send you technical notices and support messages</li>
                      <li>Respond to your comments and questions</li>
                      <li>Protect against fraudulent or illegal activity</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-heading text-xl mb-3">Data Storage</h2>
                    <p className="text-body">
                      Your data is stored securely on servers located in the United States. We use 
                      industry-standard encryption for data in transit and at rest. We do not sell 
                      your personal information to third parties.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-heading text-xl mb-3">Your Rights</h2>
                    <p className="text-body">
                      You may access, update, or delete your account information at any time by logging 
                      into your account settings. You may also request a complete export of your data 
                      by contacting us.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-heading text-xl mb-3">Cookies</h2>
                    <p className="text-body">
                      We use essential cookies to maintain your session and remember your preferences. 
                      We do not use tracking cookies or share data with advertising networks.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-heading text-xl mb-3">Changes to This Policy</h2>
                    <p className="text-body">
                      We may update this privacy policy from time to time. We will notify you of any 
                      changes by posting the new policy on this page and updating the "Last updated" date.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-heading text-xl mb-3">Contact Us</h2>
                    <p className="text-body">
                      If you have any questions about this privacy policy, please contact us at{' '}
                      <a href="mailto:privacy@ultralite.app" className="font-medium" style={{ color: 'var(--color-primary-600)' }}>
                        privacy@ultralite.app
                      </a>
                    </p>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
