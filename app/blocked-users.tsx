import { useThemeColors } from '@/hooks/use-theme-colors';
import { getBlockedUserIds } from '@/lib/blocking';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from './stores/useAuthStore';
import type { Profile } from '@/lib/database.types';

export default function BlockedUsersScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const { user } = useAuthStore();
  const [blockedUsers, setBlockedUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBlockedUsers = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const blockedIds = await getBlockedUserIds(user.id);

      if (blockedIds.length === 0) {
        setBlockedUsers([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('id', blockedIds);

      if (error) {
        console.error('Error fetching blocked users:', error);
        Alert.alert('Error', 'Failed to load blocked users');
        return;
      }

      setBlockedUsers(data || []);
    } catch (error) {
      console.error('Error fetching blocked users:', error);
      Alert.alert('Error', 'Failed to load blocked users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBlockedUsers();
  }, [user?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBlockedUsers();
  };

  const handleUnblock = async (blockedUserId: string) => {
    if (!user?.id) return;

    Alert.alert(
      'Unblock User',
      'Are you sure you want to unblock this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('blocked_users')
                .delete()
                .eq('blocker_id', user.id)
                .eq('blocked_id', blockedUserId);

              if (error) throw error;

              setBlockedUsers(blockedUsers.filter((u) => u.id !== blockedUserId));
              Alert.alert('Success', 'User unblocked successfully');
            } catch (error: any) {
              console.error('Error unblocking user:', error);
              Alert.alert('Error', `Failed to unblock user: ${error.message || 'Unknown error'}`);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.backgroundColor, paddingTop: insets.top }}>
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
                backgroundColor: '#EF4444' + '20',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
              }}
            >
              <Ionicons name="ban-outline" size={24} color="#EF4444" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textColor, fontSize: 28, fontWeight: 'bold', marginBottom: 4 }}>
                Blocked Users
              </Text>
              <Text style={{ color: colors.secondaryTextColor, fontSize: 14 }}>
                {blockedUsers.length} user{blockedUsers.length !== 1 ? 's' : ''} blocked
              </Text>
            </View>
          </View>
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#EF4444" />
        </View>
      ) : blockedUsers.length > 0 ? (
        <FlatList
          data={blockedUsers}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#EF4444"
              colors={["#EF4444"]}
            />
          }
          contentContainerStyle={{
            paddingLeft: Math.max(insets.left, 24),
            paddingRight: Math.max(insets.right, 24),
            paddingBottom: 24,
          }}
          renderItem={({ item }) => (
            <View
              style={{
                backgroundColor: colors.cardBackground,
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.borderColor,
              }}
            >
              {item.avatar_url ? (
                <Image
                  source={{ uri: item.avatar_url }}
                  style={{ width: 48, height: 48, borderRadius: 24 }}
                  contentFit="cover"
                />
              ) : (
                <Ionicons name="person-circle" size={48} color={colors.secondaryTextColor} />
              )}
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ color: colors.textColor, fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
                  {item.full_name || item.username}
                </Text>
                <Text style={{ color: colors.secondaryTextColor, fontSize: 14 }}>
                  @{item.username}
                </Text>
              </View>
              <Pressable
                onPress={() => handleUnblock(item.id)}
                style={{
                  backgroundColor: '#EF4444' + '20',
                  borderRadius: 8,
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                }}
              >
                <Text style={{ color: '#EF4444', fontSize: 14, fontWeight: '600' }}>
                  Unblock
                </Text>
              </Pressable>
            </View>
          )}
        />
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
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
            <Ionicons name="ban-outline" size={40} color={colors.secondaryTextColor} />
          </View>
          <Text style={{ color: colors.textColor, fontSize: 20, fontWeight: '600', marginBottom: 8, textAlign: 'center' }}>
            No blocked users
          </Text>
          <Text style={{ color: colors.secondaryTextColor, fontSize: 14, textAlign: 'center' }}>
            Users you block will appear here
          </Text>
        </View>
      )}
    </View>
  );
}

