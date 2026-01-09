import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSupabaseSession, signOutSupabase } from '../config/supabase';
import { login } from '../api/client';

export default function OAuthCallback({ onLogin }) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the Supabase session from OAuth callback
        const session = await getSupabaseSession();
        
        if (!session || !session.user) {
          throw new Error('No session found. Please try signing in again.');
        }

        // Exchange Supabase session for our backend JWT
        // The backend will verify the Supabase session and return our JWT
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/oauth/callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            access_token: session.access_token,
            user_id: session.user.id,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to complete sign in');
        }

        const data = await response.json();
        
        // Clear Supabase session (we use our own JWT now)
        await signOutSupabase();
        
        // Store our JWT and set user
        onLogin(data.user, data.token);
        
        // Redirect to bags page
        navigate('/bags');
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError(err.message || 'Failed to complete sign in');
        setLoading(false);
        
        // Clear any Supabase session on error
        try {
          await signOutSupabase();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };

    handleCallback();
  }, [onLogin, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen hero-gradient topo-pattern flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center animate-pulse mx-auto mb-4" 
               style={{ backgroundColor: 'var(--color-primary-600)' }}>
            <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-sm" style={{ color: 'var(--color-neutral-600)' }}>
            Completing sign in...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen hero-gradient topo-pattern flex items-center justify-center px-4">
        <div className="w-full max-w-md card p-8 text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" 
               style={{ backgroundColor: 'var(--color-error-100)' }}>
            <svg className="w-6 h-6" style={{ color: 'var(--color-error-600)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-heading text-xl mb-2">Sign In Failed</h2>
          <p className="text-body mb-6" style={{ color: 'var(--color-error-600)' }}>
            {error}
          </p>
          <button
            onClick={() => navigate('/login')}
            className="btn btn-primary"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return null;
}
