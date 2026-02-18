require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase URL or Key is missing');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log('Checking bookings table schema...');

    // Try to select the new column
    const { data, error } = await supabase
        .from('bookings')
        .select('attachment_url')
        .limit(1);

    if (error) {
        console.error('Error selecting attachment_url:', error.message);
        console.log('Use runMigration.js to add the column.');
    } else {
        console.log('Success! attachment_url column exists.');
    }
}

checkSchema();
