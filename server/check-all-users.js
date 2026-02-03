const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAllUsers() {
    console.log('Checking ALL users in database...\n');

    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('id, email, name, role, approval_status, created_at')
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) throw error;

        if (!users || users.length === 0) {
            console.log('No users found.\n');
            return;
        }

        console.log(`Found ${users.length} user(s):\n`);

        users.forEach((user, index) => {
            const statusIcon = user.role === 'VENDOR' && !user.approval_status ? '⚠️' : '✅';
            console.log(`${statusIcon} ${index + 1}. ${user.email}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Approval Status: ${user.approval_status || 'NULL'}`);
            console.log(`   Created: ${new Date(user.created_at).toLocaleString()}`);
            console.log('');
        });

        // Find problematic vendors
        const problematicVendors = users.filter(u => u.role === 'VENDOR' && !u.approval_status);

        if (problematicVendors.length > 0) {
            console.log(`\n⚠️  Found ${problematicVendors.length} vendor(s) with NULL approval_status!`);
            console.log('These were created BEFORE the migration.\n');
            console.log('Options:');
            console.log('1. Delete these accounts and create new ones');
            console.log('2. Update them to PENDING status\n');

            console.log('Automatically updating to PENDING...\n');

            for (const vendor of problematicVendors) {
                const { error: updateError } = await supabase
                    .from('users')
                    .update({ approval_status: 'PENDING' })
                    .eq('id', vendor.id);

                if (updateError) {
                    console.log(`❌ Failed to update ${vendor.email}`);
                } else {
                    console.log(`✅ Updated ${vendor.email} → PENDING`);
                }
            }
        } else {
            console.log('✅ All vendors have proper approval_status!');
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkAllUsers()
    .then(() => {
        console.log('\nDone!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Failed:', error);
        process.exit(1);
    });
