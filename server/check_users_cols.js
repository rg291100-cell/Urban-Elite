require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function check() {
    const { data: v, error: err } = await supabase.from('users').select('name, email, service_category, service_category_id').eq('role', 'VENDOR').order('created_at', { ascending: false }).limit(2);
    console.log("Recent vendors:", JSON.stringify(v, null, 2));
}
check();
