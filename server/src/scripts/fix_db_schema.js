require('dotenv').config({ path: '.env' });
const { Client } = require('pg');

// Parse the current DATABASE_URL
// Format: postgres://[user]:[password]@[host]:[port]/[db]
// We need to switch port 6543 (Transaction) -> 5432 (Session)
// And host aws-0-us-east-1.pooler.supabase.com -> db.zgknwsrfpqjncvyzfiww.supabase.co

async function fixSchema() {
    console.log('Attempting to fix schema via Direct Connection...');

    // Construct Direct URL manually based on known Supabase pattern
    // User: postgres (or postgres.ref)
    // Pass: Ravita%40441977
    // Host: db.zgknwsrfpqjncvyzfiww.supabase.co
    // Port: 5432

    // Extract password from env var if possible, otherwise use known one
    const dbUrl = process.env.DATABASE_URL;
    let password = 'Ravita%40441977'; // Fallback

    try {
        const urlParts = new URL(dbUrl);
        password = urlParts.password;
    } catch (e) {
        console.log('Could not parse DATABASE_URL, using hardcoded fallback.');
    }

    const directUrl = `postgres://postgres:${password}@db.zgknwsrfpqjncvyzfiww.supabase.co:5432/postgres`;
    console.log('Connecting to:', directUrl.replace(password, '****'));

    const client = new Client({
        connectionString: directUrl,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected to Direct Session!');

        console.log('Adding wallet_balance column...');
        const query = `
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS wallet_balance NUMERIC DEFAULT 0;
        `;
        await client.query(query);
        console.log('SUCCESS: wallet_balance column added!');

    } catch (err) {
        console.error('Migration Failed:', err);
    } finally {
        await client.end();
    }
}

fixSchema();
