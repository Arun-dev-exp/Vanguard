const { createClient } = require('@supabase/supabase-js');
const config = require('../config');

let supabase = null;

/**
 * Returns the Supabase client singleton.
 * Uses the service_role key for full server-side access (bypasses RLS).
 */
function getSupabase() {
  if (!supabase) {
    if (!config.supabase.url || !config.supabase.serviceRoleKey) {
      throw new Error(
        'Supabase credentials not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env'
      );
    }

    supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    console.log('✅ Supabase client initialized');
  }

  return supabase;
}

module.exports = { getSupabase };
