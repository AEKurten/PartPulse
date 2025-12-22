-- Migration: Fix NULL brand/model values in existing products
-- Run this BEFORE running migration_add_brands_models.sql if you have existing products with NULL values

-- First, ensure we have the 'Unknown' brand (if brands table exists)
-- If brands table doesn't exist yet, this will be handled in the main migration
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'brands') THEN
    INSERT INTO brands (name, category) VALUES ('Unknown', NULL)
    ON CONFLICT (name) DO NOTHING;
  END IF;
END $$;

-- Set default values for any existing NULL values
UPDATE products SET brand = 'Unknown' WHERE brand IS NULL;
UPDATE products SET model = 'Unknown' WHERE model IS NULL;

-- Verify update worked
SELECT 
  COUNT(*) as total_products,
  COUNT(*) FILTER (WHERE brand IS NULL) as null_brands,
  COUNT(*) FILTER (WHERE model IS NULL) as null_models
FROM products;

