require('dotenv').config();
console.log("URL:", process.env.SUPABASE_URL);
console.log("KEY length:", process.env.SUPABASE_ANON_KEY ? process.env.SUPABASE_ANON_KEY.length : 0);
