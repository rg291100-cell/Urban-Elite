require('dotenv').config({ path: '.env' });
const { Client } = require('pg');

async function addColumn() {
    console.log('Connecting to database...');
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false } // Required for Supabase pooling sometimes
    });

    try {
        await client.connect();
        console.log('Connected!');

        console.log('Adding wallet_balance column...');
        const query = `
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS wallet_balance NUMERIC DEFAULT 0;
        `;
        await client.query(query);
        console.log('Column added successfully!');

    } catch (err) {
        console.error('Error adding column:', err);
    } finally {
        await client.end();
    }
}

addColumn();
