const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
// Usage of Service Role Key allows the backend to bypass RLS policies
// This is required since we are managing authentication manually via custom JWTs
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase URL or Key is missing from environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = { supabase };
