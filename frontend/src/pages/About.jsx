import { Link } from 'react-router-dom';
import PublicNav from '../components/PublicNav';
import PublicFooter from '../components/PublicFooter';

export default function About() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-surface-primary)' }}>
      <PublicNav />
      
      <main className="flex-1 pt-20">
        {/* Hero */}
        <section className="section hero-gradient">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-display text-4xl md:text-5xl mb-6 animate-fade-in" style={{ color: 'var(--color-neutral-900)' }}>
                About UltraLite
              </h1>
              <p className="text-body text-lg animate-fade-in animate-delay-100">
                Built by backpackers, for backpackers. We're on a mission to help outdoor enthusiasts 
                pack smarter and hike lighter.
              </p>
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="section-sm">
          <div className="container">
            <div className="max-w-2xl mx-auto">
              <div className="card p-8 scroll-reveal">
                <h2 className="text-heading text-2xl mb-4">Our Story</h2>
                <div className="space-y-4 text-body">
                  <p>
                    UltraLite was born from frustration. Like many backpackers, we used to manage our gear 
                    in spreadsheets, scribbled notes, and mental lists. Every trip meant starting from scratch, 
                    trying to remember what worked and what didn't.
                  </p>
                  <p>
                    We built UltraLite to solve this problem. A simple, focused tool that lets you build gear 
                    configurations, track their exact weight, and reuse what works. No bloat, no complexity—just 
                    the essentials for getting out there with a lighter pack.
                  </p>
                  <p>
                    Whether you're a weekend warrior or a thru-hiker, UltraLite helps you make informed decisions 
                    about every gram you carry.
                  </p>
                </div>
              </div>

              <div className="card p-8 mt-6 scroll-reveal">
                <h2 className="text-heading text-2xl mb-4">Our Values</h2>
                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" 
                         style={{ backgroundColor: 'var(--color-primary-100)', color: 'var(--color-primary-600)' }}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium" style={{ color: 'var(--color-neutral-900)' }}>Simplicity First</h3>
                      <p className="text-sm text-body">We build only what's necessary. No feature bloat.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" 
                         style={{ backgroundColor: 'var(--color-primary-100)', color: 'var(--color-primary-600)' }}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium" style={{ color: 'var(--color-neutral-900)' }}>Data Accuracy</h3>
                      <p className="text-sm text-body">Verified gear weights from reliable sources.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" 
                         style={{ backgroundColor: 'var(--color-primary-100)', color: 'var(--color-primary-600)' }}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium" style={{ color: 'var(--color-neutral-900)' }}>Community Driven</h3>
                      <p className="text-sm text-body">Built with feedback from real backpackers.</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="text-center mt-12 scroll-reveal">
                <p className="text-body mb-4">Ready to lighten your load?</p>
                <Link to="/login" className="btn btn-primary">Get Started Free</Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
