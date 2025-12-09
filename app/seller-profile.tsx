import { View, Text } from 'react-native';

export default function SellerProfileScreen() {
  return (
    <View className="flex-1 p-6" style={{ backgroundColor: '#0F0E11' }}>
      <Text className="text-2xl font-bold text-white mb-4">
        Seller Profile
      </Text>
      <Text className="text-white mb-8">
        View seller information and ratings
      </Text>
    </View>
  );
}

