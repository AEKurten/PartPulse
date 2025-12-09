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
    <Pressable onPress={onPress} style={{ width: 180, marginRight: 16 }}>
      {({ pressed }) => (
        <View
          style={{
            backgroundColor: '#2B2E36',
            borderRadius: 16,
            padding: 16,
            opacity: pressed ? 0.8 : 1,
          }}
        >
          <View
            style={{
              width: '100%',
              height: 120,
              backgroundColor: '#1A1C22',
              borderRadius: 12,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 48 }}>{image}</Text>
          </View>
          <Text className="text-white font-semibold text-base mb-1" numberOfLines={1}>
            {name}
          </Text>
          <Text className="text-neutral-400 text-sm mb-2">{condition}</Text>
          <Text className="text-[#EC4899] font-bold text-lg">{price}</Text>
        </View>
      )}
    </Pressable>
  );
}

