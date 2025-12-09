import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import LottieView from 'lottie-react-native';
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Feature2Screen() {
  const insets = useSafeAreaInsets();

  const imageOpacity = useSharedValue(0);
  const imageTranslateY = useSharedValue(50);
  const imageScale = useSharedValue(1);
  const buttonScale = useSharedValue(1);

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    opacity: imageOpacity.value,
    transform: [
      { translateY: imageTranslateY.value },
      { scale: imageScale.value },
    ],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  useEffect(() => {
    imageOpacity.value = withTiming(1, { duration: 1000 });
    imageTranslateY.value = withTiming(0, { duration: 1000 });
  }, []);

  const handlePress = () => {
    buttonScale.value = withSpring(0.9, {}, () => {
      buttonScale.value = withSpring(1);
    });
  };

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
        AI Photo Analysis
      </Text>
      <Animated.View
        style={[imageAnimatedStyle, { marginBottom: 32 }]}
        className="items-center "
      >
        <LottieView
          source={require("@/assets/animations/AI chat bot.json")}
          autoPlay
          loop
          style={{ width: 256, height: 256 }}
        />
      </Animated.View>
      <Text className="text-white text-center mb-8 text-xl opacity-90 font-semibold flex-1">
        Automatic grading detects dust, scratches, bent pins, rust, and mining wear.
      </Text>
      <Link href="/onboarding/feature3" asChild>
        <Pressable onPress={handlePress} style={{ width: '100%' }}>
          {({ pressed }) => (
            <Animated.View
              style={[
                buttonAnimatedStyle,
                {
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  opacity: pressed ? 0.8 : 1,
                  shadowColor: '#EC4899',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
                  alignSelf: 'flex-end',
                  marginRight: 24,
                }
              ]}
            >
              <LinearGradient
                colors={["#EC4899", "#F97316"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="arrow-forward" size={24} color="white" />
              </LinearGradient>
            </Animated.View>
          )}
        </Pressable>
      </Link>
    </View>
  );
}
