import { useChats } from "@/hooks/use-database";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { getChats } from "@/lib/database";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "./stores/useAuthStore";

interface ChatWithDetails {
  id: string;
  sellerName: string;
  sellerAvatar: string | null;
  productName: string;
  productImage: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

export default function ChatsScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const { user } = useAuthStore();
  const { chats, loading, refetch } = useChats(user?.id || null);
  const [conversations, setConversations] = useState<ChatWithDetails[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchChatDetails = async (chatsToProcess: typeof chats) => {
    if (!chatsToProcess.length) {
      setConversations([]);
      setLoadingDetails(false);
      return;
    }

    setLoadingDetails(true);
    const chatDetails = await Promise.all(
      chatsToProcess.map(async (chat) => {
        // Determine the other user (seller if current user is buyer, buyer if current user is seller)
        const otherUserId =
          chat.buyer_id === user?.id ? chat.seller_id : chat.buyer_id;

        // Fetch other user's profile
        let profile = null;
        if (otherUserId) {
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("username, avatar_url")
            .eq("id", otherUserId)
            .single();

          if (profileError) {
            // PGRST116 means no rows found - profile might not exist, which is okay
            if (profileError.code !== "PGRST116") {
              console.error(
                "Error fetching profile for user",
                otherUserId,
                ":",
                profileError
              );
            }
          } else {
            profile = profileData;
          }
        } else {
          console.warn("otherUserId is missing for chat", chat.id);
        }

        // Fetch product if available
        let productName = "No product";
        let productImage = "";
        if (chat.product_id) {
          const { data: product } = await supabase
            .from("products")
            .select("name, images")
            .eq("id", chat.product_id)
            .single();
          if (product) {
            productName = product.name;
            productImage =
              Array.isArray(product.images) && product.images.length > 0
                ? product.images[0]
                : "";
          }
        }

        // Count unread messages
        const { count } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("chat_id", chat.id)
          .eq("read", false)
          .neq("sender_id", user?.id || "");

        // Format timestamp
        const formatTimestamp = (dateString: string | null) => {
          if (!dateString) return "";
          const date = new Date(dateString);
          const now = new Date();
          const diffMs = now.getTime() - date.getTime();
          const diffMins = Math.floor(diffMs / 60000);
          const diffHours = Math.floor(diffMs / 3600000);
          const diffDays = Math.floor(diffMs / 86400000);

          if (diffMins < 1) return "Just now";
          if (diffMins < 60) return `${diffMins}m ago`;
          if (diffHours < 24) return `${diffHours}h ago`;
          if (diffDays < 7) return `${diffDays}d ago`;
          return date.toLocaleDateString();
        };

        return {
          id: chat.id,
          sellerName: profile?.username || "Unknown User",
          sellerAvatar: profile?.avatar_url || null,
          productName,
          productImage,
          lastMessage: chat.last_message || "No messages yet",
          timestamp: formatTimestamp(chat.last_message_at || chat.updated_at),
          unreadCount: count || 0,
        };
      })
    );

    setConversations(chatDetails);
    setLoadingDetails(false);
  };

  useEffect(() => {
    if (!loading && chats) {
      fetchChatDetails(chats);
    }
  }, [chats, loading, user?.id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (user?.id) {
        const refreshedChats = await getChats(user.id);
        await fetchChatDetails(refreshedChats);
        // Update the hook's state to keep it in sync
        if (refetch) {
          refetch();
        }
      }
    } catch (error) {
      console.error("Error refreshing chats:", error);
    } finally {
      setRefreshing(false);
    }
  }, [user?.id, refetch]);

  // Refresh chats when screen comes into focus (e.g., when navigating back from a chat)
  useFocusEffect(
    useCallback(() => {
      // Refresh chats when screen comes into focus
      if (user?.id) {
        getChats(user.id)
          .then((refreshedChats) => {
            fetchChatDetails(refreshedChats);
            // Also update the hook's state
            if (refetch) {
              refetch();
            }
          })
          .catch((error) => {
            console.error("Error refreshing chats on focus:", error);
          });
      }
      // We intentionally omit fetchChatDetails and refetch from deps to avoid infinite loops
      // fetchChatDetails uses user?.id from closure, and refetch is called but not depended on
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id])
  );

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.backgroundColor,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <StatusBar style={colors.statusBarStyle} />
      {/* Header */}
      <View
        style={{
          paddingLeft: Math.max(insets.left, 24),
          paddingRight: Math.max(insets.right, 24),
          paddingTop: 24,
          paddingBottom: 24,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <Pressable onPress={() => router.back()} style={{ marginRight: 16 }}>
            <Ionicons name="arrow-back" size={24} color={colors.textColor} />
          </Pressable>
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: "#EC4899" + "20",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 12,
              }}
            >
              <Ionicons name="chatbubbles" size={24} color="#EC4899" />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: colors.textColor,
                  fontSize: 28,
                  fontWeight: "bold",
                  marginBottom: 4,
                }}
              >
                Messages
              </Text>
              <Text style={{ color: colors.secondaryTextColor, fontSize: 14 }}>
                Your conversations
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Conversations List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingLeft: Math.max(insets.left, 24),
          paddingRight: Math.max(insets.right, 24),
          paddingBottom: 24,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.textColor}
            colors={["#EC4899"]}
          />
        }
      >
        {loading || loadingDetails ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingTop: 40,
            }}
          >
            <ActivityIndicator size="large" color="#EC4899" />
          </View>
        ) : conversations.length === 0 ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingTop: 40,
            }}
          >
            <Ionicons
              name="chatbubbles-outline"
              size={64}
              color={colors.secondaryTextColor}
            />
            <Text
              style={{
                color: colors.secondaryTextColor,
                fontSize: 16,
                marginTop: 16,
              }}
            >
              No conversations yet
            </Text>
          </View>
        ) : (
          conversations.map((conversation) => (
            <Pressable
              key={conversation.id}
              onPress={() => {
                router.push(`/chat?id=${conversation.id}`);
              }}
            >
              {({ pressed }) => (
                <View
                  style={{
                    backgroundColor: colors.cardBackground,
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 12,
                    flexDirection: "row",
                    opacity: pressed ? 0.8 : 1,
                  }}
                >
                  {/* Seller Avatar */}
                  <View
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 28,
                      overflow: "hidden",
                      marginRight: 12,
                      backgroundColor: colors.iconBackground,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {conversation.sellerAvatar ? (
                      <Image
                        source={{ uri: conversation.sellerAvatar }}
                        style={{ width: "100%", height: "100%" }}
                        contentFit="cover"
                      />
                    ) : (
                      <Ionicons
                        name="person"
                        size={28}
                        color={colors.secondaryTextColor}
                      />
                    )}
                  </View>

                  {/* Conversation Info */}
                  <View style={{ flex: 1, justifyContent: "center" }}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 4,
                      }}
                    >
                      <Text
                        style={{
                          color: colors.textColor,
                          fontSize: 16,
                          fontWeight: "600",
                        }}
                        numberOfLines={1}
                      >
                        {conversation.sellerName}
                      </Text>
                      <Text
                        style={{
                          color: colors.secondaryTextColor,
                          fontSize: 12,
                        }}
                      >
                        {conversation.timestamp}
                      </Text>
                    </View>
                    {/* Product Preview */}
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 6,
                        gap: 8,
                      }}
                    >
                      <Text
                        style={{
                          color: colors.secondaryTextColor,
                          fontSize: 12,
                          flex: 1,
                        }}
                        numberOfLines={1}
                      >
                        {conversation.productName}
                      </Text>
                    </View>

                    {/* Last Message */}
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Text
                        style={{
                          color:
                            conversation.unreadCount > 0
                              ? colors.textColor
                              : colors.secondaryTextColor,
                          fontSize: 14,
                          fontWeight:
                            conversation.unreadCount > 0 ? "600" : "400",
                          flex: 1,
                        }}
                        numberOfLines={1}
                      >
                        {conversation.lastMessage}
                      </Text>
                      {conversation.unreadCount > 0 && (
                        <View
                          style={{
                            backgroundColor: "#EC4899",
                            borderRadius: 10,
                            minWidth: 20,
                            height: 20,
                            paddingHorizontal: 6,
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Text
                            style={{
                              color: "#FFFFFF",
                              fontSize: 12,
                              fontWeight: "bold",
                            }}
                          >
                            {conversation.unreadCount}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              )}
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}
