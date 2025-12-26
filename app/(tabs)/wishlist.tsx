import { ProductCard } from '@/components/product-card';
import { TextSizes, PaddingSizes, getPadding } from '@/constants/platform-styles';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { trackProductImpression } from '@/lib/analytics';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, Text, View, ViewToken } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../stores/useAuthStore';

interface WishlistProduct {
  id: string;
  name: string;
  price: number;
  condition: string;
  images: string[];
}

export default function WishlistScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const { user } = useAuthStore();
  const [products, setProducts] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [impressedProducts, setImpressedProducts] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchWishlist();
  }, [user?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWishlist();
    setRefreshing(false);
  };

  const fetchWishlist = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Fetch wishlist items with product details
      const { data, error } = await supabase
        .from('wishlist')
        .select(`
          product_id,
          products (
            id,
            name,
            price,
            condition,
            images
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching wishlist:', error);
        Alert.alert('Error', 'Failed to load wishlist');
        return;
      }

      // Transform the data to match our ProductCard format
      const wishlistProducts: WishlistProduct[] = (data || [])
        .map((item: any) => {
          const product = item.products;
          if (!product) return null;
          return {
            id: product.id,
            name: product.name,
            price: product.price,
            condition: product.condition,
            images: product.images || [],
          };
        })
        .filter((p): p is WishlistProduct => p !== null);

      setProducts(wishlistProducts);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      Alert.alert('Error', 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleWishlistPress = async (productId: string, isWishlisted: boolean) => {
    if (!user?.id) {
      Alert.alert('Login Required', 'Please log in to manage your wishlist');
      return;
    }

    if (!isWishlisted) {
      // Remove from wishlist
      try {
        const { error } = await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);

        if (error) {
          console.error('Error removing from wishlist:', error);
          Alert.alert('Error', 'Failed to remove item from wishlist');
        } else {
          // Update local state
          setProducts(products.filter((p) => p.id !== productId));
        }
      } catch (error) {
        console.error('Error removing from wishlist:', error);
        Alert.alert('Error', 'Failed to remove item from wishlist');
      }
    }
  };

  const handleViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    // Track impressions for newly visible items
    viewableItems.forEach(({ item }) => {
      const productId = (item as WishlistProduct).id;
      // Only track if not already impressed in this session
      if (!impressedProducts.has(productId)) {
        setImpressedProducts((prev) => new Set(prev).add(productId));
        // Track impression asynchronously (non-blocking)
        trackProductImpression(productId, user?.id || null, 'wishlist').catch((error) => {
          console.error('Error tracking impression:', error);
        });
      }
    });
  }, [impressedProducts, user?.id]);

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
          paddingLeft: Math.max(insets.left, PaddingSizes.lg),
          paddingRight: Math.max(insets.right, PaddingSizes.lg),
          paddingTop: PaddingSizes.lg,
          paddingBottom: PaddingSizes.md,
        }}
      >
        {/* Header */}
        <View style={{ marginBottom: PaddingSizes.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: PaddingSizes.base }}>
            <Pressable
              onPress={() => router.back()}
              style={{ marginRight: PaddingSizes.md }}
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
                marginRight: PaddingSizes.base,
              }}
            >
              <Ionicons name="heart-outline" size={24} color="#EC4899" />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: colors.textColor,
                  fontSize: TextSizes['3xl'],
                  fontWeight: 'bold',
                  marginBottom: PaddingSizes.xs,
                }}
              >
                My Wishlist
              </Text>
              <Text style={{ color: colors.secondaryTextColor, fontSize: TextSizes.sm }}>
                {products.length} item{products.length !== 1 ? 's' : ''} saved
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Products Grid */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#EC4899" />
        </View>
      ) : products.length > 0 ? (
        <FlatList
          data={products}
          numColumns={2}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#EC4899"
              colors={["#EC4899"]}
            />
          }
          onViewableItemsChanged={handleViewableItemsChanged}
          viewabilityConfig={{
            itemVisiblePercentThreshold: 50, // Item is considered visible when 50% is shown
          }}
          contentContainerStyle={{
            paddingLeft: Math.max(insets.left, PaddingSizes.lg),
            paddingRight: Math.max(insets.right, PaddingSizes.lg),
            paddingBottom: PaddingSizes.lg,
            gap: PaddingSizes.md,
          }}
          columnWrapperStyle={{ gap: PaddingSizes.md }}
          renderItem={({ item }) => (
            <View style={{ flex: 1 }}>
              <ProductCard
                id={item.id}
                name={item.name}
                price={item.price.toString()}
                condition={item.condition}
                image={item.images && item.images.length > 0 ? item.images[0] : ''}
                source="wishlist"
                isWishlisted={true}
                onWishlistPress={handleWishlistPress}
                onPress={() => router.push({
                  pathname: '/buy-item',
                  params: { productId: item.id }
                })}
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
            paddingHorizontal: PaddingSizes.lg,
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
              marginBottom: PaddingSizes.lg,
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
              fontSize: TextSizes.xl,
              fontWeight: '600',
              marginBottom: PaddingSizes.sm,
              textAlign: 'center',
            }}
          >
            Your wishlist is empty
          </Text>
          <Text
            style={{
              color: colors.secondaryTextColor,
              fontSize: TextSizes.sm,
              textAlign: 'center',
              marginBottom: PaddingSizes.lg,
            }}
          >
            Start saving products you love by tapping the heart icon
          </Text>
          <Pressable
            onPress={() => router.push('/(tabs)/market')}
            style={{
              backgroundColor: '#EC4899',
              borderRadius: 12,
              paddingVertical: getPadding(14),
              paddingHorizontal: PaddingSizes.lg,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: TextSizes.base, fontWeight: '600' }}>
              Browse Products
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
