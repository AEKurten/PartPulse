import { useThemeColors } from '@/hooks/use-theme-colors';
import { useEffect } from 'react';
import { Dimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SkeletonBox = ({ 
  width, 
  height, 
  borderRadius = 8,
  style 
}: { 
  width: number | string; 
  height: number; 
  borderRadius?: number;
  style?: any;
}) => {
  const colors = useThemeColors();
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.2, { duration: 1500 }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.iconBackground,
        },
        style,
        animatedStyle,
      ]}
    />
  );
};

export function ProductDetailSkeleton() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();

  return (
    <View style={{ flex: 1, backgroundColor: colors.backgroundColor }}>
      {/* Top Buttons Skeleton */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          paddingTop: insets.top + 16,
          paddingLeft: 16,
          paddingRight: 16,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10,
        }}
      >
        <SkeletonBox width={40} height={40} borderRadius={20} />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <SkeletonBox width={40} height={40} borderRadius={20} />
          <SkeletonBox width={40} height={40} borderRadius={20} />
        </View>
      </View>

      {/* Scrollable Content */}
      <View style={{ flex: 1 }}>
        {/* Image Gallery Skeleton */}
        <View style={{ position: 'relative' }}>
          <SkeletonBox width={SCREEN_WIDTH} height={SCREEN_WIDTH} borderRadius={0} />
          <View
            style={{
              position: 'absolute',
              bottom: 16,
              left: 0,
              right: 0,
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <SkeletonBox width={8} height={8} borderRadius={4} />
            <SkeletonBox width={8} height={8} borderRadius={4} />
            <SkeletonBox width={8} height={8} borderRadius={4} />
          </View>
        </View>

        {/* Content Skeleton */}
        <View
          style={{
            paddingLeft: Math.max(insets.left, 24),
            paddingRight: Math.max(insets.right, 24),
            paddingTop: 24,
          }}
        >
          {/* Product Name & Price Skeleton */}
          <View style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <SkeletonBox width="70%" height={36} borderRadius={8} />
              <SkeletonBox width={100} height={28} borderRadius={8} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <SkeletonBox width={120} height={36} borderRadius={8} />
              <SkeletonBox width={80} height={28} borderRadius={8} />
            </View>
          </View>

          {/* Seller Info Skeleton */}
          <View
            style={{
              backgroundColor: colors.cardBackground,
              borderRadius: 16,
              padding: 16,
              marginBottom: 24,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <SkeletonBox width={40} height={40} borderRadius={20} />
            <View style={{ flex: 1 }}>
              <SkeletonBox width="60%" height={20} borderRadius={6} style={{ marginBottom: 8 }} />
              <SkeletonBox width="40%" height={16} borderRadius={6} />
            </View>
            <SkeletonBox width={20} height={20} borderRadius={10} />
          </View>

          {/* Description Skeleton */}
          <View style={{ marginBottom: 24 }}>
            <SkeletonBox width={120} height={24} borderRadius={6} style={{ marginBottom: 12 }} />
            <SkeletonBox width="100%" height={16} borderRadius={6} style={{ marginBottom: 8 }} />
            <SkeletonBox width="100%" height={16} borderRadius={6} style={{ marginBottom: 8 }} />
            <SkeletonBox width="80%" height={16} borderRadius={6} />
          </View>

          {/* Specifications Skeleton */}
          <View style={{ marginBottom: 24 }}>
            <SkeletonBox width={140} height={24} borderRadius={6} style={{ marginBottom: 12 }} />
            <View
              style={{
                backgroundColor: colors.cardBackground,
                borderRadius: 16,
                overflow: 'hidden',
              }}
            >
              {[1, 2, 3, 4].map((i) => (
                <View
                  key={i}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingVertical: 16,
                    paddingHorizontal: 16,
                    borderBottomWidth: i < 4 ? 1 : 0,
                    borderBottomColor: colors.borderColor,
                  }}
                >
                  <SkeletonBox width={100} height={20} borderRadius={6} />
                  <SkeletonBox width={120} height={20} borderRadius={6} />
                </View>
              ))}
            </View>
          </View>

          {/* Listing Info Skeleton */}
          <View
            style={{
              backgroundColor: colors.cardBackground,
              borderRadius: 16,
              padding: 16,
              marginBottom: 24,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <SkeletonBox width={120} height={16} borderRadius={6} />
              <SkeletonBox width={100} height={16} borderRadius={6} />
            </View>
          </View>
        </View>
      </View>

      {/* Action Buttons Skeleton */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingLeft: Math.max(insets.left, 24),
          paddingRight: Math.max(insets.right, 24),
          paddingBottom: insets.bottom + 16,
          paddingTop: 16,
          backgroundColor: colors.backgroundColor,
          flexDirection: 'row',
          gap: 12,
          borderTopWidth: 1,
          borderTopColor: colors.borderColor,
        }}
      >
        <SkeletonBox width="48%" height={56} borderRadius={16} />
        <SkeletonBox width="48%" height={56} borderRadius={16} />
      </View>
    </View>
  );
}

