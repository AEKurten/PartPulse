-- Migration: Fix existing products with NULL brand/model values
-- Run this FIRST if you have existing products before running migration_add_brands_models.sql

-- Step 1: Check current state
SELECT 
  COUNT(*) as total_products,
  COUNT(*) FILTER (WHERE brand IS NULL) as null_brands,
  COUNT(*) FILTER (WHERE model IS NULL) as null_models
FROM products;

-- Step 2: Update NULL values to 'Unknown'
-- This will work even if brands table doesn't exist yet
UPDATE products 
SET brand = 'Unknown' 
WHERE brand IS NULL;

UPDATE products 
SET model = 'Unknown' 
WHERE model IS NULL;

-- Step 3: Verify all NULLs are gone
SELECT 
  COUNT(*) as total_products,
  COUNT(*) FILTER (WHERE brand IS NULL) as null_brands,
  COUNT(*) FILTER (WHERE model IS NULL) as null_models
FROM products;

-- If the above shows 0 null_brands and 0 null_models, you can proceed with migration_add_brands_models.sql

