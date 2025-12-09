import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, KeyboardAvoidingView, Modal, PanResponder, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { StatusBar } from 'expo-status-bar';

// Mock conversation data (in real app, this would come from route params or API)
const getConversationData = (id: string) => {
  const conversations: Record<string, any> = {
    '1': {
      id: 1,
      sellerName: 'TechGuru',
      sellerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&q=80',
      productName: 'NVIDIA GeForce RTX 4090',
      productPrice: '$1,599',
      productImage: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=200&h=200&fit=crop&q=80',
      messages: [
        {
          id: 1,
          text: "Hi, I'm interested in your NVIDIA GeForce RTX 4090",
          sender: 'user',
          timestamp: '10:30 AM',
        },
        {
          id: 2,
          text: 'Hello! Thanks for your interest. Yes, it\'s still available. The card is in excellent condition.',
          sender: 'seller',
          timestamp: '10:32 AM',
        },
        {
          id: 3,
          text: 'Great! Can you tell me more about its condition? Any issues or concerns?',
          sender: 'user',
          timestamp: '10:35 AM',
        },
        {
          id: 4,
          text: 'Absolutely! The card has been used for about 3 months, mainly for gaming. No mining, no overclocking. It\'s been kept in a well-ventilated case. Original packaging and all accessories included.',
          sender: 'seller',
          timestamp: '10:37 AM',
        },
        {
          id: 5,
          text: 'That sounds perfect! Is the price negotiable?',
          sender: 'user',
          timestamp: '10:40 AM',
        },
        {
          id: 6,
          text: 'I\'m open to reasonable offers. What were you thinking?',
          sender: 'seller',
          timestamp: '10:42 AM',
        },
      ],
    },
    '2': {
      id: 2,
      sellerName: 'PCBuilder Pro',
      sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80',
      productName: 'Intel i9-14900K',
      productPrice: '$579',
      productImage: 'https://images.unsplash.com/photo-1587825147138-346b006e0937?w=200&h=200&fit=crop&q=80',
      messages: [
        {
          id: 1,
          text: 'Is this still available?',
          sender: 'user',
          timestamp: 'Yesterday',
        },
        {
          id: 2,
          text: 'Yes, it is! Are you interested?',
          sender: 'seller',
          timestamp: 'Yesterday',
        },
      ],
    },
    '3': {
      id: 3,
      sellerName: 'Hardware Haven',
      sellerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&q=80',
      productName: 'ASUS ROG Motherboard',
      productPrice: '$349',
      productImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=200&h=200&fit=crop&q=80',
      messages: [
        {
          id: 1,
          text: 'Thanks for your interest! Yes, it is.',
          sender: 'seller',
          timestamp: '3 days ago',
        },
      ],
    },
  };

  return conversations[id] || conversations['1'];
};

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const params = useLocalSearchParams<{ id?: string }>();
  const conversationId = params.id || '1';
  const conversation = getConversationData(conversationId);
  const [message, setMessage] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const translateY = useRef(new Animated.Value(0)).current;

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
  }, [conversation.messages]);

  const handleSend = () => {
    if (message.trim()) {
      // In real app, this would send the message to the backend
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  const formatTime = (timestamp: string) => {
    // Simple time formatting - in real app, use a proper date library
    return timestamp;
  };

  // Pan responder for swipe down to dismiss
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 0 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
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
            paddingTop: 16,
            paddingBottom: 16,
            flexDirection: 'row',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: colors.borderColor,
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
            onPress={() => router.push('/seller-profile')}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              overflow: 'hidden',
              marginRight: 12,
              backgroundColor: colors.iconBackground,
            }}
          >
            <Image
              source={{ uri: conversation.sellerAvatar }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
          </Pressable>

          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.textColor, fontSize: 16, fontWeight: '600' }}>
              {conversation.sellerName}
            </Text>
            <Text style={{ color: colors.secondaryTextColor, fontSize: 12 }}>
              Active now
            </Text>
          </View>

          <Pressable
            onPress={() => setShowMenu(true)}
          >
            <Ionicons name="ellipsis-vertical" size={24} color={colors.textColor} />
          </Pressable>
        </View>

        {/* Product Info Card */}
        <Pressable
          onPress={() => {
            // Navigate to product
            console.log('View product');
          }}
          style={{
            backgroundColor: colors.cardBackground,
            marginHorizontal: Math.max(insets.left, 24),
            marginRight: Math.max(insets.right, 24),
            marginTop: 12,
            marginBottom: 8,
            borderRadius: 12,
            padding: 12,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: 60,
              height: 60,
              borderRadius: 8,
              overflow: 'hidden',
              marginRight: 12,
              backgroundColor: colors.iconBackground,
            }}
          >
            <Image
              source={{ uri: conversation.productImage }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.textColor, fontSize: 14, fontWeight: '600' }} numberOfLines={1}>
              {conversation.productName}
            </Text>
            <Text style={{ color: '#EC4899', fontSize: 16, fontWeight: 'bold', marginTop: 4 }}>
              {conversation.productPrice}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.secondaryTextColor} />
        </Pressable>

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
          {conversation.messages.map((msg: any) => (
            <View
              key={msg.id}
              style={{
                marginBottom: 16,
                alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <View
                style={{
                  maxWidth: '75%',
                  backgroundColor: msg.sender === 'user' ? '#EC4899' : colors.cardBackground,
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderTopLeftRadius: msg.sender === 'user' ? 16 : 4,
                  borderTopRightRadius: msg.sender === 'user' ? 4 : 16,
                }}
              >
                <Text style={{ color: msg.sender === 'user' ? '#FFFFFF' : colors.textColor, fontSize: 14, lineHeight: 20 }}>
                  {msg.text}
                </Text>
                <Text
                  style={{ 
                    color: msg.sender === 'user' ? 'rgba(255, 255, 255, 0.8)' : colors.secondaryTextColor,
                    fontSize: 12,
                    marginTop: 4,
                    textAlign: 'right'
                  }}
                >
                  {formatTime(msg.timestamp)}
                </Text>
              </View>
            </View>
          ))}
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
              flexDirection: 'row',
              alignItems: 'flex-end',
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
                  textAlignVertical: 'center',
                }}
              />
            </View>

            {/* Send Button */}
            <Pressable
              onPress={handleSend}
              disabled={!message.trim()}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: message.trim() ? '#EC4899' : colors.cardBackground,
                justifyContent: 'center',
                alignItems: 'center',
                opacity: !message.trim() ? 0.5 : 1,
              }}
            >
              <Ionicons
                name="send"
                size={20}
                color={message.trim() ? '#FFFFFF' : colors.secondaryTextColor}
              />
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
              backgroundColor: colors.backgroundColor + 'CC',
              justifyContent: 'flex-end',
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
                shadowColor: '#000',
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
                  alignSelf: 'center',
                  marginBottom: 16,
                  opacity: 0.5,
                }}
              />

              {/* Heading */}
              <View style={{ paddingHorizontal: 24, marginBottom: 16 }}>
                <Text style={{ color: colors.textColor, fontSize: 18, fontWeight: 'bold' }}>
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
                      router.push('/seller-profile');
                    }}
                    style={({ pressed }) => ({
                      paddingVertical: 10,
                      paddingHorizontal: 8,
                      borderRadius: 8,
                      backgroundColor: pressed ? colors.iconBackground : 'transparent',
                    })}
                  >
                    <View className="flex flex-row items-center gap-3">
                      <Ionicons name="person-outline" size={18} color={colors.textColor} />
                      <Text style={{ color: colors.textColor, fontSize: 16, fontWeight: '500' }}>
                        View Profile
                      </Text>
                    </View>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      setShowMenu(false);
                      Alert.alert('Notifications', 'Chat notifications muted');
                    }}
                    style={({ pressed }) => ({
                      paddingVertical: 10,
                      paddingHorizontal: 8,
                      borderRadius: 8,
                      backgroundColor: pressed ? colors.iconBackground : 'transparent',
                    })}
                  >
                    <View className="flex flex-row items-center gap-3">
                      <Ionicons name="notifications-outline" size={18} color={colors.textColor} />
                      <Text style={{ color: colors.textColor, fontSize: 16, fontWeight: '500' }}>
                        Mute Notifications
                      </Text>
                    </View>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      setShowMenu(false);
                      router.push(`/buy-item?id=${conversationId}`);
                    }}
                    style={({ pressed }) => ({
                      paddingVertical: 10,
                      paddingHorizontal: 8,
                      borderRadius: 8,
                      backgroundColor: pressed ? colors.iconBackground : 'transparent',
                    })}
                  >
                    <View className="flex flex-row items-center gap-3">
                      <Ionicons name="cube-outline" size={18} color={colors.textColor} />
                      <Text style={{ color: colors.textColor, fontSize: 16, fontWeight: '500' }}>
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
                        'Block User',
                        `Are you sure you want to block ${conversation.sellerName}?`,
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Block',
                            style: 'destructive',
                            onPress: () => Alert.alert('Blocked', 'User has been blocked'),
                          },
                        ]
                      );
                    }}
                    style={({ pressed }) => ({
                      paddingVertical: 10,
                      paddingHorizontal: 8,
                      borderRadius: 8,
                      backgroundColor: pressed ? colors.iconBackground : 'transparent',
                    })}
                  >
                    <View className="flex flex-row items-center gap-3">
                      <Ionicons name="ban-outline" size={18} color="#EF4444" />
                      <Text style={{ color: colors.textColor, fontSize: 16, fontWeight: '500' }}>
                        Block User
                      </Text>
                    </View>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      setShowMenu(false);
                      Alert.alert(
                        'Report User',
                        `Report ${conversation.sellerName} for inappropriate behavior?`,
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Report',
                            style: 'destructive',
                            onPress: () => Alert.alert('Reported', 'Thank you for your report'),
                          },
                        ]
                      );
                    }}
                    style={({ pressed }) => ({
                      paddingVertical: 10,
                      paddingHorizontal: 8,
                      borderRadius: 8,
                      backgroundColor: pressed ? colors.iconBackground : 'transparent',
                    })}
                  >
                    <View className="flex flex-row items-center gap-3">
                      <Ionicons name="flag-outline" size={18} color="#EF4444" />
                      <Text style={{ color: colors.textColor, fontSize: 16, fontWeight: '500' }}>
                        Report User
                      </Text>
                    </View>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      setShowMenu(false);
                      Alert.alert(
                        'Delete Chat',
                        'Are you sure you want to delete this conversation?',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Delete',
                            style: 'destructive',
                            onPress: () => {
                              Alert.alert('Deleted', 'Chat has been deleted');
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
                      backgroundColor: pressed ? colors.iconBackground : 'transparent',
                    })}
                  >
                    <View className="flex flex-row items-center gap-3">
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                      <Text style={{ color: colors.textColor, fontSize: 16, fontWeight: '500' }}>
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

