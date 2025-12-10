import { useThemeColors } from '@/hooks/use-theme-colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Mock notification data
interface Notification {
  id: string;
  type: 'order' | 'message' | 'price_drop' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: string;
  iconColor: string;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'order',
    title: 'Order Confirmed',
    message: 'Your order for RTX 4090 has been confirmed by the seller',
    time: '2 hours ago',
    read: false,
    icon: 'checkmark-circle-outline',
    iconColor: '#10B981',
  },
  {
    id: '2',
    type: 'price_drop',
    title: 'Price Drop Alert',
    message: 'NVIDIA RTX 4080 Super is now $899 (was $999)',
    time: '5 hours ago',
    read: false,
    icon: 'trending-down-outline',
    iconColor: '#EC4899',
  },
  {
    id: '3',
    type: 'message',
    title: 'New Message',
    message: 'You have a new message from TechGuru',
    time: '1 day ago',
    read: true,
    icon: 'chatbubble-ellipses-outline',
    iconColor: '#3B82F6',
  },
  {
    id: '4',
    type: 'system',
    title: 'Welcome to PartPulse!',
    message: 'Start exploring the marketplace and find great deals',
    time: '3 days ago',
    read: true,
    icon: 'notifications-outline',
    iconColor: '#8B5CF6',
  },
];

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const handleNotificationPress = (notification: Notification) => {
    handleMarkAsRead(notification.id);
    // Navigate based on notification type
    switch (notification.type) {
      case 'order':
        router.push('/order-status');
        break;
      case 'message':
        router.push('/chats');
        break;
      case 'price_drop':
        router.push('/(tabs)/market');
        break;
      default:
        break;
    }
  };

  return (
    <View
      className="flex-1"
      style={{
        backgroundColor: colors.backgroundColor,
        paddingTop: insets.top,
      }}
    >
      <StatusBar style={colors.statusBarStyle} />
      <View
        style={{
          paddingLeft: Math.max(insets.left, 24),
          paddingRight: Math.max(insets.right, 24),
          paddingTop: 24,
          paddingBottom: 16,
        }}
      >
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Pressable
              onPress={() => router.back()}
              style={{ marginRight: 16 }}
            >
              <Ionicons name="arrow-back" size={24} color={colors.textColor} />
            </Pressable>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: '#3B82F6' + '20',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
              }}
            >
              <Ionicons name="notifications-outline" size={24} color="#3B82F6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: colors.textColor,
                  fontSize: 24,
                  fontWeight: 'bold',
                  marginBottom: 4,
                }}
                numberOfLines={1}
              >
                Notifications
              </Text>
              <Text style={{ color: colors.secondaryTextColor, fontSize: 14 }}>
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Notifications List */}
      {notifications.length > 0 ? (
        <>
          {/* Mark All Read Button */}
          {unreadCount > 0 && (
            <View
              style={{
                paddingLeft: Math.max(insets.left, 24),
                paddingRight: Math.max(insets.right, 24),
                marginBottom: 12,
                alignItems: 'flex-end',
              }}
            >
              <Pressable onPress={handleMarkAllAsRead}>
                <Text
                  style={{
                    color: '#EC4899',
                    fontSize: 14,
                    fontWeight: '600',
                  }}
                >
                  Mark all read
                </Text>
              </Pressable>
            </View>
          )}
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingLeft: Math.max(insets.left, 24),
              paddingRight: Math.max(insets.right, 24),
              paddingBottom: 24,
            }}
            renderItem={({ item }) => (
            <Pressable
              onPress={() => handleNotificationPress(item)}
              style={{
                backgroundColor: colors.cardBackground,
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
                flexDirection: 'row',
                borderWidth: item.read ? 0 : 1,
                borderColor: item.read ? 'transparent' : '#EC4899' + '40',
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: item.iconColor + '20',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 12,
                }}
              >
                <Ionicons name={item.icon as any} size={24} color={item.iconColor} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text
                    style={{
                      color: colors.textColor,
                      fontSize: 16,
                      fontWeight: item.read ? '500' : '600',
                      flex: 1,
                    }}
                  >
                    {item.title}
                  </Text>
                  {!item.read && (
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: '#EC4899',
                        marginLeft: 8,
                      }}
                    />
                  )}
                </View>
                <Text
                  style={{
                    color: colors.secondaryTextColor,
                    fontSize: 14,
                    marginBottom: 8,
                  }}
                  numberOfLines={2}
                >
                  {item.message}
                </Text>
                <Text
                  style={{
                    color: colors.secondaryTextColor,
                    fontSize: 12,
                  }}
                >
                  {item.time}
                </Text>
              </View>
            </Pressable>
          )}
          />
        </>
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 24,
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: colors.cardBackground,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 24,
            }}
          >
            <Ionicons
              name="notifications-outline"
              size={40}
              color={colors.secondaryTextColor}
            />
          </View>
          <Text
            style={{
              color: colors.textColor,
              fontSize: 20,
              fontWeight: '600',
              marginBottom: 8,
              textAlign: 'center',
            }}
          >
            No notifications
          </Text>
          <Text
            style={{
              color: colors.secondaryTextColor,
              fontSize: 14,
              textAlign: 'center',
            }}
          >
            You're all caught up! We'll notify you when something important happens.
          </Text>
        </View>
      )}
    </View>
  );
}

