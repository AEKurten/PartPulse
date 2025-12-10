import { ProductCard } from '@/components/product-card';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Mock wishlist data - in real app this would come from database
const wishlistProducts = [
  { id: 1, name: 'RTX 4090', price: '$1,599', condition: 'A+', image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=300&fit=crop&q=80' },
  { id: 5, name: 'NVIDIA GeForce RTX 4080 Super', price: '$999', condition: 'A+', image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=300&fit=crop&q=80' },
  { id: 7, name: 'ASUS ROG Motherboard', price: '$349', condition: 'A+', image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop&q=80' },
];

export default function WishlistScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const [products, setProducts] = useState(wishlistProducts);

  const handleRemoveFromWishlist = (id: number) => {
    setProducts(products.filter((p) => p.id !== id));
    // In real app, remove from database
  };

  const handleWishlistPress = (id: number, isWishlisted: boolean) => {
    if (!isWishlisted) {
      handleRemoveFromWishlist(id);
    }
  };

  return (
    <View
      className="flex-1"
      style={{
        backgroundColor: colors.backgroundColor,
        paddingTop: insets.top,
      }}
    >
      <StatusBar style={colors.statusBarStyle} />
      <View
        style={{
          paddingLeft: Math.max(insets.left, 24),
          paddingRight: Math.max(insets.right, 24),
          paddingTop: 24,
          paddingBottom: 16,
        }}
      >
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Pressable
              onPress={() => router.back()}
              style={{ marginRight: 16 }}
            >
              <Ionicons name="arrow-back" size={24} color={colors.textColor} />
            </Pressable>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: '#EC4899' + '20',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
              }}
            >
              <Ionicons name="heart-outline" size={24} color="#EC4899" />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: colors.textColor,
                  fontSize: 28,
                  fontWeight: 'bold',
                  marginBottom: 4,
                }}
              >
                My Wishlist
              </Text>
              <Text style={{ color: colors.secondaryTextColor, fontSize: 14 }}>
                {products.length} item{products.length !== 1 ? 's' : ''} saved
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Products Grid */}
      {products.length > 0 ? (
        <FlatList
          data={products}
          numColumns={2}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingLeft: Math.max(insets.left, 24),
            paddingRight: Math.max(insets.right, 24),
            paddingBottom: 24,
            gap: 16,
          }}
          columnWrapperStyle={{ gap: 16 }}
          renderItem={({ item }) => (
            <View style={{ flex: 1 }}>
              <ProductCard
                id={item.id}
                name={item.name}
                price={item.price}
                condition={item.condition}
                image={item.image}
                isWishlisted={true}
                onWishlistPress={handleWishlistPress}
                onPress={() => router.push('/buy-item')}
              />
            </View>
          )}
        />
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 24,
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: colors.cardBackground,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 24,
            }}
          >
            <Ionicons
              name="heart-outline"
              size={40}
              color={colors.secondaryTextColor}
            />
          </View>
          <Text
            style={{
              color: colors.textColor,
              fontSize: 20,
              fontWeight: '600',
              marginBottom: 8,
              textAlign: 'center',
            }}
          >
            Your wishlist is empty
          </Text>
          <Text
            style={{
              color: colors.secondaryTextColor,
              fontSize: 14,
              textAlign: 'center',
              marginBottom: 24,
            }}
          >
            Start saving products you love by tapping the heart icon
          </Text>
          <Pressable
            onPress={() => router.push('/(tabs)/market')}
            style={{
              backgroundColor: '#EC4899',
              borderRadius: 12,
              paddingVertical: 14,
              paddingHorizontal: 24,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
              Browse Products
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

