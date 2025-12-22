import { ProductCard } from '@/components/product-card';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/lib/database.types';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from './stores/useAuthStore';

export default function MyListingsScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const { user } = useAuthStore();
  const [listings, setListings] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchListings = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching listings:', error);
        Alert.alert('Error', 'Failed to load your listings');
        return;
      }

      setListings(data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
      Alert.alert('Error', 'Failed to load your listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [user?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchListings();
    setRefreshing(false);
  };

  const handleProductPress = (productId: string) => {
    router.push({
      pathname: '/edit-listing',
      params: { productId }
    });
  };

  const formattedListings = listings.map((product) => {
    const imageUrl = product.images && product.images.length > 0 
      ? product.images[0] 
      : '';
    
    return {
      id: product.id,
      name: product.name,
      price: product.price.toString(),
      condition: product.condition,
      image: imageUrl,
    };
  });

  return (
    <View
      style={{
        flex: 1,
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
              <Ionicons name="list-outline" size={24} color="#EC4899" />
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
                My Listings
              </Text>
              <Text style={{ color: colors.secondaryTextColor, fontSize: 14 }}>
                {listings.length} active {listings.length !== 1 ? 'listings' : 'listing'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Listings Grid */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#EC4899" />
        </View>
      ) : listings.length > 0 ? (
        <FlatList
          data={formattedListings}
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
                onPress={() => handleProductPress(item.id)}
                onWishlistPress={undefined}
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
              name="cube-outline"
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
            No active listings
          </Text>
          <Text
            style={{
              color: colors.secondaryTextColor,
              fontSize: 14,
              textAlign: 'center',
              marginBottom: 24,
            }}
          >
            Start selling by creating your first listing
          </Text>
          <Pressable
            onPress={() => router.push('/sell/step1')}
            style={{
              backgroundColor: '#EC4899',
              borderRadius: 12,
              paddingVertical: 14,
              paddingHorizontal: 24,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
              Create Listing
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

