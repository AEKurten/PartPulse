import { View, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View 
      className="flex-1 items-center justify-center p-6"
      style={{ 
        backgroundColor: '#0F0E11',
        paddingTop: insets.top, 
        paddingBottom: insets.bottom, 
        paddingLeft: insets.left, 
        paddingRight: insets.right 
      }}
    >
      <Text className="text-2xl font-bold text-white mb-8">
        Sign Up
      </Text>
      <Link href="/(tabs)" asChild>
        <Pressable>
          {({ pressed }) => (
            <View 
              style={{
                backgroundColor: '#2563EB',
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 8,
                opacity: pressed ? 0.8 : 1,
                marginBottom: 16,
              }}
            >
              <Text className="text-white font-semibold">Sign Up</Text>
            </View>
          )}
        </Pressable>
      </Link>
      <Link href="/auth/login">
        <Text className="text-blue-400">Already have an account? Login</Text>
      </Link>
    </View>
  );
}

