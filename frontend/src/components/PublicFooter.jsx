import { Link } from 'react-router-dom';

export default function PublicFooter() {
  return (
    <footer className="section-sm" style={{ backgroundColor: 'var(--color-neutral-950)' }}>
      <div className="container">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src="/favicon.svg" alt="UltraLite" className="w-8 h-8" />
              <span className="text-xl font-semibold text-white">UltraLite</span>
            </Link>
            <p className="text-sm" style={{ color: 'var(--color-neutral-400)' }}>
              Pack smarter, hike lighter. The gear management app for outdoor enthusiasts.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2">
              <li><Link to="/#features" className="text-sm hover:text-white transition-colors" style={{ color: 'var(--color-neutral-400)' }}>Features</Link></li>
              <li><Link to="/#pricing" className="text-sm hover:text-white transition-colors" style={{ color: 'var(--color-neutral-400)' }}>Pricing</Link></li>
              <li><Link to="/#reviews" className="text-sm hover:text-white transition-colors" style={{ color: 'var(--color-neutral-400)' }}>Reviews</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm hover:text-white transition-colors" style={{ color: 'var(--color-neutral-400)' }}>Gear Guide</a></li>
              <li><a href="#" className="text-sm hover:text-white transition-colors" style={{ color: 'var(--color-neutral-400)' }}>Ultralight Tips</a></li>
              <li><a href="#" className="text-sm hover:text-white transition-colors" style={{ color: 'var(--color-neutral-400)' }}>Community</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-sm hover:text-white transition-colors" style={{ color: 'var(--color-neutral-400)' }}>About</Link></li>
              <li><Link to="/privacy" className="text-sm hover:text-white transition-colors" style={{ color: 'var(--color-neutral-400)' }}>Privacy</Link></li>
              <li><Link to="/terms" className="text-sm hover:text-white transition-colors" style={{ color: 'var(--color-neutral-400)' }}>Terms</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4" 
             style={{ borderColor: 'var(--color-neutral-800)' }}>
          <p className="text-sm" style={{ color: 'var(--color-neutral-500)' }}>
            © {new Date().getFullYear()} UltraLite. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
