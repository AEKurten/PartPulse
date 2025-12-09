import { View, Text } from 'react-native';

export default function SearchScreen() {
  return (
    <View className="flex-1" style={{ backgroundColor: '#0F0E11' }}>
      <View className="p-6">
        <Text className="text-2xl font-bold text-white">
          Search Products
        </Text>
      </View>
    </View>
  );
}

