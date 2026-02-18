require('dotenv').config();
const { URL } = require('url');

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
    console.error('DATABASE_URL is not set in .env');
    process.exit(1);
}

try {
    const parsed = new URL(dbUrl);
    console.log('Database Host:', parsed.hostname);
    console.log('Database Port:', parsed.port);
    console.log('Database User:', parsed.username);
    console.log('Database Name:', parsed.pathname.substring(1));
    console.log('Query Params:', parsed.search);
} catch (error) {
    console.error('Invalid URL format:', error.message);
}
