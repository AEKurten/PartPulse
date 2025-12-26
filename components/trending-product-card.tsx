import { TextSizes, PaddingSizes } from '@/constants/platform-styles';
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
            padding: PaddingSizes.base,
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
                marginRight: PaddingSizes.base,
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
            <View style={{ flex: 1, justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: PaddingSizes.xs }}>
                <Text 
                  style={{ 
                    color: colors.textColor, 
                    fontWeight: '600', 
                    fontSize: TextSizes.base, 
                    flex: 1,
                    marginRight: PaddingSizes.sm,
                  }} 
                  numberOfLines={2}
                >
                  {name}
                </Text>
                <Text 
                  style={{ 
                    color: colors.textColor, 
                    fontWeight: 'bold', 
                    fontSize: TextSizes.xl,
                    flexShrink: 1,
                    textAlign: 'right',
                  }}
                  numberOfLines={2}
                >
                  {price}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, flexShrink: 1 }}>
                  <Ionicons name="person-circle-outline" size={14} color={colors.secondaryTextColor} />
                  <Text 
                    style={{ 
                      color: colors.secondaryTextColor, 
                      fontSize: TextSizes.xs, 
                      marginLeft: PaddingSizes.sm 
                    }}
                    numberOfLines={1}
                  >
                    Sold by
                  </Text>
                  <Text 
                    style={{ 
                      color: colors.textColor, 
                      fontWeight: '600', 
                      fontSize: TextSizes.xs, 
                      marginLeft: PaddingSizes.xs 
                    }}
                    numberOfLines={1}
                  >
                    {sellerName}
                  </Text>
                </View>
                {aiCertified && (
                  <View
                    style={{
                      backgroundColor: '#EC4899',
                      borderRadius: 6,
                      paddingHorizontal: PaddingSizes.sm,
                      paddingVertical: PaddingSizes.xs,
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginLeft: PaddingSizes.sm,
                      flexShrink: 0,
                    }}
                  >
                    <Ionicons name="sparkles" size={12} color="#FFFFFF" />
                    <Text 
                      style={{ 
                        color: '#FFFFFF', 
                        fontWeight: '600', 
                        fontSize: TextSizes.xs,
                        marginLeft: 4 
                      }}
                    >
                      AI
                    </Text>
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
