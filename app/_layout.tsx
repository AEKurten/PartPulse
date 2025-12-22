import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { hideAsync, preventAutoHideAsync } from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../global.css';

import { SubscriptionProvider } from '@/contexts/subscription-context';
import { ThemeProvider, useTheme } from '@/contexts/theme-context';
import { supabase } from '@/lib/supabase';
import {
  Poppins_100Thin,
  Poppins_200ExtraLight,
  Poppins_300Light,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
  Poppins_900Black,
} from '@expo-google-fonts/poppins';
import { useAuthStore } from './stores/useAuthStore';
import { useProfileStore } from './stores/userProfileStore';


// Prevent the splash screen from auto-hiding before asset loading is complete.
preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: 'welcome',
};

function RootLayoutContent() {
  const { actualTheme } = useTheme();

  const [loaded, error] = useFonts({
    Poppins_100Thin,
    Poppins_200ExtraLight,
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Poppins_900Black,
  });

  useEffect(() => {
    if (loaded || error) {
      hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  const backgroundColor = actualTheme === 'dark' ? '#0F0E11' : '#FFFFFF';

  return (
    <View className="flex-1" style={{ backgroundColor }}>
      <NavigationThemeProvider value={actualTheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="welcome" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="sell" options={{ headerShown: false }} />
          <Stack.Screen name="buy-item" options={{ headerShown: false }} />
          <Stack.Screen name="chats" options={{ headerShown: false }} />
          <Stack.Screen name="chat" options={{ headerShown: false }} />
          <Stack.Screen name="checkout" options={{ headerShown: false }} />
          <Stack.Screen name="order-status" options={{ headerShown: false }} />
          <Stack.Screen name="ai-tools" options={{ headerShown: false }} />
          <Stack.Screen name="ai-builder-results" options={{ headerShown: false }} />
          <Stack.Screen name="seller-profile" options={{ headerShown: false }} />
          <Stack.Screen name="my-listings" options={{ headerShown: false }} />
          <Stack.Screen name="edit-listing" options={{ headerShown: false }} />
          <Stack.Screen name="feedback" options={{ headerShown: false }} />
          <Stack.Screen name="blocked-users" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style={actualTheme === 'dark' ? 'light' : 'dark'} />
      </NavigationThemeProvider>
    </View>
  );
}

export default function RootLayout() {
  const setSession = useAuthStore((state) => state.setSession);
  const setUserDetails = useProfileStore((s) => s.setUserDetails);
  const setLoading = useProfileStore((s) => s.setLoading);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // Get initial session on mount
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };

    getSession();

    // Listen for auth changes all the time
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session);
      setSession(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [setSession]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setUserDetails(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Profile fetch error:', error.message);
        setUserDetails(null);
      } else {
        setUserDetails(data);
      }
    };

    fetchProfile();
  }, [user]);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <SubscriptionProvider>
          <RootLayoutContent />
        </SubscriptionProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
