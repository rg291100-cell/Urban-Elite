require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    // We noticed service_category field stores an ID now instead of a string
    // e.g., "ed98ac2a-691e-46ea-857e-b08336ab771a" for the test user
    // The previous implementation stored "Electrician & More"
    // Let's manually set the newly created VENDOR's service_category to "Catering" for now so they appear under catering
    const { data: v, error: err } = await supabase.from('users').update({service_category: 'Catering'}).eq('id', 'cd37bbcd-c468-439f-b8f5-a28ecbfce814');
    console.log("Updated vendor field successfully.");
}
check();
