-- Migration: Add 'paused' status to products table
-- Run this SQL in your Supabase SQL Editor

-- Drop the existing CHECK constraint
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_status_check;

-- Add the new CHECK constraint with 'paused' status
ALTER TABLE products 
ADD CONSTRAINT products_status_check 
CHECK (status IN ('active', 'sold', 'draft', 'paused'));

-- Add comment for documentation
COMMENT ON COLUMN products.status IS 'Product status: active (visible to buyers), sold (completed sale), draft (not published), paused (temporarily hidden)';

