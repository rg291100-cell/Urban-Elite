const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
    console.log('Running vendor approval workflow migration...\n');

    try {
        // Check if columns already exist
        const { data: existingData, error: checkError } = await supabase
            .from('users')
            .select('approval_status')
            .limit(1);

        if (!checkError) {
            console.log('✅ Migration appears to have already been run (approval_status column exists)');
            console.log('Checking existing data...\n');

            // Update any existing vendors to PENDING if they don't have approval_status
            const { data: vendors, error: vendorError } = await supabase
                .from('users')
                .select('*')
                .eq('role', 'VENDOR');

            if (vendors && vendors.length > 0) {
                console.log(`Found ${vendors.length} vendor(s) in database`);
                vendors.forEach(v => {
                    console.log(`- ${v.email}: approval_status = ${v.approval_status || 'NULL'}`);
                });
            }

            return;
        }

        console.log('⚠️  The approval_status column does not exist yet.');
        console.log('Please run the SQL migration manually in Supabase SQL Editor:\n');
        console.log('1. Open Supabase Dashboard');
        console.log('2. Go to SQL Editor');
        console.log('3. Copy and paste the contents of: server/migrations/add_vendor_approval.sql');
        console.log('4. Click "Run"\n');
        console.log('The migration file contains:');
        console.log('- Add approval_status, service_category, business_name, business_address, experience_years columns');
        console.log('- Add approved_at and approved_by columns');
        console.log('- Create indexes for performance');
        console.log('- Set default approval_status to APPROVED for existing users\n');

    } catch (error) {
        console.error('Error checking migration status:', error.message);
        console.log('\n⚠️  Please run the migration manually in Supabase SQL Editor');
        console.log('File: server/migrations/add_vendor_approval.sql\n');
    }
}

runMigration()
    .then(() => {
        console.log('\nMigration check complete!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Migration failed:', error);
        process.exit(1);
    });
