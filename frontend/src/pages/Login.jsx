import { useState } from 'react';
import { Link } from 'react-router-dom';
import { login, register } from '../api/client';

export default function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = isRegister 
        ? await register(email, password)
        : await login(email, password);
      
      onLogin(response.data.user, response.data.token);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-gradient topo-pattern">
      {/* Simple Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-10 pt-6">
        <div className="flex justify-center">
          <Link 
            to="/" 
            className="flex items-center gap-2 px-4 py-2 rounded-full transition-all hover:scale-105"
            style={{ 
              backgroundColor: 'var(--color-surface-elevated)', 
              color: 'var(--color-neutral-700)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-sm font-medium">Home</span>
          </Link>
        </div>
      </nav>

      {/* Login Form */}
      <div className="flex items-center justify-center min-h-screen px-4 py-12">
        <div className="w-full max-w-md animate-fade-in">
          {/* Card */}
          <div className="card p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" 
                   style={{ backgroundColor: 'var(--color-primary-100)' }}>
                <img src="/favicon.svg" alt="UltraLite" className="w-8 h-8" />
              </div>
              <h1 className="text-heading text-2xl mb-2">
                {isRegister ? 'Create your account' : 'Welcome back'}
              </h1>
              <p className="text-body">
                {isRegister 
                  ? 'Start tracking your gear weight today' 
                  : 'Sign in to manage your gear'}
              </p>
            </div>
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="label">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="you@example.com"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="label">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>

              {error && (
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-error-50)' }}>
                  <p className="text-sm flex items-center gap-2" style={{ color: 'var(--color-error-600)' }}>
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full btn-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Please wait...
                  </span>
                ) : (
                  isRegister ? 'Create Account' : 'Sign In'
                )}
              </button>
            </form>

            {/* Toggle */}
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError('');
                }}
                className="text-sm font-medium transition-colors"
                style={{ color: 'var(--color-primary-600)' }}
              >
                {isRegister 
                  ? 'Already have an account? Sign in' 
                  : "Don't have an account? Register"}
              </button>
            </div>
          </div>

          {/* Footer text */}
          <p className="mt-6 text-center text-caption text-sm">
            By continuing, you agree to our{' '}
            <a href="#" className="underline" style={{ color: 'var(--color-neutral-600)' }}>Terms</a>
            {' '}and{' '}
            <a href="#" className="underline" style={{ color: 'var(--color-neutral-600)' }}>Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
