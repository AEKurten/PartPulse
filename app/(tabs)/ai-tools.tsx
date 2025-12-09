import { View, Text } from 'react-native';
import { Link } from 'expo-router';

export default function AIToolsScreen() {
  return (
    <View className="flex-1 p-6" style={{ backgroundColor: '#0F0E11' }}>
      <Text className="text-2xl font-bold text-white mb-4">
        AI Tools
      </Text>
      <Text className="text-white mb-8">
        Access AI-powered features
      </Text>
      <Link href="/ai-builder-results" className="bg-blue-600 dark:bg-blue-500 px-6 py-3 rounded-lg self-start mb-4">
        <Text className="text-white font-semibold">AI Build Planner</Text>
      </Link>
    </View>
  );
}

