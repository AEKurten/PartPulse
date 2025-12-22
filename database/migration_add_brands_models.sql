-- Migration: Add brands and models tables
-- Run this SQL in your Supabase SQL Editor

-- Brands table - stores all brands
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  category TEXT, -- Optional: can be null for general brands, or specific category
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Models table - stores models linked to brands
CREATE TABLE IF NOT EXISTS models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT, -- Category this model belongs to (e.g., 'GPU', 'CPU')
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(brand_id, name, category) -- Same model name can exist for different categories
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_brands_name ON brands(name);
CREATE INDEX IF NOT EXISTS idx_brands_category ON brands(category);
CREATE INDEX IF NOT EXISTS idx_models_brand_id ON models(brand_id);
CREATE INDEX IF NOT EXISTS idx_models_category ON models(category);
CREATE INDEX IF NOT EXISTS idx_models_name ON models(name);

-- IMPORTANT: Before running this migration, ensure all products have brand and model values
-- If you have existing products with NULL values, run migration_fix_existing_products.sql first

-- Insert 'Unknown' brand first (needed for any products that might have 'Unknown' as brand)
INSERT INTO brands (name, category) VALUES ('Unknown', NULL)
ON CONFLICT (name) DO NOTHING;

-- Verify no NULL values exist before proceeding
DO $$
DECLARE
  null_brand_count INTEGER;
  null_model_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO null_brand_count FROM products WHERE brand IS NULL;
  SELECT COUNT(*) INTO null_model_count FROM products WHERE model IS NULL;
  
  IF null_brand_count > 0 OR null_model_count > 0 THEN
    RAISE EXCEPTION 'Cannot proceed: products table contains NULL values. Found % products with NULL brand and % products with NULL model. Please run migration_fix_existing_products.sql first.', 
      null_brand_count, null_model_count;
  END IF;
END $$;

-- Now make them NOT NULL (safe since we've verified no NULLs exist)
ALTER TABLE products 
ALTER COLUMN brand SET NOT NULL,
ALTER COLUMN model SET NOT NULL;

-- Insert some common brands for PC components
INSERT INTO brands (name, category) VALUES
  ('NVIDIA', 'GPU'),
  ('AMD', 'GPU'),
  ('Intel', 'CPU'),
  ('AMD', 'CPU'),
  ('Corsair', NULL),
  ('G.Skill', 'RAM'),
  ('Kingston', 'RAM'),
  ('Samsung', 'Storage'),
  ('Western Digital', 'Storage'),
  ('ASUS', 'Motherboard'),
  ('MSI', 'Motherboard'),
  ('Gigabyte', 'Motherboard'),
  ('EVGA', NULL),
  ('Seasonic', 'PSU'),
  ('Cooler Master', 'Cooling'),
  ('NZXT', 'Case')
ON CONFLICT (name) DO NOTHING;

-- Function to update updated_at timestamp
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_models_updated_at BEFORE UPDATE ON models
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE models ENABLE ROW LEVEL SECURITY;

-- Anyone can view brands and models
CREATE POLICY "Anyone can view brands" ON brands
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view models" ON models
  FOR SELECT USING (true);

-- Authenticated users can insert new brands and models
CREATE POLICY "Authenticated users can create brands" ON brands
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create models" ON models
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

