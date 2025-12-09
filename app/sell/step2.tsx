import { View, Text } from 'react-native';
import { Link } from 'expo-router';

export default function SellStep2Screen() {
  return (
    <View className="flex-1 p-6" style={{ backgroundColor: '#0F0E11' }}>
      <Text className="text-2xl font-bold text-white mb-4">
        Sell Item - Step 2
      </Text>
      <Text className="text-white mb-8">
        Enter product details
      </Text>
      <Link href="/sell/step3" className="bg-blue-600 dark:bg-blue-500 px-6 py-3 rounded-lg self-start">
        <Text className="text-white font-semibold">Next</Text>
      </Link>
    </View>
  );
}

