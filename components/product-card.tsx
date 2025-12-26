import { TextSizes, PaddingSizes, getPadding, getFontSize } from '@/constants/platform-styles';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { trackProductClick } from '@/lib/analytics';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useAuthStore } from '@/app/stores/useAuthStore';

type ProductCardProps = {
  id: string;
  name: string;
  price: string;
  condition: string;
  image: string;
  rating?: number;
  status?: 'active' | 'sold' | 'draft' | 'paused';
  onPress?: () => void;
  onWishlistPress?: (productId: string, isWishlisted: boolean) => void;
  isWishlisted?: boolean;
  source?: string; // Track where the click came from (e.g., 'marketplace', 'wishlist', 'search')
};

export function ProductCard({ id, name, price, condition, image, rating, status, onPress, onWishlistPress, isWishlisted: initialWishlisted, source }: ProductCardProps) {
  const colors = useThemeColors();
  const { user } = useAuthStore();
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted ?? false);

  // Update local state when prop changes
  useEffect(() => {
    if (initialWishlisted !== undefined) {
      setIsWishlisted(initialWishlisted);
    }
  }, [initialWishlisted]);

  const handleWishlistPress = () => {
    const newState = !isWishlisted;
    // Update local state optimistically
    setIsWishlisted(newState);
    // Pass the NEW state (what we want it to be) to the handler
    onWishlistPress?.(id, newState);
  };

  const handlePress = () => {
    // Track click before navigating
    trackProductClick(id, user?.id || null, {
      source: source || 'unknown',
      referrer: 'product_card',
    });
    onPress?.();
  };

  return (
    <Pressable onPress={handlePress} style={{ flex: 1 }}>
      {({ pressed }) => (
        <View
          style={{
            flex: 1,
            borderRadius: 16,
            padding: PaddingSizes.sm,
            opacity: pressed ? 0.8 : 1,
          }}
        >
          <View style={{ position: 'relative' }}>
            <View
              style={{
                width: '100%',
                aspectRatio: 1,
                borderRadius: 12,
                backgroundColor: colors.iconBackground,
                marginBottom: PaddingSizes.base,
                overflow: 'hidden',
                opacity: status === 'sold' || status === 'paused' ? 0.6 : 1,
              }}
            >
              <Image
                source={{ uri: image }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
              />
            </View>
            {/* Status Badge */}
            {status && status !== 'active' && (
              <View
                style={{
                  position: 'absolute',
                  top: PaddingSizes.sm,
                  left: PaddingSizes.sm,
                  backgroundColor: 
                    status === 'sold' ? '#10B981' : 
                    status === 'draft' ? '#F59E0B' : 
                    status === 'paused' ? '#6B7280' : 
                    'transparent',
                  borderRadius: 8,
                  paddingHorizontal: PaddingSizes.sm,
                  paddingVertical: PaddingSizes.xs,
                  zIndex: 10,
                }}
              >
                <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: getFontSize(10),
                  fontWeight: '700',
                  textTransform: 'uppercase',
                }}
                >
                  {status === 'sold' ? 'Sold' : status === 'draft' ? 'Draft' : status === 'paused' ? 'Paused' : ''}
                </Text>
              </View>
            )}
            {onWishlistPress && (
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  handleWishlistPress();
                }}
                style={{
                  position: 'absolute',
                  top: PaddingSizes.sm,
                  right: PaddingSizes.sm,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  borderRadius: 20,
                  width: 36,
                  height: 36,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons
                  name={isWishlisted ? 'heart' : 'heart-outline'}
                  size={20}
                  color={isWishlisted ? '#EC4899' : colors.textColor}
                />
              </Pressable>
            )}
          </View>
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'flex-start', marginBottom: PaddingSizes.sm }}>
            <Text 
              style={{ 
                color: colors.textColor, 
                fontWeight: '500', 
                fontSize: TextSizes.base, 
                flex: 1, 
                marginRight: PaddingSizes.sm 
              }} 
              numberOfLines={2}
            >
              {name}
            </Text>
            <View
              style={{
                backgroundColor:
                  condition.includes('A+') ? '#10B981' + '20' :
                    condition.includes('A ') || condition === 'A' ? '#3B82F6' + '20' :
                      condition.includes('B ') || condition === 'B' ? '#F59E0B' + '20' :
                        condition.includes('C ') || condition === 'C' ? '#F97316' + '20' :
                          '#EF4444' + '20',
                borderRadius: 8,
                paddingHorizontal: PaddingSizes.sm,
                paddingVertical: getPadding(5),
                borderWidth: 1.5,
                borderColor:
                  condition.includes('A+') ? '#10B981' :
                    condition.includes('A ') || condition === 'A' ? '#3B82F6' :
                      condition.includes('B ') || condition === 'B' ? '#F59E0B' :
                        condition.includes('C ') || condition === 'C' ? '#F97316' :
                          '#EF4444',
                flexShrink: 0,
              }}
            >
              <Text
                style={{
                  color:
                    condition.includes('A+') ? '#10B981' :
                      condition.includes('A ') || condition === 'A' ? '#3B82F6' :
                        condition.includes('B ') || condition === 'B' ? '#F59E0B' :
                          condition.includes('C ') || condition === 'C' ? '#F97316' :
                            '#EF4444',
                  fontSize: TextSizes.xs,
                  fontWeight: '700',
                }}
                numberOfLines={1}
              >
                {condition}
              </Text>
            </View>
          </View>
          <Text 
            style={{ 
              color: colors.textColor, 
              fontWeight: 'bold', 
              fontSize: TextSizes['2xl'], 
              marginTop: PaddingSizes.sm 
            }}
            numberOfLines={1}
          >
            {price ? "R " + price : "N/A"}
          </Text>

        </View>
      )}
    </Pressable>
  );
}

