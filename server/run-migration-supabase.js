require('dotenv').config();
const https = require('https');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

// Run SQL statements one by one via Supabase REST API
async function runSQL(sql) {
    return new Promise((resolve, reject) => {
        const url = new URL(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`);
        const body = JSON.stringify({ sql });

        const options = {
            hostname: url.hostname,
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SERVICE_ROLE_KEY,
                'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
                'Content-Length': Buffer.byteLength(body)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(data);
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                }
            });
        });

        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

// Use Supabase client with service role key instead
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function runMigrations() {
    console.log('Running migrations via Supabase...\n');

    const migrations = [
        {
            name: 'Add attachment_url to bookings',
            sql: `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS attachment_url TEXT;`
        },
        {
            name: 'Add service_category_id to users',
            sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS service_category_id UUID;`
        },
        {
            name: 'Add sub_category_id to users',
            sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS sub_category_id UUID;`
        },
        {
            name: 'Add business_name to users',
            sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS business_name TEXT;`
        },
        {
            name: 'Add business_address to users',
            sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS business_address TEXT;`
        },
        {
            name: 'Add experience_years to users',
            sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS experience_years INTEGER;`
        },
        {
            name: 'Add aadhaar_url to users',
            sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS aadhaar_url TEXT;`
        },
        {
            name: 'Add pan_url to users',
            sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS pan_url TEXT;`
        },
        {
            name: 'Create vendor_services table',
            sql: `CREATE TABLE IF NOT EXISTS vendor_services (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                vendor_id UUID REFERENCES users(id) ON DELETE CASCADE,
                service_item_id UUID,
                custom_price TEXT,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                UNIQUE(vendor_id, service_item_id)
            );`
        }
    ];

    for (const migration of migrations) {
        try {
            // Use Supabase's rpc to run raw SQL
            const { data, error } = await supabase.rpc('exec_sql', { sql: migration.sql });
            if (error) {
                // Try direct query approach
                console.log(`  ⚠️  RPC failed for "${migration.name}": ${error.message}`);
                console.log(`     Trying alternative approach...`);

                // For column additions, we can verify by trying to select the column
                console.log(`  ℹ️  Please run this SQL manually in Supabase Dashboard > SQL Editor:`);
                console.log(`     ${migration.sql}\n`);
            } else {
                console.log(`  ✅ ${migration.name}`);
            }
        } catch (err) {
            console.log(`  ⚠️  "${migration.name}": ${err.message}`);
            console.log(`     SQL: ${migration.sql}\n`);
        }
    }

    console.log('\nDone! If any migrations failed, please run them manually in Supabase Dashboard > SQL Editor.');
    console.log(`URL: ${SUPABASE_URL.replace('https://', 'https://supabase.com/dashboard/project/')}/sql`);
}

runMigrations();
