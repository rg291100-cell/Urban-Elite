require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const vendorId = "cd37bbcd-c468-439f-b8f5-a28ecbfce814";
    const { data: vs, error: err } = await supabase.from('vendor_services').select('*, service_items(title, id)').eq('vendor_id', vendorId);
    if (err) console.error(err);
    else {
        console.log("VENDOR SERVICES FOR RISHABH VENDOR:");
        console.log(JSON.stringify(vs, null, 2));
    }
}
check();
