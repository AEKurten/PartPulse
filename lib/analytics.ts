import { supabase } from './supabase';

/**
 * Track a product view (only once per user per product)
 */
export async function trackProductView(
  productId: string,
  userId: string | null,
  options?: { onConflict?: 'ignore' | 'update' }
): Promise<{ success: boolean; error?: any }> {
  try {
    if (!productId) {
      return { success: false, error: 'Product ID is required' };
    }

    // Don't track views if user is viewing their own listing
    if (userId) {
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('seller_id')
        .eq('id', productId)
        .single();

      if (productError) {
        console.error('Error fetching product for view tracking:', productError);
        // Continue with tracking if we can't verify ownership
      } else if (product && product.seller_id === userId) {
        // User is the seller, don't track this view
        return { success: true }; // Return success but don't actually track
      }
    }

    // If user is logged in, track with user_id (unique constraint ensures one view per user)
    // If anonymous, we can still track but won't have uniqueness constraint
    const { error } = await supabase
      .from('product_views')
      .insert({
        product_id: productId,
        user_id: userId || null,
      })
      .select()
      .single();

    // Ignore duplicate key errors (user already viewed this product)
    if (error) {
      if (error.code === '23505') {
        // Unique constraint violation - user already viewed this product
        return { success: true }; // Consider this a success (already tracked)
      }
      console.error('Error tracking product view:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error tracking product view:', error);
    return { success: false, error };
  }
}

/**
 * Track a product click
 */
export async function trackProductClick(
  productId: string,
  userId: string | null,
  options?: {
    source?: string; // e.g., 'marketplace', 'wishlist', 'search', 'seller_profile'
    referrer?: string; // e.g., URL or screen name
  }
): Promise<{ success: boolean; error?: any }> {
  try {
    if (!productId) {
      return { success: false, error: 'Product ID is required' };
    }

    // Don't track clicks if user is viewing their own listing
    if (userId) {
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('seller_id')
        .eq('id', productId)
        .single();

      if (productError) {
        console.error('Error fetching product for click tracking:', productError);
        // Continue with tracking if we can't verify ownership
      } else if (product && product.seller_id === userId) {
        // User is the seller, don't track this click
        return { success: true }; // Return success but don't actually track
      }
    }

    const { error } = await supabase
      .from('product_clicks')
      .insert({
        product_id: productId,
        user_id: userId || null,
        source: options?.source || null,
        referrer: options?.referrer || null,
      });

    if (error) {
      console.error('Error tracking product click:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error tracking product click:', error);
    return { success: false, error };
  }
}

/**
 * Track a product share
 */
export async function trackProductShare(
  productId: string,
  userId: string,
  shareMethod: 'link' | 'social' | 'message' | 'other',
  platform?: string // e.g., 'whatsapp', 'facebook', 'twitter', 'copy_link'
): Promise<{ success: boolean; error?: any }> {
  try {
    if (!productId || !userId) {
      return { success: false, error: 'Product ID and User ID are required' };
    }

    const { error } = await supabase
      .from('product_shares')
      .insert({
        product_id: productId,
        user_id: userId,
        share_method: shareMethod,
        platform: platform || null,
      });

    if (error) {
      console.error('Error tracking product share:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error tracking product share:', error);
    return { success: false, error };
  }
}

/**
 * Track a product impression (when product card becomes visible)
 */
export async function trackProductImpression(
  productId: string,
  userId: string | null,
  source?: string // e.g., 'marketplace', 'wishlist', 'seller_profile', 'home'
): Promise<{ success: boolean; error?: any }> {
  try {
    if (!productId) {
      return { success: false, error: 'Product ID is required' };
    }

    // Don't track impressions if user is viewing their own listing
    if (userId) {
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('seller_id')
        .eq('id', productId)
        .single();

      if (productError) {
        console.error('Error fetching product for impression tracking:', productError);
        // Continue with tracking if we can't verify ownership
      } else if (product && product.seller_id === userId) {
        // User is the seller, don't track this impression
        return { success: true }; // Return success but don't actually track
      }
    }

    const { error } = await supabase
      .from('product_impressions')
      .insert({
        product_id: productId,
        user_id: userId || null,
        source: source || null,
      })
      .select()
      .single();

    // Ignore duplicate key errors (user already impressed this product today)
    if (error) {
      if (error.code === '23505') {
        // Unique constraint violation - user already impressed this product today
        return { success: true }; // Consider this a success (already tracked)
      }
      console.error('Error tracking product impression:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error tracking product impression:', error);
    return { success: false, error };
  }
}

/**
 * Get product analytics (view count, click count, share count, impression count)
 */
export async function getProductAnalytics(productId: string): Promise<{
  viewCount: number;
  clickCount: number;
  shareCount: number;
  impressionCount: number;
} | null> {
  try {
    const [viewsResult, clicksResult, sharesResult, impressionsResult] = await Promise.all([
      supabase
        .from('product_views')
        .select('id', { count: 'exact', head: true })
        .eq('product_id', productId),
      supabase
        .from('product_clicks')
        .select('id', { count: 'exact', head: true })
        .eq('product_id', productId),
      supabase
        .from('product_shares')
        .select('id', { count: 'exact', head: true })
        .eq('product_id', productId),
      supabase
        .from('product_impressions')
        .select('id', { count: 'exact', head: true })
        .eq('product_id', productId),
    ]);

    return {
      viewCount: viewsResult.count || 0,
      clickCount: clicksResult.count || 0,
      shareCount: sharesResult.count || 0,
      impressionCount: impressionsResult.count || 0,
    };
  } catch (error: any) {
    console.error('Error fetching product analytics:', error);
    return null;
  }
}

/**
 * Check if user has viewed a product
 */
export async function hasUserViewedProduct(
  productId: string,
  userId: string | null
): Promise<boolean> {
  if (!userId) return false;

  try {
    const { data, error } = await supabase
      .from('product_views')
      .select('id')
      .eq('product_id', productId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      console.error('Error checking product view:', error);
      return false;
    }

    return !!data;
  } catch (error: any) {
    console.error('Error checking product view:', error);
    return false;
  }
}

/**
 * Get trending products based on views, clicks, and shares
 */
export async function getTrendingProducts(
  limit: number = 20,
  timeRange: 'day' | 'week' | 'month' | 'all' = 'week'
): Promise<any[]> {
  try {
    const timeFilter = getTimeFilter(timeRange);

    // Get products with their analytics scores
    const { data, error } = await supabase
      .rpc('get_trending_products', {
        p_limit: limit,
        p_time_range: timeFilter,
      });

    if (error) {
      // If RPC doesn't exist, fall back to manual query
      return getTrendingProductsFallback(limit, timeRange);
    }

    return data || [];
  } catch (error: any) {
    console.error('Error fetching trending products:', error);
    return getTrendingProductsFallback(limit, timeRange);
  }
}

/**
 * Fallback method to get trending products
 */
async function getTrendingProductsFallback(
  limit: number,
  timeRange: 'day' | 'week' | 'month' | 'all'
): Promise<any[]> {
  const timeFilter = getTimeFilter(timeRange);

  try {
    // Get products with aggregated analytics
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        *,
        product_views!inner(count),
        product_clicks!inner(count),
        product_shares!inner(count)
      `)
      .eq('status', 'active')
      .gte('created_at', timeFilter)
      .limit(limit);

    if (error) {
      console.error('Error fetching trending products fallback:', error);
      return [];
    }

    // Sort by combined score (views * 1 + clicks * 2 + shares * 3)
    return (products || []).sort((a, b) => {
      const scoreA = (a.product_views?.length || 0) + (a.product_clicks?.length || 0) * 2 + (a.product_shares?.length || 0) * 3;
      const scoreB = (b.product_views?.length || 0) + (b.product_clicks?.length || 0) * 2 + (b.product_shares?.length || 0) * 3;
      return scoreB - scoreA;
    });
  } catch (error: any) {
    console.error('Error in trending products fallback:', error);
    return [];
  }
}

/**
 * Get time filter for SQL queries
 */
function getTimeFilter(timeRange: 'day' | 'week' | 'month' | 'all'): string {
  const now = new Date();
  let date = new Date();

  switch (timeRange) {
    case 'day':
      date.setDate(now.getDate() - 1);
      break;
    case 'week':
      date.setDate(now.getDate() - 7);
      break;
    case 'month':
      date.setMonth(now.getMonth() - 1);
      break;
    case 'all':
    default:
      return '1970-01-01T00:00:00Z';
  }

  return date.toISOString();
}

