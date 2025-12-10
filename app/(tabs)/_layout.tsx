import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import { Home, Store, User, Zap } from 'lucide-react-native';
import { Platform, StyleSheet } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { TabBarIcon } from '@/components/tab-bar-icon';
import { useTheme } from '@/contexts/theme-context';
import { useThemeColors } from '@/hooks/use-theme-colors';

export default function TabLayout() {
  const { actualTheme } = useTheme();
  const colors = useThemeColors();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: actualTheme === 'dark' ? '#FFFFFF' : '#111827',
        tabBarInactiveTintColor: actualTheme === 'dark' ? '#9CA3AF' : '#6B7280',
        tabBarStyle: {
          height: 96,
          borderRadius: 24,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          paddingHorizontal: 8,
          backgroundColor: Platform.OS === 'android' ? colors.cardBackground : undefined,
        },
        tabBarBackground: () => (
          Platform.OS === 'ios' ? (
            <BlurView
              intensity={80}
              style={StyleSheet.absoluteFill}
              tint={actualTheme === 'dark' ? 'dark' : 'light'}
            />
          ) : null
        ),
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 8,
        },
        tabBarItemStyle: {
          paddingVertical: 16,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon Icon={Home} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="market"
        options={{
          title: 'Market',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon Icon={Store} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="ai-tools"
        options={{
          title: 'AI Tools',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon Icon={Zap} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon Icon={User} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          href: null, // Hide from tab bar but keep accessible
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          href: null, // Hide from tab bar but keep accessible
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          href: null, // Hide from tab bar but keep accessible
        }}
      />
      <Tabs.Screen
        name="subscription"
        options={{
          href: null, // Hide from tab bar but keep accessible
        }}
      />
    </Tabs>
  );
}
