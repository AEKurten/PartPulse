import { View, Text } from 'react-native';

export default function ProfileScreen() {
  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <View className="p-6">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white">
          Profile
        </Text>
      </View>
    </View>
  );
}

