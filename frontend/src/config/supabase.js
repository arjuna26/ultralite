/**
 * Minimal Supabase Client for OAuth Only
 * 
 * This client is only used for OAuth providers (Google, GitHub, etc.)
 * Regular email/password auth goes through the backend API.
 * 
 * Required environment variables:
 * - VITE_SUPABASE_URL=https://your-project.supabase.co
 * - VITE_SUPABASE_ANON_KEY=your-anon-public-key
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase OAuth credentials not configured. OAuth providers will not work.');
}

// Create Supabase client for OAuth only
export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: false, // We'll handle session via backend JWT
        detectSessionInUrl: true
      }
    })
  : null;

/**
 * Sign in with OAuth provider
 * @param {string} provider - 'google', 'github', etc.
 * @param {string} redirectTo - URL to redirect after OAuth
 */
export const signInWithOAuth = async (provider, redirectTo) => {
  if (!supabase) {
    throw new Error('Supabase OAuth is not configured');
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: redirectTo || `${window.location.origin}/auth/callback`
    }
  });

  if (error) throw error;
  return data;
};

/**
 * Get the current Supabase session (for OAuth callback)
 */
export const getSupabaseSession = async () => {
  if (!supabase) return null;
  
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
};

/**
 * Get the current Supabase user (for OAuth callback)
 */
export const getSupabaseUser = async () => {
  if (!supabase) return null;
  
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

/**
 * Sign out from Supabase (clears OAuth session)
 */
export const signOutSupabase = async () => {
  if (!supabase) return;
  
  await supabase.auth.signOut();
};

/**
 * Request a password reset email
 * @param {string} email - User's email address
 */
export const resetPassword = async (email) => {
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`
  });

  if (error) throw error;
};

/**
 * Update user's password (after clicking reset link)
 * @param {string} newPassword - The new password
 */
export const updatePassword = async (newPassword) => {
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });

  if (error) throw error;
};
