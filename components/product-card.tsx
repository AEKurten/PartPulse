import { useThemeColors } from '@/hooks/use-theme-colors';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

type ProductCardProps = {
  id: number;
  name: string;
  price: string;
  condition: string;
  image: string;
  onPress?: () => void;
  onWishlistPress?: (id: number, isWishlisted: boolean) => void;
};

export function ProductCard({ id, name, price, condition, image, onPress, onWishlistPress }: ProductCardProps) {
  const colors = useThemeColors();
  const [isWishlisted, setIsWishlisted] = useState(false);

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
          <View className="flex-1 flex-row justify-between w-full">
            <Text style={{ color: colors.textColor, fontWeight: '500', fontSize: 16 }} numberOfLines={1}>
              {name}
            </Text>
            <Text style={{ color: colors.secondaryTextColor, fontSize: 14 }}>{condition}</Text>

          </View>
          <Text style={{ color: colors.textColor, fontWeight: 'bold', fontSize: 24, marginTop: 8 }}>{price}</Text>

        </View>
      )}
    </Pressable>
  );
}

