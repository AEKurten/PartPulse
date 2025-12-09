import { Link } from 'expo-router';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Feature1Screen() {
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 items-center bg-dark-bg p-6" style={{ paddingTop: insets.top, paddingBottom: insets.bottom, paddingLeft: insets.left, paddingRight: insets.right }}>
      <Text className="text-xl font-bold text-white mb-4">
        AI-Powered Pricing
      </Text>
      <Text className="text-white text-center mb-8">
        Get accurate price suggestions based on market trends, product age, and condition.
      </Text>
      <Link href="/onboarding/feature2" className="bg-blue-600 px-6 py-3 rounded-lg">
        <Text className="text-white font-semibold">Next</Text>
      </Link>
    </View>
  );
}

