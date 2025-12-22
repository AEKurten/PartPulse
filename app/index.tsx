import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from './stores/useAuthStore';

export default function Index() {
  const session = useAuthStore((state) => state.session);
  const loading = useAuthStore((state) => state.loading);

  // Show loading indicator while checking session
  // The session check happens in _layout.tsx, so we wait for it here
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F0E11' }}>
        <ActivityIndicator size="large" color="#EC4899" />
      </View>
    );
  }

  // Redirect based on auth state
  // If user has a session, go to main app, otherwise go to welcome screen
  if (session?.user) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/welcome" />;
}

