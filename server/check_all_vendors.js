require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data: vendors, error: err } = await supabase.from('users').select('id, name, service_category, service_category_id').eq('role', 'VENDOR');
    if (err) console.error(err);
    else {
        console.log("ALL VENDORS SERVICE_CATEGORY VALUES:");
        vendors.forEach(v => {
            console.log(`- ${v.name}: "${v.service_category}" (ID field: ${v.service_category_id})`);
        });
    }
}
check();
