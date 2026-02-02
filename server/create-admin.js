const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env' });

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
    const { data, error } = await supabase
        .from('users')
        .update({ role: 'ADMIN' })
        .eq('email', 'admin@urbanelite.com')
        .select();

    if (error) {
        console.error('Error:', error);
        process.exit(1);
    } else {
        console.log('✅ Success! Admin user created:');
        console.log('Email:', data[0].email);
        console.log('Role:', data[0].role);
        console.log('Name:', data[0].name);
    }
})();
