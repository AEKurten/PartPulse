import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

export default function WelcomeScreen() {
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
    titleTranslateY.value = withTiming(0, { duration: 800, easing: Easing.out(Easing.exp) });
    
    // GPU image animation with delay
    imageOpacity.value = withDelay(300, withTiming(1, { duration: 1200 }));
    imageTranslateY.value = withDelay(300, withTiming(0, { duration: 1200, easing: Easing.out(Easing.exp) }));
    
    // Pulsing animation for GPU image
    imageScale.value = withDelay(1500, withRepeat(
      withSequence(
        withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    ));
    
    // Tagline animation
    taglineOpacity.value = withDelay(600, withTiming(1, { duration: 1000 }));
    taglineTranslateY.value = withDelay(600, withTiming(0, { duration: 1000, easing: Easing.out(Easing.exp) }));
    
    // Button animation
    buttonOpacity.value = withDelay(800, withTiming(1, { duration: 1000 }));
    buttonTranslateY.value = withDelay(800, withTiming(0, { duration: 1000, easing: Easing.out(Easing.exp) }));
  }, []);

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    opacity: imageOpacity.value,
    transform: [
      { translateY: imageTranslateY.value },
      { scale: imageScale.value }
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
    <View className="flex-1 bg-black">
      <StatusBar style="light" />
      
      {/* Background gradient effects */}
      <View className="absolute inset-0">
        <View className="absolute top-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <View className="absolute top-1/3 right-0 w-80 h-80 bg-pink-600/20 rounded-full blur-3xl" />
        <View className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-red-600/15 rounded-full blur-3xl" />
      </View>

      <View className="flex-1 justify-between px-6 pt-16 pb-12">
        {/* App Name */}
        <Animated.View 
          style={titleAnimatedStyle}
          className="items-center mt-12"
        >
          <Text className="text-5xl font-bold text-white tracking-tight">
            PartPulse
          </Text>
        </Animated.View>

        {/* GPU Image with Animation */}
        <Animated.View 
          style={imageAnimatedStyle}
          className="flex-1 items-center justify-center"
        >
          <Image
            source={{ 
              uri: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=400&fit=crop&q=80'
            }}
            contentFit="contain"
            transition={300}
            className="w-64 h-64"
            placeholder={{ blurhash: 'LGF5]+Yk^6#M@-5c,1J5@[or[Q6.' }}
            // For local GIF: source={require('@/assets/images/gpu-animation.gif')}
          />
        </Animated.View>

        {/* Tagline */}
        <Animated.View 
          style={taglineAnimatedStyle}
          className="mb-8"
        >
          <Text className="text-2xl font-semibold text-white leading-tight">
            Stop Guessing.{'\n'}Start Selling.
          </Text>
        </Animated.View>

        {/* Get Started Button */}
        <Animated.View style={buttonAnimatedStyle}>
          <Link href="/onboarding/feature1" asChild>
            <Pressable>
              {({ pressed }) => (
                <LinearGradient
                  colors={['#EC4899', '#F97316']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className={`rounded-2xl py-5 px-8 ${pressed ? 'opacity-80' : 'opacity-100'}`}
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
