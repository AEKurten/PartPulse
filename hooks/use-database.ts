/**
 * React hooks for database operations
 */

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Product, Order, Profile, Chat, Message } from '@/lib/database.types';
import {
  getProducts,
  getProduct,
  getOrders,
  getOrder,
  getWishlist,
  isInWishlist,
  getChats,
  getChat,
  getMessages,
} from '@/lib/database';

// Hook for fetching products
export function useProducts(filters?: {
  category?: string;
  seller_id?: string;
  status?: 'active' | 'sold' | 'draft';
  search?: string;
  limit?: number;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError(null);
        const data = await getProducts(filters);
        setProducts(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [filters?.category, filters?.seller_id, filters?.status, filters?.search, filters?.limit]);

  return { products, loading, error, refetch: () => getProducts(filters).then(setProducts) };
}

// Hook for fetching a single product
export function useProduct(productId: string | null) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }

    async function fetchProduct() {
      try {
        setLoading(true);
        setError(null);
        const data = await getProduct(productId);
        setProduct(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch product');
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [productId]);

  return { product, loading, error };
}

// Hook for fetching orders
export function useOrders(userId: string | null, role: 'buyer' | 'seller' = 'buyer') {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function fetchOrders() {
      try {
        setLoading(true);
        setError(null);
        const data = await getOrders(userId, role);
        setOrders(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [userId, role]);

  return { orders, loading, error, refetch: () => userId && getOrders(userId, role).then(setOrders) };
}

// Hook for fetching wishlist
export function useWishlist(userId: string | null) {
  const [wishlist, setWishlist] = useState<string[]>([]); // Array of product IDs
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function fetchWishlist() {
      try {
        setLoading(true);
        setError(null);
        const data = await getWishlist(userId);
        setWishlist(data.map((item) => item.product_id));
      } catch (err: any) {
        setError(err.message || 'Failed to fetch wishlist');
      } finally {
        setLoading(false);
      }
    }

    fetchWishlist();
  }, [userId]);

  return {
    wishlist,
    loading,
    error,
    isInWishlist: (productId: string) => wishlist.includes(productId),
    refetch: () => userId && getWishlist(userId).then((data) => setWishlist(data.map((item) => item.product_id))),
  };
}

// Hook for fetching chats
export function useChats(userId: string | null) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function fetchChats() {
      try {
        setLoading(true);
        setError(null);
        const data = await getChats(userId);
        setChats(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch chats');
      } finally {
        setLoading(false);
      }
    }

    fetchChats();
  }, [userId]);

  return { chats, loading, error, refetch: () => userId && getChats(userId).then(setChats) };
}

// Hook for fetching messages in a chat
export function useMessages(chatId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!chatId) {
      setLoading(false);
      return;
    }

    async function fetchMessages() {
      try {
        setLoading(true);
        setError(null);
        const data = await getMessages(chatId);
        setMessages(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch messages');
      } finally {
        setLoading(false);
      }
    }

    fetchMessages();

    // Set up real-time subscription for new messages
    const channel = supabase
      .channel(`chat:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  return { messages, loading, error };
}

// Hook for current user
export function useCurrentUser() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        setLoading(true);
        const {
          data: { user: currentUser },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        setUser(currentUser);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to get user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading, error };
}

