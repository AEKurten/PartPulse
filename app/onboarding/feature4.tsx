import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import LottieView from 'lottie-react-native';
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Feature4Screen() {
  const insets = useSafeAreaInsets();

  const imageOpacity = useSharedValue(0);
  const imageTranslateY = useSharedValue(50);
  const imageScale = useSharedValue(1);

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    opacity: imageOpacity.value,
    transform: [
      { translateY: imageTranslateY.value },
      { scale: imageScale.value },
    ],
  }));

  useEffect(() => {
    imageOpacity.value = withTiming(1, { duration: 1000 });
    imageTranslateY.value = withTiming(0, { duration: 1000 });
  }, []);

  return (
    <View
      className="flex-1 items-center"
      style={{
        backgroundColor: '#0F0E11',
        paddingTop: insets.top + 50,
        paddingBottom: insets.bottom + 32,
        paddingLeft: Math.max(insets.left, 24),
        paddingRight: Math.max(insets.right, 24)
      }}
    >
      <Text className="text-3xl font-bold text-white mb-4">
        AI Build Planner
      </Text>
      <Animated.View
        style={imageAnimatedStyle}
        className="items-center "
      >
        <LottieView
          source={require("@/assets/animations/Computer retro.json")}
          autoPlay
          loop
          style={{ width: 256, height: 256 }}
        />
      </Animated.View>
      <Text className="text-white text-center mb-8 text-xl opacity-90 font-semibold flex-1">
        Get personalized PC build recommendations based on your budget and performance goals.
      </Text>
      <View style={{ width: '100%', gap: 16 }}>
        <Link href="/auth/signup" asChild>
          <Pressable style={{ width: '100%' }}>
            {({ pressed }) => (
              <LinearGradient
                colors={["#EC4899", "#F97316"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  borderRadius: 16,
                  height: 56,
                  width: '100%',
                  opacity: pressed ? 0.8 : 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text className="text-white text-lg font-bold text-center">
                  Create Account
                </Text>
              </LinearGradient>
            )}
          </Pressable>
        </Link>
        <Link href="/auth/login" asChild>
          <Pressable style={{ width: '100%' }}>
            {({ pressed }) => (
              <View
                style={{
                  borderRadius: 16,
                  height: 56,
                  width: '100%',
                  backgroundColor: 'transparent',
                  borderWidth: 2,
                  borderColor: '#EC4899',
                  opacity: pressed ? 0.8 : 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text className="text-white text-lg font-bold text-center">
                  Log In
                </Text>
              </View>
            )}
          </Pressable>
        </Link>
      </View>
    </View>
  );
}
