import { View, Text } from 'react-native';

export default function SellerProfileScreen() {
  return (
    <View className="flex-1 bg-white dark:bg-gray-900 p-6">
      <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Seller Profile
      </Text>
      <Text className="text-gray-600 dark:text-gray-400 mb-8">
        View seller information and ratings
      </Text>
    </View>
  );
}

