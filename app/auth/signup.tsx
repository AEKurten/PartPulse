import { View, Text } from 'react-native';
import { Link } from 'expo-router';

export default function SignUpScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900 p-6">
      <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
        Sign Up
      </Text>
      <Link href="/(tabs)" className="bg-blue-600 dark:bg-blue-500 px-6 py-3 rounded-lg mb-4">
        <Text className="text-white font-semibold">Sign Up</Text>
      </Link>
      <Link href="/auth/login">
        <Text className="text-blue-600 dark:text-blue-400">Already have an account? Login</Text>
      </Link>
    </View>
  );
}

