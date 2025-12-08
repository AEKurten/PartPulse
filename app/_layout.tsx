import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../global.css';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  initialRouteName: 'welcome',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="welcome" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="sell" options={{ headerShown: true, title: 'Sell Item' }} />
          <Stack.Screen name="buy-item" options={{ headerShown: true, title: 'Product Details' }} />
          <Stack.Screen name="checkout" options={{ headerShown: true, title: 'Checkout' }} />
          <Stack.Screen name="order-status" options={{ headerShown: true, title: 'Order Status' }} />
          <Stack.Screen name="ai-tools" options={{ headerShown: true, title: 'AI Tools' }} />
          <Stack.Screen name="ai-builder-results" options={{ headerShown: true, title: 'Build Results' }} />
          <Stack.Screen name="seller-profile" options={{ headerShown: true, title: 'Seller Profile' }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
