-- Add unique constraint to service_items for upsert support
ALTER TABLE service_items ADD CONSTRAINT service_items_cat_title_unique UNIQUE (category_id, title);
