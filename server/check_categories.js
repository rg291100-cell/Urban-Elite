require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data: cats, error: err } = await supabase.from('service_categories').select('id, name');
    if (err) console.error(err);
    else {
        console.log("ALL CATEGORIES:");
        cats.forEach(c => {
            console.log(`- ${c.id}: ${c.name}`);
        });
    }
}
check();
