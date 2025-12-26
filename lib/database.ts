/**
 * Database utility functions for PartPulse
 * Provides helper functions for common database operations
 */

import { supabase } from './supabase';
import type {
  Product,
  ProductInsert,
  ProductUpdate,
  Order,
  OrderInsert,
  OrderUpdate,
  Profile,
  WishlistItem,
  Chat,
  Message,
} from './database.types';

// ==================== Profiles ====================

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
}

export async function createProfile(profile: {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
}): Promise<Profile | null> {
  // Try using the RPC function first (bypasses RLS)
  // This is the preferred method as it works even during signup
  const { data: rpcData, error: rpcError } = await supabase.rpc('create_user_profile', {
    p_id: profile.id,
    p_username: profile.username,
    p_full_name: profile.full_name || null,
    p_avatar_url: profile.avatar_url || null,
    p_bio: profile.bio || null,
  });

  if (!rpcError && rpcData) {
    return rpcData as Profile;
  }

  // Log RPC error but don't fail yet - try fallback
  if (rpcError) {
    console.log('RPC function error (trying fallback):', rpcError);
  }

  // Fallback to direct insert if RPC function doesn't exist or fails
  // This will only work if the user is authenticated and RLS allows it
  const { data, error } = await supabase
    .from('profiles')
    .insert(profile)
    .select()
    .single();

  if (error) {
    console.error('Error creating profile (both methods failed):', error);
    return null;
  }

  return data;
}

export async function updateProfile(
  userId: string,
  updates: Partial<Profile>
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    return null;
  }

  return data;
}

// ==================== Products ====================

export async function getProducts(filters?: {
  category?: string;
  seller_id?: string;
  status?: 'active' | 'sold' | 'draft';
  search?: string;
  limit?: number;
}): Promise<Product[]> {
  let query = supabase.from('products').select('*');

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }

  if (filters?.seller_id) {
    query = query.eq('seller_id', filters.seller_id);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  } else {
    // Default to active products only
    query = query.eq('status', 'active');
  }

  if (filters?.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,brand.ilike.%${filters.search}%,model.ilike.%${filters.search}%`
    );
  }

  query = query.order('created_at', { ascending: false });

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  return data || [];
}

export async function getProduct(productId: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();

  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }

  return data;
}

export async function createProduct(product: ProductInsert): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single();

  if (error) {
    console.error('Error creating product:', error);
    return null;
  }

  return data;
}

export async function updateProduct(
  productId: string,
  updates: ProductUpdate
): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', productId)
    .select()
    .single();

  if (error) {
    console.error('Error updating product:', error);
    return null;
  }

  return data;
}

export async function deleteProduct(productId: string): Promise<boolean> {
  const { error } = await supabase.from('products').delete().eq('id', productId);

  if (error) {
    console.error('Error deleting product:', error);
    return false;
  }

  return true;
}

// ==================== Orders ====================

export async function getOrders(userId: string, role: 'buyer' | 'seller'): Promise<Order[]> {
  const column = role === 'buyer' ? 'buyer_id' : 'seller_id';
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq(column, userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }

  return data || [];
}

export async function getOrder(orderId: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (error) {
    console.error('Error fetching order:', error);
    return null;
  }

  return data;
}

export async function createOrder(order: OrderInsert): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .insert(order)
    .select()
    .single();

  if (error) {
    console.error('Error creating order:', error);
    return null;
  }

  return data;
}

export async function updateOrder(
  orderId: string,
  updates: OrderUpdate
): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    console.error('Error updating order:', error);
    return null;
  }

  return data;
}

// ==================== Wishlist ====================

export async function getWishlist(userId: string): Promise<WishlistItem[]> {
  const { data, error } = await supabase
    .from('wishlist')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching wishlist:', error);
    return [];
  }

  return data || [];
}

export async function addToWishlist(
  userId: string,
  productId: string
): Promise<WishlistItem | null> {
  const { data, error } = await supabase
    .from('wishlist')
    .insert({ user_id: userId, product_id: productId })
    .select()
    .single();

  if (error) {
    console.error('Error adding to wishlist:', error);
    return null;
  }

  return data;
}

export async function removeFromWishlist(
  userId: string,
  productId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('wishlist')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);

  if (error) {
    console.error('Error removing from wishlist:', error);
    return false;
  }

  return true;
}

export async function isInWishlist(
  userId: string,
  productId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('wishlist')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .single();

  if (error) {
    return false;
  }

  return !!data;
}

// ==================== Chats ====================

export async function getChats(userId: string): Promise<Chat[]> {
  const { data, error } = await supabase
    .from('chats')
    .select('*')
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching chats:', error);
    return [];
  }

  return data || [];
}

export async function getChat(chatId: string): Promise<Chat | null> {
  const { data, error } = await supabase
    .from('chats')
    .select('*')
    .eq('id', chatId)
    .single();

  if (error) {
    console.error('Error fetching chat:', error);
    return null;
  }

  return data;
}

export async function createChat(chat: {
  buyer_id: string;
  seller_id: string;
  product_id?: string;
}): Promise<Chat | null> {
  const { data, error } = await supabase
    .from('chats')
    .insert(chat)
    .select()
    .single();

  if (error) {
    console.error('Error creating chat:', error);
    return null;
  }

  return data;
}

// ==================== Messages ====================

export async function getMessages(chatId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  return data || [];
}

export async function sendMessage(message: {
  chat_id: string;
  sender_id: string;
  content: string;
}): Promise<Message | null> {
  const { data, error } = await supabase
    .from('messages')
    .insert(message)
    .select()
    .single();

  if (error) {
    console.error('Error sending message:', error);
    return null;
  }

  // Update chat's last message
  await supabase
    .from('chats')
    .update({
      last_message: message.content,
      last_message_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', message.chat_id);

  return data;
}

export async function markMessagesAsRead(
  chatId: string,
  userId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('messages')
    .update({ read: true })
    .eq('chat_id', chatId)
    .neq('sender_id', userId)
    .eq('read', false);

  if (error) {
    console.error('Error marking messages as read:', error);
    return false;
  }

  return true;
}

