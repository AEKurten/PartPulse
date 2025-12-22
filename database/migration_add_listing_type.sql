-- Migration: Add listing_type column to products table
-- Run this SQL in your Supabase SQL Editor

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS listing_type TEXT CHECK (listing_type IN ('marketplace', 'instant'));

-- Add comment for documentation
COMMENT ON COLUMN products.listing_type IS 'Type of listing: marketplace (user-to-user) or instant (sell to platform)';

