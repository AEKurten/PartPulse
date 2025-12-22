import { supabase } from './supabase';

/**
 * Check if a review already exists for an order
 */
export async function reviewExistsForOrder(orderId: string, reviewerId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('reviews')
    .select('id')
    .eq('order_id', orderId)
    .eq('reviewer_id', reviewerId)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows returned
    console.error('Error checking review:', error);
  }

  return !!data;
}

/**
 * Check if a review already exists for a chat
 */
export async function reviewExistsForChat(chatId: string, reviewerId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('reviews')
    .select('id')
    .eq('chat_id', chatId)
    .eq('reviewer_id', reviewerId)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows returned
    console.error('Error checking review:', error);
  }

  return !!data;
}

/**
 * Get the other user ID in a chat (buyer or seller)
 */
export async function getChatOtherUserId(chatId: string, currentUserId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('chats')
    .select('buyer_id, seller_id')
    .eq('id', chatId)
    .single();

  if (error || !data) {
    console.error('Error fetching chat:', error);
    return null;
  }

  // Return the ID of the other user
  return data.buyer_id === currentUserId ? data.seller_id : data.buyer_id;
}

/**
 * Get message count for a chat
 */
export async function getChatMessageCount(chatId: string): Promise<number> {
  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('chat_id', chatId);

  if (error) {
    console.error('Error counting messages:', error);
    return 0;
  }

  return count || 0;
}

