const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err.message);
  }
} else {
  console.warn('⚠️ Supabase credentials not found in environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY / SUPABASE_ANON_KEY).');
}

/**
 * Checks connectivity to the Supabase database
 * @returns {Promise<{connected: boolean, message: string, url?: string}>}
 */
async function checkSupabaseConnection() {
  if (!supabase) {
    return {
      connected: false,
      message: 'Supabase client is not initialized (missing environment variables)',
    };
  }

  try {
    // Attempt a light ping/query on vehicle_types or categories table
    const { data, error } = await supabase.from('vehicle_types').select('id').limit(1);
    if (error) {
      return {
        connected: false,
        url: supabaseUrl,
        message: error.message || 'Supabase query returned error',
        code: error.code,
      };
    }
    return {
      connected: true,
      url: supabaseUrl,
      message: 'Successfully connected to Supabase PostgreSQL',
    };
  } catch (err) {
    return {
      connected: false,
      url: supabaseUrl,
      message: err.message || 'Network / connection error',
    };
  }
}

module.exports = {
  supabase,
  checkSupabaseConnection,
  isSupabaseConfigured: () => Boolean(supabase),
};
