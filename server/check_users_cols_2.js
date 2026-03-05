require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function check() {
    // Just fetch ANY users just in case case formatting is off
    const { data: v, error: err } = await supabase.from('users').select('*').order('created_at', { ascending: false }).limit(2);
    console.log("Recent ALL users:", JSON.stringify(v, null, 2));
}
check();
