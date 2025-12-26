-- Migration: Fix profile creation RLS issue
-- This migration adds a function to create profiles that bypasses RLS
-- Run this SQL in your Supabase SQL Editor

-- Drop existing policy if it exists (we'll recreate it)
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Create a function with SECURITY DEFINER to create profiles
-- This bypasses RLS and allows profile creation during signup
CREATE OR REPLACE FUNCTION create_user_profile(
  p_id UUID,
  p_username TEXT,
  p_full_name TEXT DEFAULT NULL,
  p_avatar_url TEXT DEFAULT NULL,
  p_bio TEXT DEFAULT NULL
)
RETURNS profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result profiles;
BEGIN
  -- Insert or update profile (handles case where profile already exists)
  INSERT INTO profiles (id, username, full_name, avatar_url, bio)
  VALUES (p_id, p_username, p_full_name, p_avatar_url, p_bio)
  ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    updated_at = TIMEZONE('utc', NOW())
  RETURNING * INTO result;
  
  RETURN result;
END;
$$;

-- Recreate the policy for manual inserts (if needed)
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_user_profile TO authenticated;
GRANT EXECUTE ON FUNCTION create_user_profile TO anon;

-- Comment
COMMENT ON FUNCTION create_user_profile IS 'Creates a user profile, bypassing RLS for signup flow';

