const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    console.log('URL:', supabaseUrl ? 'Set' : 'Missing');
    console.log('Key:', supabaseKey ? 'Set' : 'Missing');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log('--- Checking Tables ---');

    // Check key tables
    const tables = ['users', 'services', 'categories', 'bookings', 'transactions', 'promos', 'vendor_profiles'];

    for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
            console.log(`Table '${table}': NOT FOUND or Access Denied (${error.message})`);
        } else {
            console.log(`Table '${table}': EXISTS. Rows: ${data.length > 0 ? 'Yes' : 'No'}. Sample keys: ${data.length > 0 ? Object.keys(data[0]).join(', ') : 'N/A'}`);
        }
    }

    console.log('\n--- Checking specific columns in users ---');
    const { data: user, error: userError } = await supabase.from('users').select('*').limit(1);
    if (user && user.length > 0) {
        console.log('User Columns:', Object.keys(user[0]));
    }
}

checkSchema();
