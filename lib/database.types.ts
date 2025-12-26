/**
 * Database types for PartPulse marketplace
 * These types match the Supabase database schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          full_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          seller_id: string;
          name: string;
          description: string | null;
          price: number;
          condition: 'A+' | 'A' | 'B' | 'C' | 'D';
          category: string;
          brand: string | null;
          model: string | null;
          images: string[];
          status: 'active' | 'sold' | 'draft';
          listing_type: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          seller_id: string;
          name: string;
          description?: string | null;
          price: number;
          condition: 'A+' | 'A' | 'B' | 'C' | 'D';
          category: string;
          brand?: string | null;
          model?: string | null;
          images?: string[];
          status?: 'active' | 'sold' | 'draft';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          seller_id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          condition?: 'A+' | 'A' | 'B' | 'C' | 'D';
          category?: string;
          brand?: string | null;
          model?: string | null;
          images?: string[];
          status?: 'active' | 'sold' | 'draft';
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          buyer_id: string;
          seller_id: string;
          product_id: string;
          total_amount: number;
          status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
          shipping_address: Json;
          payment_method: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          buyer_id: string;
          seller_id: string;
          product_id: string;
          total_amount: number;
          status?: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
          shipping_address: Json;
          payment_method?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          buyer_id?: string;
          seller_id?: string;
          product_id?: string;
          total_amount?: number;
          status?: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
          shipping_address?: Json;
          payment_method?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      wishlist: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          created_at?: string;
        };
      };
      chats: {
        Row: {
          id: string;
          buyer_id: string;
          seller_id: string;
          product_id: string | null;
          last_message: string | null;
          last_message_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          buyer_id: string;
          seller_id: string;
          product_id?: string | null;
          last_message?: string | null;
          last_message_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          buyer_id?: string;
          seller_id?: string;
          product_id?: string | null;
          last_message?: string | null;
          last_message_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          chat_id: string;
          sender_id: string;
          content: string;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          chat_id: string;
          sender_id: string;
          content: string;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          chat_id?: string;
          sender_id?: string;
          content?: string;
          read?: boolean;
          created_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          order_id: string | null;
          chat_id: string | null;
          reviewer_id: string;
          reviewee_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id?: string | null;
          chat_id?: string | null;
          reviewer_id: string;
          reviewee_id: string;
          rating: number;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string | null;
          chat_id?: string | null;
          reviewer_id?: string;
          reviewee_id?: string;
          rating?: number;
          comment?: string | null;
          created_at?: string;
        };
      };
      user_rigs: {
        Row: {
          id: string;
          user_id: string;
          cpu: string | null;
          gpu: string | null;
          motherboard: string | null;
          ram: string | null;
          psu: string | null;
          pc_case: string | null;
          is_primary: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          cpu?: string | null;
          gpu?: string | null;
          motherboard?: string | null;
          ram?: string | null;
          psu?: string | null;
          pc_case?: string | null;
          is_primary?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          cpu?: string | null;
          gpu?: string | null;
          motherboard?: string | null;
          ram?: string | null;
          psu?: string | null;
          pc_case?: string | null;
          is_primary?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_rig_storage: {
        Row: {
          id: string;
          rig_id: string;
          type: 'SSD' | 'HDD' | 'NVMe' | 'M.2' | 'Other';
          capacity: string | null;
          model: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          rig_id: string;
          type: 'SSD' | 'HDD' | 'NVMe' | 'M.2' | 'Other';
          capacity?: string | null;
          model?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          rig_id?: string;
          type?: 'SSD' | 'HDD' | 'NVMe' | 'M.2' | 'Other';
          capacity?: string | null;
          model?: string | null;
          created_at?: string;
        };
      };
      product_alerts: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          alert_price: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          alert_price?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          alert_price?: number | null;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: 'price_drop' | 'product_available' | 'product_updated' | 'order' | 'message' | 'system';
          title: string;
          message: string;
          product_id: string | null;
          order_id: string | null;
          chat_id: string | null;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'price_drop' | 'product_available' | 'product_updated' | 'order' | 'message' | 'system';
          title: string;
          message: string;
          product_id?: string | null;
          order_id?: string | null;
          chat_id?: string | null;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'price_drop' | 'product_available' | 'product_updated' | 'order' | 'message' | 'system';
          title?: string;
          message?: string;
          product_id?: string | null;
          order_id?: string | null;
          chat_id?: string | null;
          read?: boolean;
          created_at?: string;
        };
      };
      blocked_users: {
        Row: {
          id: string;
          blocker_id: string;
          blocked_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          blocker_id: string;
          blocked_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          blocker_id?: string;
          blocked_id?: string;
          created_at?: string;
        };
      };
      user_reports: {
        Row: {
          id: string;
          reporter_id: string;
          reported_id: string;
          reason: 'spam' | 'harassment' | 'fake_account' | 'inappropriate_content' | 'scam' | 'other';
          description: string | null;
          status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
          admin_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          reported_id: string;
          reason: 'spam' | 'harassment' | 'fake_account' | 'inappropriate_content' | 'scam' | 'other';
          description?: string | null;
          status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          reporter_id?: string;
          reported_id?: string;
          reason?: 'spam' | 'harassment' | 'fake_account' | 'inappropriate_content' | 'scam' | 'other';
          description?: string | null;
          status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      product_views: {
        Row: {
          id: string;
          product_id: string;
          user_id: string | null;
          viewed_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          user_id?: string | null;
          viewed_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          user_id?: string | null;
          viewed_at?: string;
        };
      };
      product_clicks: {
        Row: {
          id: string;
          product_id: string;
          user_id: string | null;
          clicked_at: string;
          source: string | null;
          referrer: string | null;
        };
        Insert: {
          id?: string;
          product_id: string;
          user_id?: string | null;
          clicked_at?: string;
          source?: string | null;
          referrer?: string | null;
        };
        Update: {
          id?: string;
          product_id?: string;
          user_id?: string | null;
          clicked_at?: string;
          source?: string | null;
          referrer?: string | null;
        };
      };
      product_shares: {
        Row: {
          id: string;
          product_id: string;
          user_id: string;
          share_method: 'link' | 'social' | 'message' | 'other';
          shared_at: string;
          platform: string | null;
        };
        Insert: {
          id?: string;
          product_id: string;
          user_id: string;
          share_method: 'link' | 'social' | 'message' | 'other';
          shared_at?: string;
          platform?: string | null;
        };
        Update: {
          id?: string;
          product_id?: string;
          user_id?: string;
          share_method?: 'link' | 'social' | 'message' | 'other';
          shared_at?: string;
          platform?: string | null;
        };
      };
      product_impressions: {
        Row: {
          id: string;
          product_id: string;
          user_id: string | null;
          source: string | null;
          impressed_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          user_id?: string | null;
          source?: string | null;
          impressed_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          user_id?: string | null;
          source?: string | null;
          impressed_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      product_condition: 'A+' | 'A' | 'B' | 'C' | 'D';
      product_status: 'active' | 'sold' | 'draft';
      order_status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
    };
  };
}

// Helper types for easier usage
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Product = Database['public']['Tables']['products']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type WishlistItem = Database['public']['Tables']['wishlist']['Row'];
export type Chat = Database['public']['Tables']['chats']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
export type Review = Database['public']['Tables']['reviews']['Row'];
export type UserRig = Database['public']['Tables']['user_rigs']['Row'];
export type UserRigStorage = Database['public']['Tables']['user_rig_storage']['Row'];
export type ProductAlert = Database['public']['Tables']['product_alerts']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];

export type ProductInsert = Database['public']['Tables']['products']['Insert'];
export type ProductUpdate = Database['public']['Tables']['products']['Update'];
export type OrderInsert = Database['public']['Tables']['orders']['Insert'];
export type OrderUpdate = Database['public']['Tables']['orders']['Update'];

