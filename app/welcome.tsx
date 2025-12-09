import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import LottieView from "lottie-react-native";
import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  // Title animations
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(30);

  // GPU image animations
  const imageOpacity = useSharedValue(0);
  const imageTranslateY = useSharedValue(50);
  const imageScale = useSharedValue(1);

  // Tagline animations
  const taglineOpacity = useSharedValue(0);
  const taglineTranslateY = useSharedValue(30);

  // Button animations
  const buttonOpacity = useSharedValue(0);
  const buttonTranslateY = useSharedValue(30);

  useEffect(() => {
    // Title animation
    titleOpacity.value = withTiming(1, { duration: 1000 });
    titleTranslateY.value = withTiming(0, {
      duration: 800,
      easing: Easing.out(Easing.exp),
    });

    // GPU image animation with delay
    imageOpacity.value = withDelay(300, withTiming(1, { duration: 1200 }));
    imageTranslateY.value = withDelay(
      300,
      withTiming(0, { duration: 1200, easing: Easing.out(Easing.exp) })
    );

    // Pulsing animation for GPU image
    imageScale.value = withDelay(
      1500,
      withRepeat(
        withSequence(
          withTiming(1.05, {
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );

    // Tagline animation
    taglineOpacity.value = withDelay(600, withTiming(1, { duration: 1000 }));
    taglineTranslateY.value = withDelay(
      600,
      withTiming(0, { duration: 1000, easing: Easing.out(Easing.exp) })
    );

    // Button animation
    buttonOpacity.value = withDelay(800, withTiming(1, { duration: 1000 }));
    buttonTranslateY.value = withDelay(
      800,
      withTiming(0, { duration: 1000, easing: Easing.out(Easing.exp) })
    );
  }, []);

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    opacity: imageOpacity.value,
    transform: [
      { translateY: imageTranslateY.value },
      { scale: imageScale.value },
    ],
  }));

  const taglineAnimatedStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: taglineTranslateY.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: buttonTranslateY.value }],
  }));

  return (
    <View 
      className="flex-1" 
      style={{ 
        backgroundColor: '#0F0E11',
        paddingTop: insets.top, 
        paddingBottom: insets.bottom, 
        paddingLeft: insets.left, 
        paddingRight: insets.right 
      }}
    >
      <StatusBar style="light" />

      <View className="flex-1 px-6 pt-16 pb-12 z-30">
        {/* App Name */}
        <Animated.View
          style={titleAnimatedStyle}
          className="items-center mt-12"
        >
          <Text className="text-5xl font-bold text-white tracking-tight p-2">
            PartPulse
          </Text>
        </Animated.View>

        {/* GPU Lottie Animation */}
        <Animated.View
          style={imageAnimatedStyle}
          className="items-center"
        >
          <LottieView
            source={require("@/assets/animations/Video Graphic card (GPU).json")}
            autoPlay
            loop
            style={{ width: 256, height: 256 }}
          />
        </Animated.View>

        {/* Tagline */}
        <Animated.View style={taglineAnimatedStyle} className="mb-8 flex-1">
          <Text className="text-3xl font-semibold text-white opacity-95 leading-tight text-center">
            Stop Guessing.Start {"\n"}Selling.
          </Text>
        </Animated.View>

        {/* Get Started Button */}
        <Animated.View style={buttonAnimatedStyle}>
          <Link href="/onboarding/feature1" asChild>
            <Pressable>
              {({ pressed }) => (
                <LinearGradient
                  colors={["#EC4899", "#F97316"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    borderRadius: 16,
                    height: 56,
                    opacity: pressed ? 0.8 : 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text className="text-white text-lg font-bold text-center">
                    Get Started
                  </Text>
                </LinearGradient>
              )}
            </Pressable>
          </Link>
        </Animated.View>
      </View>
    </View>
  );
}
