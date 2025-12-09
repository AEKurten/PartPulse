import { Ionicons } from '@expo/vector-icons';
import { Href, Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

type TrendingProductCardProps = {
  id: number;
  name: string;
  price: string;
  condition: string;
  image: string;
  rating: number;
  sellerName: string;
  aiCertified?: boolean;
  href?: Href;
};

export function TrendingProductCard({
  name,
  price,
  condition,
  image,
  rating,
  sellerName,
  aiCertified = false,
  href = '/buy-item',
}: TrendingProductCardProps) {
  const card = (
    <Pressable>
      {({ pressed }) => (
        <View
          style={{
            flex: 1,
            backgroundColor: '#2B2E36',
            borderRadius: 16,
            padding: 12,
            opacity: pressed ? 0.8 : 1,
            marginRight: 0,
          }}
        >

          {/* Middle Section: Image and Details */}
          <View style={{ flexDirection: 'row', flex: 1 }}>
            <View
              style={{
                width: 80,
                height: 80,
                backgroundColor: '#1A1C22',
                borderRadius: 12,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
              }}
            >
              <Text style={{ fontSize: 32 }}>{image}</Text>
            </View>
            {/* Top Section: Name and Price */}
            <View className="flex-1 justify-between">
              <View className="flex-row justify-between">
                <Text className="text-white font-semibold text-base mb-1 w-2/3" numberOfLines={2}>
                  {name}
                </Text>
                <Text className="text-white font-bold text-xl text-right">
                  {price}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="person-circle-outline" size={14} color="#9CA3AF" />
                  <Text className="text-neutral-400 text-xs ml-2">Sold by</Text>
                  <Text className="text-white font-semibold text-xs ml-1">{sellerName}</Text>
                </View>
                {aiCertified && (
                  <View
                    style={{
                      backgroundColor: '#EC4899',
                      borderRadius: 6,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <Ionicons name="sparkles" size={12} color="#FFFFFF" />
                    <Text className="text-white font-semibold text-xs ml-1">AI</Text>
                  </View>
                )}
              </View>
            </View>

          </View>
        </View>
      )}
    </Pressable>
  );

  if (href) {
    return (
      <Link href={href} asChild>
        {card}
      </Link>
    );
  }

  return card;
}
