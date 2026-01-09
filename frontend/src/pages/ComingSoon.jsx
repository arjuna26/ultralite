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

      <div className="text-center text-white p-8 max-w-2xl mx-auto relative z-10 animate-fade-in">
        {/* Hero Title */}
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
            marginBottom: '1rem'
          }}
        >
          Something lightweight is coming...
        </p>

        {/* Description */}
        <p 
          className="text-base md:text-lg mb-12"
          style={{
            color: 'var(--color-primary-200)',
            maxWidth: '600px',
            margin: '0 auto 3rem',
            lineHeight: 1.6
          }}
        >
          The gear management app for backpackers who count every gram. 
          Plan your pack, track your trips, and go lighter.
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
          Be the first to know when we launch
        </p>
      </div>
    </div>
  );
};

export default ComingSoon;
