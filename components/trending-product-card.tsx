import { Ionicons } from '@expo/vector-icons';
import { Href, Link } from 'expo-router';
import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';
import { useThemeColors } from '@/hooks/use-theme-colors';

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
  const colors = useThemeColors();
  const card = (
    <Pressable>
      {({ pressed }) => (
        <View
          style={{
            flex: 1,
            backgroundColor: colors.cardBackground,
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
                backgroundColor: colors.iconBackground,
                borderRadius: 12,
                marginRight: 12,
                overflow: 'hidden',
              }}
            >
              <Image
                source={{ uri: image }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
              />
            </View>
            {/* Top Section: Name and Price */}
            <View className="flex-1 justify-between">
              <View className="flex-row justify-between">
                <Text style={{ color: colors.textColor, fontWeight: '600', fontSize: 16, marginBottom: 4, width: '66%' }} numberOfLines={2}>
                  {name}
                </Text>
                <Text style={{ color: colors.textColor, fontWeight: 'bold', fontSize: 20, textAlign: 'right' }}>
                  {price}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="person-circle-outline" size={14} color={colors.secondaryTextColor} />
                  <Text style={{ color: colors.secondaryTextColor, fontSize: 12, marginLeft: 8 }}>Sold by</Text>
                  <Text style={{ color: colors.textColor, fontWeight: '600', fontSize: 12, marginLeft: 4 }}>{sellerName}</Text>
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
                      marginLeft: 8,
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
