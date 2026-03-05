require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    // The previous calls used ANON key, maybe RLS blocked viewing for anon
    const { data: v, error: err } = await supabase.from('users').select('*').eq('role', 'VENDOR').order('created_at', { ascending: false }).limit(2);
    console.log("Error:", err);
    console.log("Recent Vendors (Service Role):", JSON.stringify(v, null, 2));
}
check();
