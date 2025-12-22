import { useThemeColors } from '@/hooks/use-theme-colors';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../stores/useAuthStore';

interface Notification {
  id: string;
  type: 'order' | 'message' | 'price_drop' | 'product_available' | 'product_updated' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: string;
  iconColor: string;
  product_id?: string;
}

const getNotificationIcon = (type: string): { icon: string; color: string } => {
  switch (type) {
    case 'price_drop':
      return { icon: 'trending-down-outline', color: '#EC4899' };
    case 'product_available':
      return { icon: 'checkmark-circle-outline', color: '#10B981' };
    case 'product_updated':
      return { icon: 'refresh-outline', color: '#3B82F6' };
    case 'order':
      return { icon: 'bag-outline', color: '#10B981' };
    case 'message':
      return { icon: 'chatbubble-ellipses-outline', color: '#3B82F6' };
    case 'system':
    default:
      return { icon: 'notifications-outline', color: '#8B5CF6' };
  }
};

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return date.toLocaleDateString();
};

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      const formattedNotifications: Notification[] = (data || []).map((notif) => {
        const iconData = getNotificationIcon(notif.type);
        return {
          id: notif.id,
          type: notif.type as any,
          title: notif.title,
          message: notif.message,
          time: formatTimeAgo(notif.created_at),
          read: notif.read,
          icon: iconData.icon,
          iconColor: iconData.color,
          product_id: notif.product_id || undefined,
        };
      });

      setNotifications(formattedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = async (id: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error marking notification as read:', error);
        return;
      }

      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) {
        console.error('Error marking all as read:', error);
        return;
      }

      setNotifications(notifications.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleNotificationPress = async (notification: Notification) => {
    await handleMarkAsRead(notification.id);
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'order':
        if (notification.order_id) {
          router.push({ pathname: '/order-status', params: { orderId: notification.order_id } });
        }
        break;
      case 'message':
        if (notification.chat_id) {
          router.push({ pathname: '/chat', params: { chatId: notification.chat_id } });
        } else {
          router.push('/chats');
        }
        break;
      case 'price_drop':
      case 'product_available':
      case 'product_updated':
        if (notification.product_id) {
          router.push({ pathname: '/buy-item', params: { productId: notification.product_id } });
        } else {
          router.push('/(tabs)/market');
        }
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
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#EC4899" />
        </View>
      ) : notifications.length > 0 ? (
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
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#EC4899"
                colors={["#EC4899"]}
              />
            }
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

