-- Simpler migration for category slug without DO blocks
ALTER TABLE service_categories ADD COLUMN IF NOT EXISTS slug TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_service_categories_slug ON service_categories(slug);
