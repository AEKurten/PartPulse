-- Migration: Add product analytics tracking (views, clicks, shares)
-- Run this SQL in your Supabase SQL Editor

-- Product views table (one view per user per product)
CREATE TABLE IF NOT EXISTS product_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- NULL for anonymous views
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(product_id, user_id) -- One view per user per product
);

-- Product clicks table (all clicks tracked)
CREATE TABLE IF NOT EXISTS product_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- NULL for anonymous clicks
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  source TEXT, -- e.g., 'marketplace', 'wishlist', 'search', 'seller_profile'
  referrer TEXT -- e.g., URL or screen name where click originated
);

-- Product shares table
CREATE TABLE IF NOT EXISTS product_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  share_method TEXT NOT NULL CHECK (share_method IN ('link', 'social', 'message', 'other')),
  shared_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  platform TEXT -- e.g., 'whatsapp', 'facebook', 'twitter', 'copy_link'
);

-- Product impressions table (when product card becomes visible)
CREATE TABLE IF NOT EXISTS product_impressions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- NULL for anonymous impressions
  source TEXT, -- e.g., 'marketplace', 'wishlist', 'seller_profile', 'home'
  impressed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  impressed_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_product_views_product_id ON product_views(product_id);
CREATE INDEX IF NOT EXISTS idx_product_views_user_id ON product_views(user_id);
CREATE INDEX IF NOT EXISTS idx_product_views_viewed_at ON product_views(viewed_at DESC);

CREATE INDEX IF NOT EXISTS idx_product_clicks_product_id ON product_clicks(product_id);
CREATE INDEX IF NOT EXISTS idx_product_clicks_user_id ON product_clicks(user_id);
CREATE INDEX IF NOT EXISTS idx_product_clicks_clicked_at ON product_clicks(clicked_at DESC);

CREATE INDEX IF NOT EXISTS idx_product_shares_product_id ON product_shares(product_id);
CREATE INDEX IF NOT EXISTS idx_product_shares_user_id ON product_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_product_shares_shared_at ON product_shares(shared_at DESC);

CREATE INDEX IF NOT EXISTS idx_product_impressions_product_id ON product_impressions(product_id);
CREATE INDEX IF NOT EXISTS idx_product_impressions_user_id ON product_impressions(user_id);
CREATE INDEX IF NOT EXISTS idx_product_impressions_impressed_at ON product_impressions(impressed_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_impressions_source ON product_impressions(source);

-- Unique index for one impression per user per product per day
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_impressions_unique_per_day 
ON product_impressions(product_id, user_id, impressed_date);

-- RLS Policies for product_views
ALTER TABLE product_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view product views" ON product_views
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert their own views" ON product_views
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- RLS Policies for product_clicks
ALTER TABLE product_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view product clicks" ON product_clicks
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert clicks" ON product_clicks
  FOR INSERT WITH CHECK (true);

-- RLS Policies for product_shares
ALTER TABLE product_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view product shares" ON product_shares
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert their own shares" ON product_shares
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for product_impressions
ALTER TABLE product_impressions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view product impressions" ON product_impressions
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert impressions" ON product_impressions
  FOR INSERT WITH CHECK (true);

-- Function to get product view count
CREATE OR REPLACE FUNCTION get_product_view_count(p_product_id UUID)
RETURNS BIGINT AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::BIGINT
    FROM product_views
    WHERE product_id = p_product_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get product click count
CREATE OR REPLACE FUNCTION get_product_click_count(p_product_id UUID)
RETURNS BIGINT AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::BIGINT
    FROM product_clicks
    WHERE product_id = p_product_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get product share count
CREATE OR REPLACE FUNCTION get_product_share_count(p_product_id UUID)
RETURNS BIGINT AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::BIGINT
    FROM product_shares
    WHERE product_id = p_product_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get product impression count
CREATE OR REPLACE FUNCTION get_product_impression_count(p_product_id UUID)
RETURNS BIGINT AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::BIGINT
    FROM product_impressions
    WHERE product_id = p_product_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has viewed a product
CREATE OR REPLACE FUNCTION has_user_viewed_product(p_product_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM product_views
    WHERE product_id = p_product_id AND user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments
COMMENT ON TABLE product_views IS 'Tracks unique product views per user';
COMMENT ON TABLE product_clicks IS 'Tracks all product clicks';
COMMENT ON TABLE product_shares IS 'Tracks product shares';
COMMENT ON TABLE product_impressions IS 'Tracks product impressions (when product card becomes visible)';
COMMENT ON FUNCTION get_product_view_count IS 'Returns total view count for a product';
COMMENT ON FUNCTION get_product_click_count IS 'Returns total click count for a product';
COMMENT ON FUNCTION get_product_share_count IS 'Returns total share count for a product';
COMMENT ON FUNCTION get_product_impression_count IS 'Returns total impression count for a product';
COMMENT ON FUNCTION has_user_viewed_product IS 'Checks if a user has already viewed a product';

