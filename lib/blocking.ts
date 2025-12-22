import { supabase } from './supabase';

/**
 * Check if a user is blocked by the current user
 */
export async function isUserBlocked(blockedUserId: string, currentUserId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('blocked_users')
    .select('id')
    .eq('blocker_id', currentUserId)
    .eq('blocked_id', blockedUserId)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows returned
    console.error('Error checking block status:', error);
  }

  return !!data;
}

/**
 * Check if current user is blocked by another user (bidirectional check)
 */
export async function isBlockedByUser(blockerUserId: string, currentUserId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('blocked_users')
    .select('id')
    .eq('blocker_id', blockerUserId)
    .eq('blocked_id', currentUserId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking block status:', error);
  }

  return !!data;
}

/**
 * Check if two users have blocked each other (bidirectional)
 */
export async function areUsersBlocked(userId1: string, userId2: string): Promise<boolean> {
  const [blocked1, blocked2] = await Promise.all([
    isUserBlocked(userId2, userId1),
    isUserBlocked(userId1, userId2),
  ]);

  return blocked1 || blocked2;
}

/**
 * Get list of blocked user IDs for a user
 */
export async function getBlockedUserIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('blocked_users')
    .select('blocked_id')
    .eq('blocker_id', userId);

  if (error) {
    console.error('Error fetching blocked users:', error);
    return [];
  }

  return data?.map((item) => item.blocked_id) || [];
}

