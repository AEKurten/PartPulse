import { View, Text } from 'react-native';
import { Link } from 'expo-router';

export default function LoginScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900 p-6">
      <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
        Login
      </Text>
      <Link href="/(tabs)" className="bg-blue-600 dark:bg-blue-500 px-6 py-3 rounded-lg mb-4">
        <Text className="text-white font-semibold">Login</Text>
      </Link>
      <Link href="/auth/signup">
        <Text className="text-blue-600 dark:text-blue-400">Don't have an account? Sign Up</Text>
      </Link>
    </View>
  );
}

