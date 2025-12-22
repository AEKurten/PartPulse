-- Migration: Add user_rig_storage table for storing multiple storage drives per rig
-- Run this SQL in your Supabase SQL Editor

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
CREATE INDEX IF NOT EXISTS idx_user_rig_storage_rig_id ON user_rig_storage(rig_id);

-- Enable RLS on user_rig_storage table
ALTER TABLE user_rig_storage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_rig_storage

-- Drop existing policies if they exist (for re-running migration)
DROP POLICY IF EXISTS "Users can view storage for their own rigs" ON user_rig_storage;
DROP POLICY IF EXISTS "Users can insert storage for their own rigs" ON user_rig_storage;
DROP POLICY IF EXISTS "Users can update storage for their own rigs" ON user_rig_storage;
DROP POLICY IF EXISTS "Users can delete storage for their own rigs" ON user_rig_storage;

-- Users can view storage for their own rigs
CREATE POLICY "Users can view storage for their own rigs" ON user_rig_storage
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_rigs
      WHERE user_rigs.id = user_rig_storage.rig_id
      AND user_rigs.user_id = auth.uid()
    )
  );

-- Users can insert storage for their own rigs
CREATE POLICY "Users can insert storage for their own rigs" ON user_rig_storage
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_rigs
      WHERE user_rigs.id = user_rig_storage.rig_id
      AND user_rigs.user_id = auth.uid()
    )
  );

-- Users can update storage for their own rigs
CREATE POLICY "Users can update storage for their own rigs" ON user_rig_storage
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_rigs
      WHERE user_rigs.id = user_rig_storage.rig_id
      AND user_rigs.user_id = auth.uid()
    )
  );

-- Users can delete storage for their own rigs
CREATE POLICY "Users can delete storage for their own rigs" ON user_rig_storage
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_rigs
      WHERE user_rigs.id = user_rig_storage.rig_id
      AND user_rigs.user_id = auth.uid()
    )
  );

