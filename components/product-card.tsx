import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

type ProductCardProps = {
  id: number;
  name: string;
  price: string;
  condition: string;
  image: string;
  onPress?: () => void;
};

export function ProductCard({ name, price, condition, image, onPress }: ProductCardProps) {
  return (
    <Pressable onPress={onPress} className='flex-1'>
      {({ pressed }) => (
        <View
          style={{
            flex: 1,
            borderRadius: 16,
            padding: 16,
            opacity: pressed ? 0.8 : 1,
          }}
        >
          <View
            style={{
              width: 180,
              height: 180,
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

