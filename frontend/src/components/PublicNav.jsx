import { Link } from 'react-router-dom';

export default function PublicNav() {
  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b" style={{ borderColor: 'var(--color-neutral-200)' }}>
        <div className="container">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 hover-scale">
              <img src="/favicon.svg" alt="UltraLite" className="w-8 h-8" />
              <span className="text-xl font-semibold" style={{ color: 'var(--color-neutral-900)' }}>UltraLite</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <Link to="/#features" className="nav-link hover-underline text-sm">Features</Link>
              <Link to="/#pricing" className="nav-link hover-underline text-sm">Pricing</Link>
              <Link to="/#reviews" className="nav-link hover-underline text-sm">Reviews</Link>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/login" className="btn btn-ghost btn-sm">Log in</Link>
              <Link to="/login" className="btn btn-primary btn-sm">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>
      {/* Gradient accent bar */}
      <div className="gradient-bar h-1 fixed top-16 left-0 right-0 z-40 opacity-80"></div>
    </>
  );
}
