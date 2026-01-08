import PublicNav from '../components/PublicNav';
import PublicFooter from '../components/PublicFooter';

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-surface-primary)' }}>
      <PublicNav />
      
      <main className="flex-1 pt-20">
        <section className="section">
          <div className="container">
            <div className="max-w-2xl mx-auto">
              <h1 className="text-display text-4xl mb-2 animate-fade-in" style={{ color: 'var(--color-neutral-900)' }}>
                Terms of Service
              </h1>
              <p className="text-caption mb-8 animate-fade-in animate-delay-100">Last updated: January 2026</p>

              <div className="card p-8 scroll-reveal">
                <div className="prose-custom space-y-6">
                  <section>
                    <h2 className="text-heading text-xl mb-3">Acceptance of Terms</h2>
                    <p className="text-body">
                      By accessing or using UltraLite, you agree to be bound by these Terms of Service. 
                      If you do not agree to these terms, please do not use our service.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-heading text-xl mb-3">Description of Service</h2>
                    <p className="text-body">
                      UltraLite is a gear management application that allows users to create, track, and 
                      manage backpacking gear configurations. We provide tools to track weight, organize 
                      trips, and optimize packing lists.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-heading text-xl mb-3">User Accounts</h2>
                    <p className="text-body">
                      You are responsible for maintaining the confidentiality of your account credentials 
                      and for all activities that occur under your account. You must notify us immediately 
                      of any unauthorized use of your account.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-heading text-xl mb-3">Acceptable Use</h2>
                    <p className="text-body">You agree not to:</p>
                    <ul className="list-disc list-inside text-body space-y-2 mt-2" style={{ color: 'var(--color-neutral-600)' }}>
                      <li>Use the service for any unlawful purpose</li>
                      <li>Attempt to gain unauthorized access to our systems</li>
                      <li>Interfere with the proper functioning of the service</li>
                      <li>Upload malicious code or content</li>
                      <li>Impersonate another person or entity</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-heading text-xl mb-3">Intellectual Property</h2>
                    <p className="text-body">
                      The service and its original content, features, and functionality are owned by 
                      UltraLite and are protected by international copyright, trademark, and other 
                      intellectual property laws.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-heading text-xl mb-3">User Content</h2>
                    <p className="text-body">
                      You retain ownership of any content you create using our service, including gear 
                      configurations and trip data. By using our service, you grant us a license to 
                      store and display your content as necessary to provide the service.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-heading text-xl mb-3">Disclaimer</h2>
                    <p className="text-body">
                      The service is provided "as is" without warranties of any kind. Gear weight data 
                      is provided for informational purposes and may not be 100% accurate. Always verify 
                      critical gear specifications with manufacturers.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-heading text-xl mb-3">Limitation of Liability</h2>
                    <p className="text-body">
                      UltraLite shall not be liable for any indirect, incidental, special, consequential, 
                      or punitive damages resulting from your use of or inability to use the service.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-heading text-xl mb-3">Changes to Terms</h2>
                    <p className="text-body">
                      We reserve the right to modify these terms at any time. We will notify users of 
                      significant changes via email or through the service. Continued use of the service 
                      after changes constitutes acceptance of the new terms.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-heading text-xl mb-3">Contact</h2>
                    <p className="text-body">
                      Questions about these terms? Contact us at{' '}
                      <a href="mailto:legal@ultralite.app" className="font-medium" style={{ color: 'var(--color-primary-600)' }}>
                        legal@ultralite.app
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
