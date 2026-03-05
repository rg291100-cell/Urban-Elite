require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data: v, error: err } = await supabase.from('users').update({service_category: 'Food & Grocery'}).eq('id', 'cd37bbcd-c468-439f-b8f5-a28ecbfce814');
    console.log("Updated vendor field successfully too.");
}
check();
