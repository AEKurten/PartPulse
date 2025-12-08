import { View, Text } from 'react-native';
import { Link } from 'expo-router';

export default function SellStep5Screen() {
  return (
    <View className="flex-1 bg-white dark:bg-gray-900 p-6">
      <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Sell Item - Step 5
      </Text>
      <Text className="text-gray-600 dark:text-gray-400 mb-8">
        Choose listing option (marketplace or instant sell)
      </Text>
      <Link href="/(tabs)" className="bg-blue-600 dark:bg-blue-500 px-6 py-3 rounded-lg self-start">
        <Text className="text-white font-semibold">Complete</Text>
      </Link>
    </View>
  );
}

