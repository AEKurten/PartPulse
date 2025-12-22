-- PartPulse Database Schema
-- Run this SQL in your Supabase SQL Editor to create the database tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  condition TEXT NOT NULL CHECK (condition IN ('A+', 'A', 'B', 'C', 'D')),
  category TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('active', 'sold', 'draft')),
  listing_type TEXT CHECK (listing_type IN ('marketplace', 'instant')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  shipping_address JSONB NOT NULL,
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Wishlist table
CREATE TABLE IF NOT EXISTS wishlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(user_id, product_id)
);

-- Chats table
CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  last_message TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(buyer_id, seller_id, product_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(order_id, reviewer_id)
);

-- User Rigs table (stores user's PC specifications)
CREATE TABLE IF NOT EXISTS user_rigs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  cpu TEXT,
  gpu TEXT,
  motherboard TEXT,
  ram TEXT,
  psu TEXT,
  pc_case TEXT,
  is_primary BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- User Rig Storage table (stores individual storage drives for each rig)
CREATE TABLE IF NOT EXISTS user_rig_storage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rig_id UUID NOT NULL REFERENCES user_rigs(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('SSD', 'HDD', 'NVMe', 'M.2', 'Other')),
  capacity TEXT,
  model TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_rigs_user_id ON user_rigs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_rigs_is_primary ON user_rigs(user_id, is_primary) WHERE is_primary = true;
CREATE INDEX IF NOT EXISTS idx_user_rig_storage_rig_id ON user_rig_storage(rig_id);
CREATE INDEX IF NOT EXISTS idx_product_alerts_user_id ON product_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_product_alerts_product_id ON product_alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Product Alerts table (tracks which users want alerts for which products)
CREATE TABLE IF NOT EXISTS product_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  alert_price DECIMAL(10, 2),
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

CREATE INDEX IF NOT EXISTS idx_product_alerts_user_id ON product_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_product_alerts_product_id ON product_alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product_id ON wishlist(product_id);

CREATE INDEX IF NOT EXISTS idx_chats_buyer_id ON chats(buyer_id);
CREATE INDEX IF NOT EXISTS idx_chats_seller_id ON chats(seller_id);
CREATE INDEX IF NOT EXISTS idx_chats_product_id ON chats(product_id);

CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

CREATE INDEX IF NOT EXISTS idx_reviews_order_id ON reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON reviews(reviewee_id);

CREATE INDEX IF NOT EXISTS idx_user_rigs_user_id ON user_rigs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_rigs_is_primary ON user_rigs(user_id, is_primary) WHERE is_primary = true;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON chats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_rigs_updated_at BEFORE UPDATE ON user_rigs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rigs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Products policies
CREATE POLICY "Anyone can view active products" ON products
  FOR SELECT USING (status = 'active' OR seller_id = auth.uid());

CREATE POLICY "Users can create their own products" ON products
  FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update their own products" ON products
  FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Users can delete their own products" ON products
  FOR DELETE USING (auth.uid() = seller_id);

-- Orders policies
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (buyer_id = auth.uid() OR seller_id = auth.uid());

CREATE POLICY "Users can create orders as buyer" ON orders
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Sellers can update their orders" ON orders
  FOR UPDATE USING (seller_id = auth.uid());

-- Wishlist policies
CREATE POLICY "Users can view their own wishlist" ON wishlist
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their own wishlist" ON wishlist
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from their own wishlist" ON wishlist
  FOR DELETE USING (auth.uid() = user_id);

-- Chats policies
CREATE POLICY "Users can view their own chats" ON chats
  FOR SELECT USING (buyer_id = auth.uid() OR seller_id = auth.uid());

CREATE POLICY "Users can create chats" ON chats
  FOR INSERT WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Messages policies
CREATE POLICY "Users can view messages in their chats" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chats
      WHERE chats.id = messages.chat_id
      AND (chats.buyer_id = auth.uid() OR chats.seller_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their chats" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM chats
      WHERE chats.id = messages.chat_id
      AND (chats.buyer_id = auth.uid() OR chats.seller_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their own messages" ON messages
  FOR UPDATE USING (auth.uid() = sender_id);

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews for their orders" ON reviews
  FOR INSERT WITH CHECK (
    auth.uid() = reviewer_id AND
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = reviews.order_id
      AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
  );

-- User Rigs policies
CREATE POLICY "Users can view their own rigs" ON user_rigs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own rigs" ON user_rigs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rigs" ON user_rigs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rigs" ON user_rigs
  FOR DELETE USING (auth.uid() = user_id);

-- Function to ensure only one primary rig per user
CREATE OR REPLACE FUNCTION ensure_single_primary_rig()
RETURNS TRIGGER AS $$
BEGIN
  -- If setting this rig as primary, unset all other primary rigs for this user
  IF NEW.is_primary = true THEN
    UPDATE user_rigs
    SET is_primary = false
    WHERE user_id = NEW.user_id
      AND id != NEW.id
      AND is_primary = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically ensure only one primary rig per user
CREATE TRIGGER ensure_single_primary_rig_trigger
  BEFORE INSERT OR UPDATE ON user_rigs
  FOR EACH ROW
  WHEN (NEW.is_primary = true)
  EXECUTE FUNCTION ensure_single_primary_rig();

-- Enable RLS on user_rig_storage table
ALTER TABLE user_rig_storage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_rig_storage
CREATE POLICY "Users can view storage for their own rigs" ON user_rig_storage
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_rigs
      WHERE user_rigs.id = user_rig_storage.rig_id
      AND user_rigs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert storage for their own rigs" ON user_rig_storage
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_rigs
      WHERE user_rigs.id = user_rig_storage.rig_id
      AND user_rigs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update storage for their own rigs" ON user_rig_storage
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_rigs
      WHERE user_rigs.id = user_rig_storage.rig_id
      AND user_rigs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete storage for their own rigs" ON user_rig_storage
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_rigs
      WHERE user_rigs.id = user_rig_storage.rig_id
      AND user_rigs.user_id = auth.uid()
    )
  );

-- Enable RLS on product_alerts and notifications tables
ALTER TABLE product_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_alerts
CREATE POLICY "Users can view their own alerts" ON product_alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own alerts" ON product_alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alerts" ON product_alerts
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

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
CREATE TRIGGER check_price_drop_trigger
  AFTER UPDATE ON products
  FOR EACH ROW
  WHEN (OLD.price IS DISTINCT FROM NEW.price OR OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION check_price_drop();

