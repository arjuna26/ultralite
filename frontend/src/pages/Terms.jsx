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
              <p className="text-caption mb-8 animate-fade-in animate-delay-100">Last updated: March 2026</p>

              <div className="card p-8">
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
                      <li>Scrape, harvest, or bulk export data from the service</li>
                      <li>Reverse engineer, decompile, or copy the service or its features</li>
                      <li>Use the service to create or improve a competing product using our data or UI</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-heading text-xl mb-3">Intellectual Property</h2>
                    <p className="text-body">
                      The service and its original content, features, and functionality are owned by
                      UltraLite and are protected by intellectual property laws. These terms do not grant
                      you any right to use our brand, logos, designs, or app concept outside of normal
                      use of the service.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-heading text-xl mb-3">User Content</h2>
                    <p className="text-body">
                      You retain ownership of the content you create. You grant us a limited license to
                      store, process, and display your content solely to provide the service to you.
                      We do not sell your content or use it for advertising.
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
                      We may update these terms. We will post updates here and update the "Last updated"
                      date. Your continued use of the service means you accept the updated terms.
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
