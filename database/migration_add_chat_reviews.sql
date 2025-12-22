-- Migration: Allow reviews without orders (for chat-based reviews)
-- Run this SQL in your Supabase SQL Editor

-- Make order_id nullable to support reviews from chats
ALTER TABLE reviews 
ALTER COLUMN order_id DROP NOT NULL;

-- Add chat_id column for chat-based reviews
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS chat_id UUID REFERENCES chats(id) ON DELETE CASCADE;

-- Update unique constraint to allow multiple reviews per order/chat
-- Remove old constraint if exists
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_order_id_reviewer_id_key;

-- Add new constraint: one review per order per reviewer, OR one review per chat per reviewer
-- But allow multiple reviews if one is for order and one is for chat
CREATE UNIQUE INDEX IF NOT EXISTS reviews_order_reviewer_unique 
ON reviews(order_id, reviewer_id) 
WHERE order_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS reviews_chat_reviewer_unique 
ON reviews(chat_id, reviewer_id) 
WHERE chat_id IS NOT NULL;

-- Add comment
COMMENT ON COLUMN reviews.order_id IS 'Order ID for order-based reviews (nullable for chat reviews)';
COMMENT ON COLUMN reviews.chat_id IS 'Chat ID for chat-based reviews (nullable for order reviews)';

