import { useMessages } from "@/hooks/use-database";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { getChat, markMessagesAsRead, sendMessage } from "@/lib/database";
import type { Chat, Message } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "./stores/useAuthStore";

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const params = useLocalSearchParams<{ id?: string }>();
  const conversationId = params.id;
  const { user } = useAuthStore();
  const { messages, loading: messagesLoading } = useMessages(
    conversationId || null
  );
  const [chat, setChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const [sellerProfile, setSellerProfile] = useState<any>(null);
  const [product, setProduct] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [sending, setSending] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const translateY = useRef(new Animated.Value(0)).current;

  // Fetch chat details
  useEffect(() => {
    const fetchChatDetails = async () => {
      if (!conversationId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const chatData = await getChat(conversationId);
      if (!chatData) {
        Alert.alert("Error", "Chat not found");
        router.back();
        setLoading(false);
        return;
      }

      setChat(chatData);

      // Determine the other user (seller if current user is buyer, buyer if current user is seller)
      const otherUserId =
        chatData.buyer_id === user?.id ? chatData.seller_id : chatData.buyer_id;

      // Fetch other user's profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", otherUserId)
        .single();
      setSellerProfile(profile);

      // Fetch product if available
      if (chatData.product_id) {
        const { data: productData } = await supabase
          .from("products")
          .select("*")
          .eq("id", chatData.product_id)
          .single();
        setProduct(productData);
      }

      // Mark messages as read
      if (user?.id) {
        await markMessagesAsRead(conversationId, user.id);
      }

      setLoading(false);
    };

    fetchChatDetails();
  }, [conversationId, user?.id]);

  useEffect(() => {
    if (showMenu) {
      translateY.setValue(0);
    }
  }, [showMenu]);

  useEffect(() => {
    // Scroll to bottom when component mounts or messages change
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: false });
    }, 100);
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || !conversationId || !user?.id || sending) {
      return;
    }

    setSending(true);
    const sentMessage = await sendMessage({
      chat_id: conversationId,
      sender_id: user.id,
      content: message.trim(),
    });

    if (sentMessage) {
      setMessage("");
    } else {
      Alert.alert("Error", "Failed to send message");
    }
    setSending(false);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
    }
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Pan responder for swipe down to dismiss
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return (
          gestureState.dy > 0 &&
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx)
        );
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 150) {
          // Dismiss if swiped down more than 150px
          Animated.timing(translateY, {
            toValue: 1000,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            setShowMenu(false);
            translateY.setValue(0);
          });
        } else {
          // Snap back
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  if (loading || !chat) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.backgroundColor,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#EC4899" />
      </View>
    );
  }

  const sellerName =
    sellerProfile?.full_name || sellerProfile?.username || "Unknown User";
  const sellerAvatar = sellerProfile?.avatar_url;
  const productName = product?.name || "No product";
  const productPrice = product?.price
    ? `R ${
        typeof product.price === "number"
          ? product.price.toFixed(2)
          : product.price
      }`
    : "N/A";
  const productImage =
    product?.images &&
    Array.isArray(product.images) &&
    product.images.length > 0
      ? product.images[0]
      : "";

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: colors.backgroundColor,
          paddingTop: insets.top,
        }}
      >
        <StatusBar style={colors.statusBarStyle} />
        {/* Header */}
        <View
          style={{
            backgroundColor: colors.backgroundColor,
            paddingLeft: Math.max(insets.left, 24),
            paddingRight: Math.max(insets.right, 24),
            paddingTop: 24,
            paddingBottom: 24,
            borderBottomWidth: 1,
            borderBottomColor: colors.borderColor,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Pressable
              onPress={() => router.back()}
              style={{ marginRight: 16 }}
            >
              <Ionicons name="arrow-back" size={24} color={colors.textColor} />
            </Pressable>

            {/* Seller Avatar - Clickable */}
            <Pressable
              onPress={() =>
                router.push(`/seller-profile?id=${chat.seller_id}`)
              }
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                overflow: "hidden",
                marginRight: 12,
                backgroundColor: colors.iconBackground,
                borderWidth: 2,
                borderColor: "#EC4899" + "40",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {sellerAvatar ? (
                <Image
                  source={{ uri: sellerAvatar }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                />
              ) : (
                <Ionicons
                  name="person"
                  size={24}
                  color={colors.secondaryTextColor}
                />
              )}
            </Pressable>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: colors.textColor,
                  fontSize: 20,
                  fontWeight: "bold",
                  marginBottom: 2,
                }}
              >
                {sellerName}
              </Text>
              <Text style={{ color: colors.secondaryTextColor, fontSize: 12 }}>
                Active now
              </Text>
            </View>

            <Pressable
              onPress={() => setShowMenu(true)}
              style={{
                backgroundColor: colors.cardBackground,
                borderRadius: 12,
                width: 40,
                height: 40,
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 1,
                borderColor: colors.borderColor,
              }}
            >
              <Ionicons
                name="ellipsis-vertical"
                size={20}
                color={colors.textColor}
              />
            </Pressable>
          </View>
        </View>

        {/* Product Info Card */}
        {product && (
          <Pressable
            onPress={() => {
              router.push(`/buy-item?id=${product.id}`);
            }}
            style={{
              backgroundColor: colors.cardBackground,
              marginHorizontal: Math.max(insets.left, 24),
              marginRight: Math.max(insets.right, 24),
              marginTop: 12,
              marginBottom: 8,
              borderRadius: 12,
              padding: 12,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            {productImage ? (
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 8,
                  overflow: "hidden",
                  marginRight: 12,
                  backgroundColor: colors.iconBackground,
                }}
              >
                <Image
                  source={{ uri: productImage }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                />
              </View>
            ) : (
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 8,
                  backgroundColor: colors.iconBackground,
                  marginRight: 12,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons
                  name="cube-outline"
                  size={24}
                  color={colors.secondaryTextColor}
                />
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: colors.textColor,
                  fontSize: 14,
                  fontWeight: "600",
                }}
                numberOfLines={1}
              >
                {productName}
              </Text>
              <Text
                style={{
                  color: "#EC4899",
                  fontSize: 16,
                  fontWeight: "bold",
                  marginTop: 4,
                }}
              >
                {productPrice}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.secondaryTextColor}
            />
          </Pressable>
        )}

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: Math.max(insets.left, 24),
            paddingRight: Math.max(insets.right, 24),
            paddingTop: 16,
            paddingBottom: 16,
          }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          {messagesLoading ? (
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
          ) : messages.length === 0 ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                paddingTop: 40,
              }}
            >
              <Text style={{ color: colors.secondaryTextColor, fontSize: 16 }}>
                No messages yet. Start the conversation!
              </Text>
            </View>
          ) : (
            messages.map((msg: Message) => {
              const isUser = msg.sender_id === user?.id;
              return (
                <View
                  key={msg.id}
                  style={{
                    marginBottom: 16,
                    alignItems: isUser ? "flex-end" : "flex-start",
                  }}
                >
                  <View
                    style={{
                      maxWidth: "75%",
                      backgroundColor: isUser
                        ? "#EC4899"
                        : colors.cardBackground,
                      borderRadius: 16,
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      borderTopLeftRadius: isUser ? 16 : 4,
                      borderTopRightRadius: isUser ? 4 : 16,
                    }}
                  >
                    <Text
                      style={{
                        color: isUser ? "#FFFFFF" : colors.textColor,
                        fontSize: 14,
                        lineHeight: 20,
                      }}
                    >
                      {msg.content}
                    </Text>
                    <Text
                      style={{
                        color: isUser
                          ? "rgba(255, 255, 255, 0.8)"
                          : colors.secondaryTextColor,
                        fontSize: 12,
                        marginTop: 4,
                        textAlign: "right",
                      }}
                    >
                      {formatTime(msg.created_at)}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>

        {/* Message Input */}
        <View
          style={{
            backgroundColor: colors.backgroundColor,
            borderTopWidth: 1,
            borderTopColor: colors.borderColor,
            paddingLeft: Math.max(insets.left, 24),
            paddingRight: Math.max(insets.right, 24),
            paddingTop: 12,
            paddingBottom: Math.max(insets.bottom, 12),
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-end",
              gap: 12,
            }}
          >
            {/* Chat Input */}
            <View style={{ flex: 1 }}>
              <TextInput
                placeholder="Type a message..."
                placeholderTextColor={colors.secondaryTextColor}
                value={message}
                onChangeText={setMessage}
                multiline
                maxLength={500}
                style={{
                  backgroundColor: colors.cardBackground,
                  borderRadius: 24,
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  fontSize: 14,
                  color: colors.textColor,
                  minHeight: 48,
                  maxHeight: 100,
                  textAlignVertical: "center",
                }}
              />
            </View>

            {/* Send Button */}
            <Pressable
              onPress={handleSend}
              disabled={!message.trim() || sending}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor:
                  message.trim() && !sending
                    ? "#EC4899"
                    : colors.cardBackground,
                justifyContent: "center",
                alignItems: "center",
                opacity: !message.trim() || sending ? 0.5 : 1,
              }}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons
                  name="send"
                  size={20}
                  color={message.trim() ? "#FFFFFF" : colors.secondaryTextColor}
                />
              )}
            </Pressable>
          </View>
        </View>

        {/* Chat Menu Modal */}
        <Modal
          visible={showMenu}
          transparent
          animationType="fade"
          onRequestClose={() => {
            translateY.setValue(0);
            setShowMenu(false);
          }}
        >
          <Pressable
            style={{
              flex: 1,
              backgroundColor: colors.backgroundColor + "CC",
              justifyContent: "flex-end",
            }}
            onPress={() => {
              translateY.setValue(0);
              setShowMenu(false);
            }}
          >
            <Animated.View
              style={{
                backgroundColor: colors.cardBackground,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                paddingTop: 12,
                paddingBottom: Math.max(insets.bottom, 24),
                paddingHorizontal: Math.max(insets.left, 0),
                paddingRight: Math.max(insets.right, 0),
                shadowColor: "#000",
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 20,
                transform: [{ translateY }],
              }}
              {...panResponder.panHandlers}
            >
              {/* Handle Bar */}
              <View
                style={{
                  width: 40,
                  height: 4,
                  backgroundColor: colors.secondaryTextColor,
                  borderRadius: 2,
                  alignSelf: "center",
                  marginBottom: 16,
                  opacity: 0.5,
                }}
              />

              {/* Heading */}
              <View style={{ paddingHorizontal: 24, marginBottom: 16 }}>
                <Text
                  style={{
                    color: colors.textColor,
                    fontSize: 18,
                    fontWeight: "bold",
                  }}
                >
                  Actions
                </Text>
              </View>

              {/* Menu Items */}
              <View style={{ paddingHorizontal: 24, gap: 20 }}>
                {/* Regular Actions Card */}
                <View
                  style={{
                    backgroundColor: colors.iconBackground,
                    borderRadius: 12,
                    padding: 12,
                    gap: 12,
                  }}
                >
                  <Pressable
                    onPress={() => {
                      setShowMenu(false);
                      router.push(`/seller-profile?id=${chat.seller_id}`);
                    }}
                    style={({ pressed }) => ({
                      paddingVertical: 10,
                      paddingHorizontal: 8,
                      borderRadius: 8,
                      backgroundColor: pressed
                        ? colors.iconBackground
                        : "transparent",
                    })}
                  >
                    <View className="flex flex-row items-center gap-3">
                      <Ionicons
                        name="person-outline"
                        size={18}
                        color={colors.textColor}
                      />
                      <Text
                        style={{
                          color: colors.textColor,
                          fontSize: 16,
                          fontWeight: "500",
                        }}
                      >
                        View Profile
                      </Text>
                    </View>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      setShowMenu(false);
                      Alert.alert("Notifications", "Chat notifications muted");
                    }}
                    style={({ pressed }) => ({
                      paddingVertical: 10,
                      paddingHorizontal: 8,
                      borderRadius: 8,
                      backgroundColor: pressed
                        ? colors.iconBackground
                        : "transparent",
                    })}
                  >
                    <View className="flex flex-row items-center gap-3">
                      <Ionicons
                        name="notifications-outline"
                        size={18}
                        color={colors.textColor}
                      />
                      <Text
                        style={{
                          color: colors.textColor,
                          fontSize: 16,
                          fontWeight: "500",
                        }}
                      >
                        Mute Notifications
                      </Text>
                    </View>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      setShowMenu(false);
                      if (product) {
                        router.push(`/buy-item?id=${product.id}`);
                      }
                    }}
                    disabled={!product}
                    style={({ pressed }) => ({
                      paddingVertical: 10,
                      paddingHorizontal: 8,
                      borderRadius: 8,
                      backgroundColor: pressed
                        ? colors.iconBackground
                        : "transparent",
                    })}
                  >
                    <View className="flex flex-row items-center gap-3">
                      <Ionicons
                        name="cube-outline"
                        size={18}
                        color={colors.textColor}
                      />
                      <Text
                        style={{
                          color: colors.textColor,
                          fontSize: 16,
                          fontWeight: "500",
                        }}
                      >
                        View Product
                      </Text>
                    </View>
                  </Pressable>
                </View>

                {/* Destructive Actions Card */}
                <View
                  style={{
                    backgroundColor: colors.iconBackground,
                    borderRadius: 12,
                    padding: 12,
                    gap: 12,
                  }}
                >
                  <Pressable
                    onPress={() => {
                      setShowMenu(false);
                      Alert.alert(
                        "Block User",
                        `Are you sure you want to block ${sellerName}?`,
                        [
                          { text: "Cancel", style: "cancel" },
                          {
                            text: "Block",
                            style: "destructive",
                            onPress: () =>
                              Alert.alert("Blocked", "User has been blocked"),
                          },
                        ]
                      );
                    }}
                    style={({ pressed }) => ({
                      paddingVertical: 10,
                      paddingHorizontal: 8,
                      borderRadius: 8,
                      backgroundColor: pressed
                        ? colors.iconBackground
                        : "transparent",
                    })}
                  >
                    <View className="flex flex-row items-center gap-3">
                      <Ionicons name="ban-outline" size={18} color="#EF4444" />
                      <Text
                        style={{
                          color: colors.textColor,
                          fontSize: 16,
                          fontWeight: "500",
                        }}
                      >
                        Block User
                      </Text>
                    </View>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      setShowMenu(false);
                      Alert.alert(
                        "Report User",
                        `Report ${sellerName} for inappropriate behavior?`,
                        [
                          { text: "Cancel", style: "cancel" },
                          {
                            text: "Report",
                            style: "destructive",
                            onPress: () =>
                              Alert.alert(
                                "Reported",
                                "Thank you for your report"
                              ),
                          },
                        ]
                      );
                    }}
                    style={({ pressed }) => ({
                      paddingVertical: 10,
                      paddingHorizontal: 8,
                      borderRadius: 8,
                      backgroundColor: pressed
                        ? colors.iconBackground
                        : "transparent",
                    })}
                  >
                    <View className="flex flex-row items-center gap-3">
                      <Ionicons name="flag-outline" size={18} color="#EF4444" />
                      <Text
                        style={{
                          color: colors.textColor,
                          fontSize: 16,
                          fontWeight: "500",
                        }}
                      >
                        Report User
                      </Text>
                    </View>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      setShowMenu(false);
                      Alert.alert(
                        "Delete Chat",
                        "Are you sure you want to delete this conversation?",
                        [
                          { text: "Cancel", style: "cancel" },
                          {
                            text: "Delete",
                            style: "destructive",
                            onPress: () => {
                              Alert.alert("Deleted", "Chat has been deleted");
                              router.back();
                            },
                          },
                        ]
                      );
                    }}
                    style={({ pressed }) => ({
                      paddingVertical: 10,
                      paddingHorizontal: 8,
                      borderRadius: 8,
                      backgroundColor: pressed
                        ? colors.iconBackground
                        : "transparent",
                    })}
                  >
                    <View className="flex flex-row items-center gap-3">
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color="#EF4444"
                      />
                      <Text
                        style={{
                          color: colors.textColor,
                          fontSize: 16,
                          fontWeight: "500",
                        }}
                      >
                        Delete Chat
                      </Text>
                    </View>
                  </Pressable>
                </View>
              </View>
            </Animated.View>
          </Pressable>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
}
