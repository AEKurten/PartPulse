-- Migration: Add user_rigs table for storing user PC specifications
-- Run this SQL in your Supabase SQL Editor

-- User Rigs table (stores user's PC specifications)
CREATE TABLE IF NOT EXISTS user_rigs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  cpu TEXT,
  gpu TEXT,
  motherboard TEXT,
  ram TEXT,
  storage TEXT,
  psu TEXT,
  pc_case TEXT,
  is_primary BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_rigs_user_id ON user_rigs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_rigs_is_primary ON user_rigs(user_id, is_primary) WHERE is_primary = true;

-- Trigger to automatically update updated_at timestamp
DROP TRIGGER IF EXISTS update_user_rigs_updated_at ON user_rigs;
CREATE TRIGGER update_user_rigs_updated_at BEFORE UPDATE ON user_rigs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on user_rigs table
ALTER TABLE user_rigs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_rigs

-- Drop existing policies if they exist (for re-running migration)
DROP POLICY IF EXISTS "Users can view their own rigs" ON user_rigs;
DROP POLICY IF EXISTS "Users can insert their own rigs" ON user_rigs;
DROP POLICY IF EXISTS "Users can update their own rigs" ON user_rigs;
DROP POLICY IF EXISTS "Users can delete their own rigs" ON user_rigs;

-- Users can view their own rigs
CREATE POLICY "Users can view their own rigs" ON user_rigs
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own rigs
CREATE POLICY "Users can insert their own rigs" ON user_rigs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own rigs
CREATE POLICY "Users can update their own rigs" ON user_rigs
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own rigs
CREATE POLICY "Users can delete their own rigs" ON user_rigs
  FOR DELETE USING (auth.uid() = user_id);

-- Optional: Function to ensure only one primary rig per user
-- This can be called before inserting/updating to set other rigs to non-primary
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
DROP TRIGGER IF EXISTS ensure_single_primary_rig_trigger ON user_rigs;
CREATE TRIGGER ensure_single_primary_rig_trigger
  BEFORE INSERT OR UPDATE ON user_rigs
  FOR EACH ROW
  WHEN (NEW.is_primary = true)
  EXECUTE FUNCTION ensure_single_primary_rig();

