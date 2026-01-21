import { Link, useLocation } from 'react-router-dom';

export default function Navbar({ user, onLogout }) {
  const location = useLocation();
  
  const isActive = (path) => location.pathname.startsWith(path);
  
  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b" style={{ borderColor: 'var(--color-neutral-200)' }}>
      <div className="container">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Nav Links */}
          <div className="flex items-center gap-8">
          <Link to="/bags" className="flex items-center gap-2 hover-scale">
            <img src="/favicon.svg" alt="UltraLite" className="w-8 h-8" />
            <span className="text-xl font-semibold" style={{ color: 'var(--color-neutral-900)' }}>UltraLite</span>
          </Link>
            
            <div className="hidden md:flex items-center gap-1">
              <Link 
                to="/bags" 
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/bags')
                    ? ''
                    : 'hover:bg-neutral-100'
                }`}
                style={isActive('/bags') 
                  ? { backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary-700)' }
                  : { color: 'var(--color-neutral-600)' }
                }
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  My Bags
                </span>
              </Link>
              
              <Link 
                to="/trips" 
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/trips')
                    ? ''
                    : 'hover:bg-neutral-100'
                }`}
                style={isActive('/trips') 
                  ? { backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary-700)' }
                  : { color: 'var(--color-neutral-600)' }
                }
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  Trips
                </span>
              </Link>
              
              <Link 
                to="/gear" 
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/gear')
                    ? ''
                    : 'hover:bg-neutral-100'
                }`}
                style={isActive('/gear') 
                  ? { backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary-700)' }
                  : { color: 'var(--color-neutral-600)' }
                }
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Gear Catalog
                </span>
              </Link>
            </div>
          </div>
          
          {/* User Menu */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: 'var(--color-neutral-100)' }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium"
                   style={{ backgroundColor: 'var(--color-primary-200)', color: 'var(--color-primary-700)' }}>
                {((user.nickname && user.nickname.trim()) || user.email).charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium" style={{ color: 'var(--color-neutral-700)' }}>
                {(user.nickname && user.nickname.trim()) || user.email.split('@')[0]}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="btn btn-ghost btn-sm"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-1 pb-3">
          <Link 
            to="/bags" 
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium text-center transition-colors`}
            style={isActive('/bags') 
              ? { backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary-700)' }
              : { backgroundColor: 'var(--color-neutral-100)', color: 'var(--color-neutral-600)' }
            }
          >
            My Bags
          </Link>
          <Link 
            to="/trips" 
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium text-center transition-colors`}
            style={isActive('/trips') 
              ? { backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary-700)' }
              : { backgroundColor: 'var(--color-neutral-100)', color: 'var(--color-neutral-600)' }
            }
          >
            Trips
          </Link>
          <Link 
            to="/gear" 
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium text-center transition-colors`}
            style={isActive('/gear') 
              ? { backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary-700)' }
              : { backgroundColor: 'var(--color-neutral-100)', color: 'var(--color-neutral-600)' }
            }
          >
            Gear
          </Link>
        </div>
      </div>
    </nav>
  );
}
