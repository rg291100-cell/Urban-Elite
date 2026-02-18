require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function verifyAll() {
    console.log('Verifying all migration columns...\n');

    // Check bookings.attachment_url
    const { error: e1 } = await supabase.from('bookings').select('attachment_url').limit(1);
    console.log(`bookings.attachment_url: ${e1 ? '❌ ' + e1.message : '✅ exists'}`);

    // Check users vendor columns
    const { error: e2 } = await supabase.from('users').select('business_name, business_address, experience_years, aadhaar_url, pan_url, service_category_id, sub_category_id').limit(1);
    console.log(`users vendor columns: ${e2 ? '❌ ' + e2.message : '✅ all exist'}`);

    // Check vendor_services table
    const { error: e3 } = await supabase.from('vendor_services').select('id').limit(1);
    console.log(`vendor_services table: ${e3 ? '❌ ' + e3.message : '✅ exists'}`);
}

verifyAll();
