import { View, Text } from 'react-native';
import { Link } from 'expo-router';

export default function OrderStatusScreen() {
  return (
    <View className="flex-1 p-6" style={{ backgroundColor: '#0F0E11' }}>
      <Text className="text-2xl font-bold text-white mb-4">
        Order Status
      </Text>
      <Text className="text-white mb-8">
        Track your order
      </Text>
      <Link href="/(tabs)" className="bg-blue-600 dark:bg-blue-500 px-6 py-3 rounded-lg self-start">
        <Text className="text-white font-semibold">Back to Home</Text>
      </Link>
    </View>
  );
}

