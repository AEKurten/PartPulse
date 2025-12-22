-- Migration: Add product_alerts and notifications tables
-- Run this SQL in your Supabase SQL Editor

-- Product Alerts table (tracks which users want alerts for which products)
CREATE TABLE IF NOT EXISTS product_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  alert_price DECIMAL(10, 2), -- Optional: alert when price drops below this
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(user_id, product_id)
);

-- Notifications table (stores all notifications for users)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('price_drop', 'product_available', 'product_updated', 'order', 'message', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  read BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_product_alerts_user_id ON product_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_product_alerts_product_id ON product_alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Enable RLS on both tables
ALTER TABLE product_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_alerts

-- Drop existing policies if they exist (for re-running migration)
DROP POLICY IF EXISTS "Users can view their own alerts" ON product_alerts;
DROP POLICY IF EXISTS "Users can add their own alerts" ON product_alerts;
DROP POLICY IF EXISTS "Users can delete their own alerts" ON product_alerts;

CREATE POLICY "Users can view their own alerts" ON product_alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own alerts" ON product_alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alerts" ON product_alerts
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for notifications

-- Drop existing policies if they exist (for re-running migration)
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "System can create notifications" ON notifications;

CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow service role to insert notifications (for triggers/functions)
-- Note: This requires service_role key, or you can use a function with SECURITY DEFINER
CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true); -- Will be restricted by function security

-- Function to check for price drops and create notifications
CREATE OR REPLACE FUNCTION check_price_drop()
RETURNS TRIGGER AS $$
DECLARE
  alert_record RECORD;
  old_price DECIMAL(10, 2);
  new_price DECIMAL(10, 2);
  price_drop_percent DECIMAL(5, 2);
BEGIN
  -- Only check if price actually changed and decreased
  IF NEW.price < OLD.price AND NEW.status = 'active' THEN
    old_price := OLD.price;
    new_price := NEW.price;
    price_drop_percent := ((old_price - new_price) / old_price) * 100;

    -- Find all users who have alerts for this product
    FOR alert_record IN 
      SELECT user_id, alert_price 
      FROM product_alerts 
      WHERE product_id = NEW.id
    LOOP
      -- Create notification if:
      -- 1. No alert_price set (alert on any price drop), OR
      -- 2. Price dropped below alert_price
      IF alert_record.alert_price IS NULL OR new_price <= alert_record.alert_price THEN
        INSERT INTO notifications (
          user_id,
          type,
          title,
          message,
          product_id
        ) VALUES (
          alert_record.user_id,
          'price_drop',
          'Price Drop Alert',
          NEW.name || ' price dropped from R ' || old_price::TEXT || ' to R ' || new_price::TEXT || ' (' || ROUND(price_drop_percent, 1)::TEXT || '% off)',
          NEW.id
        );
      END IF;
    END LOOP;
  END IF;

  -- Check if product became available again (was sold/draft, now active)
  IF OLD.status != 'active' AND NEW.status = 'active' THEN
    FOR alert_record IN 
      SELECT user_id 
      FROM product_alerts 
      WHERE product_id = NEW.id
    LOOP
      INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        product_id
      ) VALUES (
        alert_record.user_id,
        'product_available',
        'Product Available',
        NEW.name || ' is now available again',
        NEW.id
      );
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to check for price drops when product is updated
DROP TRIGGER IF EXISTS check_price_drop_trigger ON products;
CREATE TRIGGER check_price_drop_trigger
  AFTER UPDATE ON products
  FOR EACH ROW
  WHEN (OLD.price IS DISTINCT FROM NEW.price OR OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION check_price_drop();

