import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, KeyboardAvoidingView, Platform, Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { StatusBar } from 'expo-status-bar';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Confetti colors
const CONFETTI_COLORS = ['#EC4899', '#F97316', '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6'];

// Generate confetti pieces
const generateConfetti = () => {
  return Array.from({ length: 50 }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    x: Math.random() * SCREEN_WIDTH,
    delay: Math.random() * 1000,
    duration: 2000 + Math.random() * 2000,
    rotation: Math.random() * 360,
  }));
};

export default function SellStep5Screen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const [confetti, setConfetti] = useState(generateConfetti());

  // Checkmark animation
  const checkmarkScale = useSharedValue(0);
  const checkmarkOpacity = useSharedValue(0);
  const circleScale = useSharedValue(0);
  const circleOpacity = useSharedValue(0);

  // Text animations
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(30);
  const subtitleOpacity = useSharedValue(0);
  const subtitleTranslateY = useSharedValue(30);

  useEffect(() => {
    // Circle animation
    circleOpacity.value = withTiming(1, { duration: 300 });
    circleScale.value = withSpring(1, {
      damping: 10,
      stiffness: 100,
    });

    // Checkmark animation
    checkmarkOpacity.value = withDelay(300, withTiming(1, { duration: 200 }));
    checkmarkScale.value = withDelay(
      300,
      withSpring(1, {
        damping: 8,
        stiffness: 150,
      })
    );

    // Title animation
    titleOpacity.value = withDelay(600, withTiming(1, { duration: 500 }));
    titleTranslateY.value = withDelay(
      600,
      withTiming(0, {
        duration: 500,
        easing: Easing.out(Easing.exp),
      })
    );

    // Subtitle animation
    subtitleOpacity.value = withDelay(800, withTiming(1, { duration: 500 }));
    subtitleTranslateY.value = withDelay(
      800,
      withTiming(0, {
        duration: 500,
        easing: Easing.out(Easing.exp),
      })
    );

    // Regenerate confetti after animation completes
    const timer = setTimeout(() => {
      setConfetti(generateConfetti());
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const circleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: circleOpacity.value,
    transform: [{ scale: circleScale.value }],
  }));

  const checkmarkAnimatedStyle = useAnimatedStyle(() => ({
    opacity: checkmarkOpacity.value,
    transform: [{ scale: checkmarkScale.value }],
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const subtitleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: subtitleTranslateY.value }],
  }));

  const handleGoHome = () => {
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: colors.backgroundColor }}
    >
      <StatusBar style={colors.statusBarStyle} />
      <View style={{ flex: 1 }}>
        {/* Confetti */}
        {confetti.map((piece) => (
          <ConfettiPiece key={piece.id} {...piece} />
        ))}

        {/* Content */}
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: insets.top,
            paddingBottom: insets.bottom + 32,
            paddingLeft: Math.max(insets.left, 24),
            paddingRight: Math.max(insets.right, 24),
          }}
        >
          {/* Animated Checkmark Circle */}
          <Animated.View style={circleAnimatedStyle}>
            <LinearGradient
              colors={['#EC4899', '#F97316']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 32,
              }}
            >
              <Animated.View style={checkmarkAnimatedStyle}>
                <Ionicons name="checkmark" size={64} color="#FFFFFF" />
              </Animated.View>
            </LinearGradient>
          </Animated.View>

          {/* Title */}
          <Animated.View style={titleAnimatedStyle}>
            <Text style={{ color: colors.textColor, fontSize: 36, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 }}>
              Congratulations! 🎉
            </Text>
          </Animated.View>

          {/* Subtitle */}
          <Animated.View style={subtitleAnimatedStyle}>
            <Text style={{ color: colors.secondaryTextColor, fontSize: 20, textAlign: 'center', marginBottom: 48 }}>
              Your item is now live on the marketplace
            </Text>
          </Animated.View>

          {/* Go Home Button */}
          <Pressable
            onPress={handleGoHome}
            style={{ width: '100%', maxWidth: 400 }}
          >
            {({ pressed }) => (
              <LinearGradient
                colors={['#EC4899', '#F97316']}
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
                <Text className="text-white text-lg font-bold">
                  Go to Home
                </Text>
              </LinearGradient>
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

// Confetti Piece Component
function ConfettiPiece({
  color,
  x,
  delay,
  duration,
  rotation,
}: {
  color: string;
  x: number;
  delay: number;
  duration: number;
  rotation: number;
}) {
  const translateY = useSharedValue(-50);
  const rotate = useSharedValue(rotation);
  const opacity = useSharedValue(1);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withTiming(SCREEN_HEIGHT + 100, {
        duration,
        easing: Easing.out(Easing.quad),
      })
    );

    rotate.value = withDelay(
      delay,
      withRepeat(
        withTiming(rotation + 360, {
          duration: duration / 2,
          easing: Easing.linear,
        }),
        -1,
        false
      )
    );

    opacity.value = withDelay(
      delay + duration - 500,
      withTiming(0, { duration: 500 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: x,
          width: 12,
          height: 12,
          backgroundColor: color,
          borderRadius: 2,
        },
        animatedStyle,
      ]}
    />
  );
}
