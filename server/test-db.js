require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase URL or Key is missing from environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabase() {
    console.log('Testing Supabase Connection...');
    console.log('URL:', supabaseUrl);
    console.log('Key:', supabaseKey ? 'Found' : 'Missing');

    try {
        const { data: services, error } = await supabase
            .from('service_categories')
            .select('*');

        if (error) {
            console.error('Error fetching service_categories:', error);
        } else {
            console.log('Success! Service Categories found:', services.length);
            console.log(services);
        }

        const { data: users, error: userError } = await supabase
            .from('users')
            .select('*')
            .limit(1);

        if (userError) {
            console.error('Error fetching users:', userError);
        } else {
            console.log('Success! Users found:', users.length);
        }

    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

testSupabase();
