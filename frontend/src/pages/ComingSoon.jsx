import { useState } from 'react';
import { joinWaitlist } from '../api/client';

const ComingSoon = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    
    try {
      const res = await joinWaitlist(email);
      setStatus('success');
      setMessage(res.data.message || 'Thanks! We\'ll notify you at launch.');
      setEmail('');
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.error || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center hero-gradient"
      style={{
        background: 'linear-gradient(135deg, var(--color-primary-900) 0%, var(--color-primary-800) 50%, var(--color-secondary-900) 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >

      <div className="text-center text-white p-8 max-w-2xl mx-auto relative z-10 animate-fade-in items-center justify-center flex flex-col">
        {/* Hero Title */}
        <img src="/favicon.svg" alt="UltraLite" className="w-20 h-20" />
        <h1 
          className="text-display mb-6"
          style={{
            fontSize: 'clamp(3rem, 8vw, 6rem)', 
            lineHeight: 1.1,
            fontWeight: 700,
            color: 'white',
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            marginBottom: '1.5rem'
          }}
        >
          UltraLite
        </h1>

        {/* Subtitle */}
        <p 
          className="text-xl md:text-2xl mb-4"
          style={{
            color: 'var(--color-primary-100)',
            fontWeight: 400,
            marginBottom: '3rem'
          }}
        >
          Something lightweight is coming...
        </p>

        {/* Signup Form */}
        {status === 'success' ? (
          <div 
            className="animate-fade-in"
            style={{
              padding: '2rem',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 'var(--radius-xl)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              maxWidth: '500px',
              margin: '0 auto'
            }}
          >
            <div className="mb-4">
              <svg 
                className="w-16 h-16 mx-auto mb-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                style={{ color: 'var(--color-success-500)' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p 
              className="text-lg font-medium"
              style={{ color: 'white' }}
            >
              {message}
            </p>
          </div>
        ) : (
          <form 
            onSubmit={handleSubmit} 
            className="flex flex-col gap-4 max-w-md mx-auto animate-fade-in animate-delay-200"
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="input flex-1 px-4 py-3 text-lg"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: 'var(--radius-lg)',
                  color: 'var(--color-neutral-900)',
                  fontSize: '1rem',
                  padding: '0.875rem 1.25rem'
                }}
                required
                disabled={status === 'loading'}
              />
              <button 
                type="submit" 
                disabled={status === 'loading'}
                className="btn btn-primary btn-lg"
                style={{
                  whiteSpace: 'nowrap',
                  padding: '0.875rem 2rem',
                  fontSize: '1rem',
                  fontWeight: 600
                }}
              >
                {status === 'loading' ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Joining...
                  </span>
                ) : (
                  'Notify Me'
                )}
              </button>
            </div>
            {status === 'error' && (
              <p 
                className="text-sm mt-2 animate-fade-in"
                style={{ 
                  color: 'var(--color-error-300)',
                  backgroundColor: 'rgba(220, 38, 38, 0.1)',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(220, 38, 38, 0.2)'
                }}
              >
                {message}
              </p>
            )}
          </form>
        )}

        {/* Footer note */}
        <p 
          className="text-sm mt-12"
          style={{
            color: 'var(--color-primary-300)',
            opacity: 0.8
          }}
        >
          Plan your pack, track your trips, and go lighter. <br />
          Be the first to know when we launch
        </p>

        {/* Social Media Icons */}
        <div 
          className="flex items-center justify-center gap-6 mt-8"
          style={{
            marginTop: '2rem'
          }}
        >
          <a 
            href="https://github.com/arjuna26" 
            target="_blank" 
            rel="noopener noreferrer"
            className="transition-all duration-200 hover:scale-110"
            aria-label="GitHub"
          >
            <svg 
              className="w-6 h-6" 
              fill="currentColor" 
              viewBox="0 0 24 24"
              style={{ color: 'rgba(255, 255, 255, 0.8)' }}
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
          <a 
            href="https://linkedin.com/in/arjuna-herbst" 
            target="_blank" 
            rel="noopener noreferrer"
            className="transition-all duration-200 hover:scale-110"
            aria-label="LinkedIn"
          >
            <svg 
              className="w-6 h-6" 
              fill="currentColor" 
              viewBox="0 0 24 24"
              style={{ color: 'rgba(255, 255, 255, 0.8)' }}
            >
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
