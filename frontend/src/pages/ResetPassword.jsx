import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { resetPassword, updatePassword, supabase } from '../config/supabase';

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

export default function ResetPassword() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('loading'); // 'loading', 'request', 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if user arrived via reset link (Supabase sets up session from URL hash)
  useEffect(() => {
    const checkSession = async () => {
      if (!supabase) {
        setMode('request');
        return;
      }

      // Check if URL contains recovery token (from email link)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const type = hashParams.get('type');
      
      if (type === 'recovery') {
        // User clicked reset link - Supabase will handle the session
        // Wait for auth state to update
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setMode('reset');
        } else {
          // Wait a moment for Supabase to process the URL
          setTimeout(async () => {
            const { data: { session: retrySession } } = await supabase.auth.getSession();
            setMode(retrySession ? 'reset' : 'request');
          }, 500);
        }
      } else {
        // Check if there's an existing session with recovery type
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.recovery_sent_at) {
          setMode('reset');
        } else {
          setMode('request');
        }
      }
    };

    checkSession();

    // Listen for auth state changes (recovery token processing)
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'PASSWORD_RECOVERY') {
          setMode('reset');
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  // Validate password requirements
  const isPasswordValid = () => {
    return password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
  };

  // Check if passwords match
  const doPasswordsMatch = () => {
    return password === confirmPassword;
  };

  // Handle request reset email
  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await resetPassword(email);
      setSuccess('Check your email for a password reset link. It may take a few minutes to arrive.');
    } catch (err) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle password update
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isPasswordValid()) {
      setError('Password does not meet requirements');
      return;
    }

    if (!doPasswordsMatch()) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await updatePassword(password);
      setSuccess('Password updated successfully! Redirecting to login...');
      
      // Sign out and redirect to login
      setTimeout(() => {
        if (supabase) {
          supabase.auth.signOut();
        }
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (mode === 'loading') {
    return (
      <div className="min-h-screen hero-gradient topo-pattern flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center animate-pulse" style={{ backgroundColor: 'var(--color-primary-600)' }}>
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div className="text-sm" style={{ color: 'var(--color-neutral-500)' }}>Loading...</div>
        </div>
      </div>
    );
  }

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

      {/* Form */}
      <div className="flex items-center justify-center min-h-screen px-4 py-12">
        <div className="w-full max-w-md animate-fade-in">
          {/* Card */}
          <div className="card p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" 
                   style={{ backgroundColor: 'var(--color-primary-100)' }}>
                <svg className="w-7 h-7" style={{ color: 'var(--color-primary-600)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h1 className="text-heading text-2xl mb-2">
                {mode === 'request' ? 'Reset your password' : 'Set new password'}
              </h1>
              <p className="text-body">
                {mode === 'request' 
                  ? "Enter your email and we'll send you a reset link" 
                  : 'Enter your new password below'}
              </p>
            </div>
            
            {/* Request Reset Form */}
            {mode === 'request' && (
              <form onSubmit={handleRequestReset} className="space-y-5">
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

                {success && (
                  <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-success-50)' }}>
                    <p className="text-sm flex items-center gap-2" style={{ color: 'var(--color-success-600)' }}>
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {success}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full btn-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>
            )}

            {/* Set New Password Form */}
            {mode === 'reset' && (
              <form onSubmit={handleUpdatePassword} className="space-y-5">
                {/* New Password */}
                <div>
                  <label htmlFor="password" className="label">New password</label>
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
                      minLength={8}
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
                  <PasswordRequirements password={password} />
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="label">Confirm new password</label>
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

                {success && (
                  <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-success-50)' }}>
                    <p className="text-sm flex items-center gap-2" style={{ color: 'var(--color-success-600)' }}>
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {success}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !isPasswordValid() || !doPasswordsMatch()}
                  className="btn btn-primary w-full btn-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </span>
                  ) : (
                    'Update Password'
                  )}
                </button>
              </form>
            )}

            {/* Back to login link */}
            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="text-sm font-medium transition-colors hover:underline"
                style={{ color: 'var(--color-primary-600)' }}
              >
                ← Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
