ALTER TABLE product_mappings
ADD COLUMN IF NOT EXISTS description text DEFAULT '';
