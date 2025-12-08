import { View, Text } from 'react-native';
import { Link } from 'expo-router';

export default function Feature3Screen() {
  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900 p-6">
      <Text className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Compatibility Checking
      </Text>
      <Text className="text-gray-600 dark:text-gray-400 text-center mb-8">
        Ensure parts work with your existing system before you buy.
      </Text>
      <Link href="/onboarding/feature4" className="bg-blue-600 dark:bg-blue-500 px-6 py-3 rounded-lg">
        <Text className="text-white font-semibold">Next</Text>
      </Link>
    </View>
  );
}

