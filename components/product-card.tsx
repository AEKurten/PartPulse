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
                backgroundColor: '#1A1C22',
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
                color={isWishlisted ? '#EC4899' : '#FFFFFF'}
              />
            </Pressable>
          </View>
          <View className="flex-1 flex-row justify-between w-full">
            <Text className="text-white font-medium text-base" numberOfLines={1}>
              {name}
            </Text>
            <Text className="text-neutral-400 text-sm">{condition}</Text>

          </View>
          <Text className="text-white font-bold text-2xl mt-2">{price}</Text>

        </View>
      )}
    </Pressable>
  );
}

