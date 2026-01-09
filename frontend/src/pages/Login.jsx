import { useState } from 'react';
import { Link } from 'react-router-dom';
import { login, register } from '../api/client';
import { signInWithOAuth } from '../config/supabase';

// Password visibility toggle icon component
const EyeIcon = ({ visible }) => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    {visible ? (
      // Eye open - password visible
      <>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </>
    ) : (
      // Eye closed - password hidden
      <>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
      </>
    )}
  </svg>
);

// Password requirements component
const PasswordRequirements = ({ password }) => {
  const requirements = [
    { text: 'At least 8 characters', met: password.length >= 8 },
    { text: 'Contains a letter', met: /[a-zA-Z]/.test(password) },
    { text: 'Contains a number', met: /[0-9]/.test(password) }
  ];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1">
      {requirements.map((req, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <svg 
            className={`w-3.5 h-3.5 ${req.met ? 'text-green-500' : 'text-gray-400'}`} 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            {req.met ? (
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            ) : (
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
            )}
          </svg>
          <span style={{ color: req.met ? 'var(--color-success-600)' : 'var(--color-neutral-500)' }}>
            {req.text}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  // Validate password requirements
  const isPasswordValid = () => {
    return password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
  };

  // Check if passwords match (for registration)
  const doPasswordsMatch = () => {
    return password === confirmPassword;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation for registration
    if (isRegister) {
      if (!isPasswordValid()) {
        setError('Password does not meet requirements');
        return;
      }
      if (!doPasswordsMatch()) {
        setError('Passwords do not match');
        return;
      }
    }

    setLoading(true);

    try {
      const response = isRegister 
        ? await register(email, password, nickname || undefined)
        : await login(email, password);
      
      onLogin(response.data.user, response.data.token);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset form when switching modes
  const handleModeSwitch = () => {
    setIsRegister(!isRegister);
    setError('');
    setConfirmPassword('');
    setNickname('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // Handle OAuth sign in
  const handleOAuthSignIn = async (provider) => {
    setError('');
    setOauthLoading(true);
    
    try {
      const redirectTo = `${window.location.origin}/auth/callback`;
      await signInWithOAuth(provider, redirectTo);
      // User will be redirected to OAuth provider, then back to callback
    } catch (err) {
      setError(err.message || `Failed to sign in with ${provider}`);
      setOauthLoading(false);
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
              {/* Nickname field - only on register */}
              {isRegister && (
                <div>
                  <label htmlFor="nickname" className="label">
                    Nickname
                    <span className="text-xs font-normal ml-2" style={{ color: 'var(--color-neutral-500)' }}>
                      (optional)
                    </span>
                  </label>
                  <input
                    id="nickname"
                    name="nickname"
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="input"
                    placeholder="What should we call you?"
                    maxLength={50}
                  />
                  <p className="mt-1 text-xs" style={{ color: 'var(--color-neutral-500)' }}>
                    This will be displayed in your profile
                  </p>
                </div>
              )}

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
              
              {/* Password field with show/hide toggle */}
              <div>
                <label htmlFor="password" className="label">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input pr-12"
                    placeholder="••••••••"
                    minLength={isRegister ? 8 : 1}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors hover:bg-gray-100"
                    style={{ color: 'var(--color-neutral-500)' }}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <EyeIcon visible={showPassword} />
                  </button>
                </div>
                {isRegister && <PasswordRequirements password={password} />}
              </div>

              {/* Confirm password field - only on register */}
              {isRegister && (
                <div>
                  <label htmlFor="confirmPassword" className="label">Confirm password</label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input pr-12"
                      placeholder="••••••••"
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors hover:bg-gray-100"
                      style={{ color: 'var(--color-neutral-500)' }}
                      tabIndex={-1}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      <EyeIcon visible={showConfirmPassword} />
                    </button>
                  </div>
                  {confirmPassword && !doPasswordsMatch() && (
                    <p className="mt-1 text-xs" style={{ color: 'var(--color-error-600)' }}>
                      Passwords do not match
                    </p>
                  )}
                  {confirmPassword && doPasswordsMatch() && (
                    <p className="mt-1 text-xs flex items-center gap-1" style={{ color: 'var(--color-success-600)' }}>
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Passwords match
                    </p>
                  )}
                </div>
              )}

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
                disabled={loading || (isRegister && (!isPasswordValid() || !doPasswordsMatch()))}
                className="btn btn-primary w-full btn-lg disabled:opacity-50 disabled:cursor-not-allowed"
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

            {/* OAuth Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" style={{ borderColor: 'var(--color-neutral-200)' }}></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-2" style={{ backgroundColor: 'var(--color-surface-elevated)', color: 'var(--color-neutral-500)' }}>
                  Or continue with
                </span>
              </div>
            </div>

            {/* OAuth Buttons */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleOAuthSignIn('google')}
                disabled={loading || oauthLoading}
                className="btn btn-outline w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {oauthLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Redirecting...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </span>
                )}
              </button>
            </div>

            {/* Toggle */}
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={handleModeSwitch}
                className="text-sm font-medium transition-colors cursor-pointer hover:font-bold"
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
            <Link to="/terms" className="underline" style={{ color: 'var(--color-neutral-600)' }}>Terms</Link>
            {' '}and{' '}
            <Link to="/privacy" className="underline" style={{ color: 'var(--color-neutral-600)' }}>Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
