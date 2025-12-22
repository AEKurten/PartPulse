import { useThemeColors } from '@/hooks/use-theme-colors';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

type ProductCardProps = {
  id: string;
  name: string;
  price: string;
  condition: string;
  image: string;
  rating?: number;
  onPress?: () => void;
  onWishlistPress?: (productId: string, isWishlisted: boolean) => void;
  isWishlisted?: boolean;
};

export function ProductCard({ id, name, price, condition, image, rating, onPress, onWishlistPress, isWishlisted: initialWishlisted }: ProductCardProps) {
  const colors = useThemeColors();
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted ?? false);

  // Update local state when prop changes
  useEffect(() => {
    if (initialWishlisted !== undefined) {
      setIsWishlisted(initialWishlisted);
    }
  }, [initialWishlisted]);

  const handleWishlistPress = () => {
    const newState = !isWishlisted;
    setIsWishlisted(newState);
    onWishlistPress?.(id, newState);
  };

  return (
    <Pressable onPress={onPress} style={{ flex: 1 }}>
      {({ pressed }) => (
        <View
          style={{
            flex: 1,
            borderRadius: 16,
            padding: 8,
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
                marginBottom: 12,
                overflow: 'hidden',
              }}
            >
              <Image
                source={{ uri: image }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
              />
            </View>
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                handleWishlistPress();
              }}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
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
          </View>
          <View className="flex-1 flex-row justify-between w-full items-start">
            <Text style={{ color: colors.textColor, fontWeight: '500', fontSize: 16, flex: 1, marginRight: 8 }} numberOfLines={1}>
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
                paddingHorizontal: 8,
                paddingVertical: 5,
                borderWidth: 1.5,
                borderColor:
                  condition.includes('A+') ? '#10B981' :
                    condition.includes('A ') || condition === 'A' ? '#3B82F6' :
                      condition.includes('B ') || condition === 'B' ? '#F59E0B' :
                        condition.includes('C ') || condition === 'C' ? '#F97316' :
                          '#EF4444',
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
                  fontSize: 12,
                  fontWeight: '700',
                }}
              >
                {condition}
              </Text>
            </View>
          </View>
          <Text style={{ color: colors.textColor, fontWeight: 'bold', fontSize: 22, marginTop: 8 }}>{price ? "R " + price : "N/A"}</Text>

        </View>
      )}
    </Pressable>
  );
}

