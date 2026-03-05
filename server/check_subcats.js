require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data: scats, error: err } = await supabase.from('service_subcategories').select('id, name, category_id').ilike('name', '%Catering%');
    console.log(JSON.stringify(scats, null, 2));
}
check();
