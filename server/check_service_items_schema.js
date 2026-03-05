require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data: cols, error: err } = await supabase.from('service_items').select('*').limit(1);
    console.log("Cols:", Object.keys(cols[0]));
    console.log("Data sample:", JSON.stringify(cols[0], null, 2));
}
check();
