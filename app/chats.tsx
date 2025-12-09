import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { StatusBar } from 'expo-status-bar';

// Mock chat conversations
const conversations = [
  {
    id: 1,
    sellerName: 'TechGuru',
    sellerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&q=80',
    productName: 'NVIDIA GeForce RTX 4090',
    productImage: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=100&h=100&fit=crop&q=80',
    lastMessage: "Hi, I'm interested in your NVIDIA GeForce RTX 4090",
    timestamp: '2 hours ago',
    unreadCount: 2,
  },
  {
    id: 2,
    sellerName: 'PCBuilder Pro',
    sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80',
    productName: 'Intel i9-14900K',
    productImage: 'https://images.unsplash.com/photo-1587825147138-346b006e0937?w=100&h=100&fit=crop&q=80',
    lastMessage: 'Is this still available?',
    timestamp: '1 day ago',
    unreadCount: 0,
  },
  {
    id: 3,
    sellerName: 'Hardware Haven',
    sellerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&q=80',
    productName: 'ASUS ROG Motherboard',
    productImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=100&h=100&fit=crop&q=80',
    lastMessage: 'Thanks for your interest! Yes, it is.',
    timestamp: '3 days ago',
    unreadCount: 1,
  },
];

export default function ChatsScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();

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
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <Pressable
            onPress={() => router.back()}
            style={{ marginRight: 16 }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textColor} />
          </Pressable>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: '#EC4899' + '20',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
              }}
            >
              <Ionicons name="chatbubbles" size={24} color="#EC4899" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textColor, fontSize: 28, fontWeight: 'bold', marginBottom: 4 }}>
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
      >
        {conversations.map((conversation) => (
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
                  flexDirection: 'row',
                  opacity: pressed ? 0.8 : 1,
                }}
              >
                {/* Seller Avatar */}
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
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
                </View>

                {/* Conversation Info */}
                <View style={{ flex: 1, justifyContent: 'center' }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: 4,
                    }}
                  >
                    <Text style={{ color: colors.textColor, fontSize: 16, fontWeight: '600' }} numberOfLines={1}>
                      {conversation.sellerName}
                    </Text>
                    <Text style={{ color: colors.secondaryTextColor, fontSize: 12 }}>
                      {conversation.timestamp}
                    </Text>
                  </View>

                  {/* Product Preview */}
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 6,
                      gap: 8,
                    }}
                  >
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        overflow: 'hidden',
                        backgroundColor: colors.iconBackground,
                      }}
                    >
                      <Image
                        source={{ uri: conversation.productImage }}
                        style={{ width: '100%', height: '100%' }}
                        contentFit="cover"
                      />
                    </View>
                    <Text style={{ color: colors.secondaryTextColor, fontSize: 12, flex: 1 }} numberOfLines={1}>
                      {conversation.productName}
                    </Text>
                  </View>

                  {/* Last Message */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text
                      style={{ 
                        color: conversation.unreadCount > 0 ? colors.textColor : colors.secondaryTextColor,
                        fontSize: 14,
                        fontWeight: conversation.unreadCount > 0 ? '600' : '400',
                        flex: 1
                      }}
                      numberOfLines={1}
                    >
                      {conversation.lastMessage}
                    </Text>
                    {conversation.unreadCount > 0 && (
                      <View
                        style={{
                          backgroundColor: '#EC4899',
                          borderRadius: 10,
                          minWidth: 20,
                          height: 20,
                          paddingHorizontal: 6,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <Text className="text-white text-xs font-bold">
                          {conversation.unreadCount}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            )}
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

