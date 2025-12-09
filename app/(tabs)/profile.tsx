import { View, Text } from 'react-native';

export default function ProfileScreen() {
  return (
    <View className="flex-1" style={{ backgroundColor: '#0F0E11' }}>
      <View className="p-6">
        <Text className="text-2xl font-bold text-white">
          Profile
        </Text>
      </View>
    </View>
  );
}

