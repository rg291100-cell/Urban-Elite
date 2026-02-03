const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkVendors() {
    console.log('Checking all vendor accounts...\n');

    try {
        const { data: vendors, error } = await supabase
            .from('users')
            .select('id, email, name, role, approval_status, service_category, business_name, created_at')
            .eq('role', 'VENDOR')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!vendors || vendors.length === 0) {
            console.log('No vendor accounts found.\n');
            return;
        }

        console.log(`Found ${vendors.length} vendor account(s):\n`);

        vendors.forEach((vendor, index) => {
            console.log(`${index + 1}. ${vendor.email}`);
            console.log(`   Name: ${vendor.name}`);
            console.log(`   Approval Status: ${vendor.approval_status || 'NULL (⚠️ ISSUE!)'}`);
            console.log(`   Service Category: ${vendor.service_category || 'Not set'}`);
            console.log(`   Business Name: ${vendor.business_name || 'Not set'}`);
            console.log(`   Created: ${new Date(vendor.created_at).toLocaleString()}`);
            console.log('');
        });

        // Check for vendors with NULL approval_status
        const vendorsWithoutStatus = vendors.filter(v => !v.approval_status);
        if (vendorsWithoutStatus.length > 0) {
            console.log('⚠️  WARNING: Found vendor(s) without approval_status!');
            console.log('These vendors were created BEFORE the migration was run.\n');
            console.log('Fixing by setting approval_status to PENDING...\n');

            for (const vendor of vendorsWithoutStatus) {
                const { error: updateError } = await supabase
                    .from('users')
                    .update({ approval_status: 'PENDING' })
                    .eq('id', vendor.id);

                if (updateError) {
                    console.log(`❌ Failed to update ${vendor.email}: ${updateError.message}`);
                } else {
                    console.log(`✅ Updated ${vendor.email} to PENDING status`);
                }
            }
        } else {
            console.log('✅ All vendors have approval_status set correctly!');
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkVendors()
    .then(() => {
        console.log('\nCheck complete!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Failed:', error);
        process.exit(1);
    });
