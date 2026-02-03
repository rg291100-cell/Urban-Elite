require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { Client } = require('pg');

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    console.error('DATABASE_URL is missing in .env');
    process.exit(1);
}

const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false } // Supabase requires SSL, usually
});

const migrationSQL = `
-- Add missing vendor fields to users
ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS tax_id TEXT;
ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS team_size TEXT;
ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS certifications TEXT;
ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS availability TEXT;
ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS primary_service TEXT;

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for categories (idempotent-ish)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public categories are viewable by everyone" ON public.categories;
CREATE POLICY "Public categories are viewable by everyone" ON public.categories FOR SELECT USING (true);

-- Insert default categories if empty
INSERT INTO public.categories (name, slug, image_url)
SELECT 'Women''s Salon', 'womens-salon', 'https://cdn-icons-png.flaticon.com/512/3364/3364177.png'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'womens-salon');

INSERT INTO public.categories (name, slug, image_url)
SELECT 'Men''s Salon', 'mens-salon', 'https://cdn-icons-png.flaticon.com/512/3076/3076134.png'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'mens-salon');

INSERT INTO public.categories (name, slug, image_url)
SELECT 'Cleaning', 'cleaning', 'https://cdn-icons-png.flaticon.com/512/995/995053.png'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'cleaning');
`;

async function migrate() {
    console.log('Connecting to database...');
    try {
        await client.connect();
        console.log('Connected! Applying migration...');

        await client.query(migrationSQL);

        console.log('Migration applied successfully!');
    } catch (error) {
        console.error('Migration Failed:', error);
        console.error('If connection failed, your DATABASE_URL might be incorrect.');
    } finally {
        await client.end();
    }
}

migrate();
