require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data: v, error: err } = await supabase.from('users').select('*').eq('email', 'rishabhvendor@gmail.com').single();
    if (err) console.error(err);
    else {
        console.log("VENDOR DATA:", JSON.stringify({
            id: v.id,
            name: v.name,
            service_category: v.service_category,
            service_category_id: v.service_category_id,
            sub_category_id: v.sub_category_id,
            approval_status: v.approval_status
        }, null, 2));
    }
}
check();
