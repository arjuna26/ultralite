const { createClient } = require('@supabase/supabase-js');

// Supabase credentials
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create Supabase client
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Supabase credentials are required. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('Supabase client initialized (backend)');

/**
 * Get the Supabase admin client for server-side operations
 * This client bypasses RLS - use with caution
 */
const getSupabaseAdmin = () => {
  return supabase;
};

module.exports = {
  supabase,
  getSupabaseAdmin
};
