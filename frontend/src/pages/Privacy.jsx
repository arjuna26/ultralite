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
              <p className="text-caption mb-8 animate-fade-in animate-delay-100">Last updated: March 2026</p>

              <div className="card p-8">
                <div className="prose-custom space-y-6">
                  <section>
                    <h2 className="text-heading text-xl mb-3">Information We Collect</h2>
                    <p className="text-body">
                      We only collect what you choose to provide: your email address, optional profile details,
                      and the gear, bag, and trip data you save in the app.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-heading text-xl mb-3">How We Use Your Information</h2>
                    <p className="text-body">We use your information only to:</p>
                    <ul className="list-disc list-inside text-body space-y-2 mt-2" style={{ color: 'var(--color-neutral-600)' }}>
                      <li>Provide and operate the app features you request</li>
                      <li>Authenticate your account and keep it secure</li>
                      <li>Respond to support requests you initiate</li>
                      <li>Prevent abuse, fraud, or illegal activity</li>
                    </ul>
                    <p className="text-body mt-3">
                      We do not use your data for advertising, and we do not sell or rent your personal
                      information.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-heading text-xl mb-3">Data Storage and Security</h2>
                    <p className="text-body">
                      Your data is stored on secure servers. We use industry-standard encryption in transit
                      and apply access controls to protect your information.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-heading text-xl mb-3">Data Sharing</h2>
                    <p className="text-body">
                      We do not sell your data. We do not share it with advertisers. We only share data with
                      service providers that help us operate the app (for example, hosting or authentication),
                      and only as necessary to provide the service.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-heading text-xl mb-3">Your Rights and Control</h2>
                    <p className="text-body">
                      You can access, update, or delete your account data at any time. If you delete your
                      account, your personal data and saved gear/trip data are removed from our systems,
                      except where we must retain it for legal or security reasons.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-heading text-xl mb-3">Cookies</h2>
                    <p className="text-body">
                      We use essential cookies to keep you signed in and to run the app. We do not use
                      cross-site tracking cookies.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-heading text-xl mb-3">Changes to This Policy</h2>
                    <p className="text-body">
                      We may update this privacy policy from time to time. We will notify you of any 
                      changes by posting the new policy on this page and updating the "Last updated" date.
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
