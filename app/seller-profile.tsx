import { ProductCard } from '@/components/product-card';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { getProfile } from '@/lib/database';
import type { Product, Profile } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, Modal, PanResponder, Pressable, Animated as RNAnimated, RefreshControl, ScrollView, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Reviews (TODO: Implement reviews system)

// Skeleton Loading Component
function SellerProfileSkeleton() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.2, { duration: 1500 }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const SkeletonBox = ({ width, height, borderRadius = 8, style }: { width: number | string; height: number; borderRadius?: number; style?: any }) => (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.iconBackground,
        },
        style,
        animatedStyle,
      ]}
    />
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.backgroundColor, paddingTop: insets.top }}>
      <StatusBar style={colors.statusBarStyle} />
      {/* Header Skeleton */}
      <View
        style={{
          paddingLeft: Math.max(insets.left, 24),
          paddingRight: Math.max(insets.right, 24),
          paddingTop: 24,
          paddingBottom: 24,
          borderBottomWidth: 1,
          borderBottomColor: colors.borderColor,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <SkeletonBox width={24} height={24} borderRadius={12} />
          <View style={{ flex: 1, marginLeft: 16 }}>
            <SkeletonBox width="60%" height={28} borderRadius={8} style={{ marginBottom: 8 }} />
            <SkeletonBox width="40%" height={14} borderRadius={6} />
          </View>
          <SkeletonBox width={40} height={40} borderRadius={12} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingLeft: Math.max(insets.left, 24),
          paddingRight: Math.max(insets.right, 24),
          paddingBottom: 24,
        }}
      >
        {/* Profile Header Skeleton */}
        <View style={{ paddingTop: 24, marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 }}>
            <SkeletonBox width={80} height={80} borderRadius={40} style={{ marginRight: 16 }} />
            <View style={{ flex: 1 }}>
              <SkeletonBox width="70%" height={24} borderRadius={8} style={{ marginBottom: 8 }} />
              <SkeletonBox width="50%" height={16} borderRadius={6} style={{ marginBottom: 4 }} />
              <SkeletonBox width="40%" height={16} borderRadius={6} />
            </View>
          </View>
          <SkeletonBox width="100%" height={48} borderRadius={16} />
        </View>

        {/* Stats Card Skeleton */}
        <View
          style={{
            backgroundColor: colors.cardBackground,
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: colors.borderColor,
          }}
        >
          <SkeletonBox width={100} height={18} borderRadius={6} style={{ marginBottom: 16 }} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
            {[1, 2, 3, 4].map((i) => (
              <View key={i} style={{ flex: 1, minWidth: '45%' }}>
                <SkeletonBox width="60%" height={14} borderRadius={6} style={{ marginBottom: 8 }} />
                <SkeletonBox width="80%" height={24} borderRadius={8} />
              </View>
            ))}
          </View>
        </View>

        {/* Tabs Skeleton */}
        <View
          style={{
            flexDirection: 'row',
            marginBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.borderColor,
          }}
        >
          <SkeletonBox width="50%" height={48} borderRadius={0} />
          <SkeletonBox width="50%" height={48} borderRadius={0} />
        </View>

        {/* Listings Grid Skeleton */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={{ flex: 1, minWidth: '45%' }}>
              <SkeletonBox width="100%" height={200} borderRadius={16} style={{ marginBottom: 8 }} />
              <SkeletonBox width="80%" height={16} borderRadius={6} style={{ marginBottom: 4 }} />
              <SkeletonBox width="60%" height={14} borderRadius={6} />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
const reviews: any[] = [];

export default function SellerProfileScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const { sellerId } = useLocalSearchParams<{ sellerId: string }>();
  const [activeTab, setActiveTab] = useState<'listings' | 'reviews'>('listings');
  const [showMenu, setShowMenu] = useState(false);
  const [seller, setSeller] = useState<Profile | null>(null);
  const [listings, setListings] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const translateY = useRef(new RNAnimated.Value(0)).current;

  // Pan responder for swipe down to dismiss - MUST be declared before any conditional returns
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 0 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 150) {
          RNAnimated.timing(translateY, {
            toValue: 500,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            translateY.setValue(0);
            setShowMenu(false);
          });
        } else {
          RNAnimated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const fetchSellerData = async () => {
    if (!sellerId) {
      setError('No seller ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch seller profile
      const sellerData = await getProfile(sellerId);
      if (!sellerData) {
        setError('Seller not found');
        setLoading(false);
        return;
      }
      setSeller(sellerData);

      // Fetch seller's active listings
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', sellerId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (productsError) {
        console.error('Error fetching listings:', productsError);
      } else {
        setListings(productsData || []);
      }
    } catch (err) {
      console.error('Error fetching seller data:', err);
      setError('Failed to load seller profile');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSellerData();
    setRefreshing(false);
  };

  // Fetch seller data and listings
  useEffect(() => {
    fetchSellerData();
  }, [sellerId]);

  const handleWishlistPress = (id: string, isWishlisted: boolean) => {
    console.log(`Product ${id} wishlisted: ${isWishlisted}`);
  };

  // Format products for ProductCard
  const formattedListings = listings.map((product) => {
    const imageUrl = product.images && product.images.length > 0 
      ? product.images[0] 
      : 'https://via.placeholder.com/400x300?text=No+Image';
    
    return {
      id: product.id,
      name: product.name,
      price: `R ${parseFloat(product.price.toString()).toFixed(2)}`,
      condition: product.condition,
      image: imageUrl,
    };
  });

  // Calculate stats
  const stats = {
    itemsSold: null as number | null, // TODO: Calculate from orders table
    activeListings: listings.length,
    totalRating: null as number | null, // TODO: Calculate from reviews
    responseRate: null as string | null, // TODO: Calculate from chat response times
  };

  // Format member since date
  const memberSince = seller?.created_at 
    ? new Date(seller.created_at).getFullYear().toString()
    : 'N/A';

  // Pan responder useEffect - MUST be before conditional returns
  useEffect(() => {
    if (showMenu) {
      translateY.setValue(0);
    }
  }, [showMenu]);

  if (loading) {
    return <SellerProfileSkeleton />;
  }

  if (error || !seller) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.backgroundColor, padding: 24 }}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.secondaryTextColor} />
        <Text style={{ color: colors.textColor, fontSize: 18, fontWeight: '600', marginTop: 16, textAlign: 'center' }}>
          {error || 'Seller not found'}
        </Text>
        <Pressable
          onPress={() => router.back()}
          style={{
            marginTop: 24,
            paddingHorizontal: 24,
            paddingVertical: 12,
            backgroundColor: colors.cardBackground,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.borderColor,
          }}
        >
          <Text style={{ color: colors.textColor, fontSize: 16, fontWeight: '600' }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.backgroundColor,
        paddingTop: insets.top,
      }}
    >
      <StatusBar style={colors.statusBarStyle} />

      {/* Header */}
      <View
        style={{
          paddingLeft: Math.max(insets.left, 24),
          paddingRight: Math.max(insets.right, 24),
          paddingTop: 24,
          paddingBottom: 24,
          borderBottomWidth: 1,
          borderBottomColor: colors.borderColor,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <Pressable
            onPress={() => router.back()}
            style={{ marginRight: 16 }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textColor} />
          </Pressable>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
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
              <Ionicons name="person-circle" size={24} color="#EC4899" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textColor, fontSize: 28, fontWeight: 'bold', marginBottom: 4 }}>
                Seller Profile
              </Text>
              <Text style={{ color: colors.secondaryTextColor, fontSize: 14 }}>
                View seller information and listings
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => setShowMenu(true)}
            style={{
              backgroundColor: colors.cardBackground,
              borderRadius: 12,
              width: 40,
              height: 40,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.borderColor,
            }}
          >
            <Ionicons name="ellipsis-horizontal" size={20} color={colors.textColor} />
          </Pressable>
        </View>
      </View>

      <ScrollView
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
        }}
      >
        {/* Profile Header */}
        <View style={{ paddingTop: 24, marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                overflow: 'hidden',
                marginRight: 16,
                backgroundColor: colors.iconBackground,
              }}
            >
              {seller.avatar_url ? (
                <Image
                  source={{ uri: seller.avatar_url }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                />
              ) : (
                <View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                  <Ionicons name="person-circle" size={80} color={colors.secondaryTextColor} />
                </View>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ color: colors.textColor, fontSize: 24, fontWeight: 'bold', marginRight: 8 }}>
                  {seller.username || seller.full_name || 'Unknown Seller'}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Ionicons name="calendar-outline" size={16} color={colors.secondaryTextColor} />
                <Text style={{ color: colors.secondaryTextColor, fontSize: 14, marginLeft: 4 }}>
                  Member since {memberSince}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12 }}>
                  <Ionicons name="star" size={16} color="#F59E0B" />
                  <Text style={{ color: colors.textColor, fontSize: 14, fontWeight: '600', marginLeft: 4 }}>
                    {stats.totalRating !== null ? stats.totalRating.toFixed(1) : 'N/A'}
                  </Text>
                  <Text style={{ color: colors.secondaryTextColor, fontSize: 14, marginLeft: 4 }}>
                    ({reviews.length})
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Bio */}
          {seller.bio && (
            <View
              style={{
                backgroundColor: colors.cardBackground,
                borderRadius: 16,
                padding: 12,
                marginTop: 12,
                borderWidth: 1,
                borderColor: colors.borderColor,
              }}
            >
              <Text style={{ color: colors.textColor, fontSize: 14, lineHeight: 20 }}>
                {seller.bio}
              </Text>
            </View>
          )}
        </View>

        {/* Stats Card */}
        <View
          style={{
            backgroundColor: colors.cardBackground,
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: colors.borderColor,
          }}
        >
          <Text style={{ color: colors.textColor, fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
            Statistics
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
            <View style={{ flex: 1, minWidth: '45%' }}>
              <Text style={{ color: colors.secondaryTextColor, fontSize: 14, marginBottom: 4 }}>
                Items Sold
              </Text>
              <Text style={{ color: colors.textColor, fontSize: 24, fontWeight: 'bold' }}>
                {stats.itemsSold !== null ? stats.itemsSold : 'N/A'}
              </Text>
            </View>
            <View style={{ flex: 1, minWidth: '45%' }}>
              <Text style={{ color: colors.secondaryTextColor, fontSize: 14, marginBottom: 4 }}>
                Active Listings
              </Text>
              <Text style={{ color: colors.textColor, fontSize: 24, fontWeight: 'bold' }}>
                {stats.activeListings}
              </Text>
            </View>
            <View style={{ flex: 1, minWidth: '45%' }}>
              <Text style={{ color: colors.secondaryTextColor, fontSize: 14, marginBottom: 4 }}>
                Rating
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="star" size={20} color="#F59E0B" />
                <Text style={{ color: colors.textColor, fontSize: 24, fontWeight: 'bold', marginLeft: 4 }}>
                  {stats.totalRating !== null ? stats.totalRating.toFixed(1) : 'N/A'}
                </Text>
              </View>
            </View>
            <View style={{ flex: 1, minWidth: '45%' }}>
              <Text style={{ color: colors.secondaryTextColor, fontSize: 14, marginBottom: 4 }}>
                Response Rate
              </Text>
              <Text style={{ color: colors.textColor, fontSize: 24, fontWeight: 'bold' }}>
                {stats.responseRate || 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View
          style={{
            flexDirection: 'row',
            marginBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.borderColor,
          }}
        >
          <Pressable
            onPress={() => setActiveTab('listings')}
            style={{
              flex: 1,
              paddingBottom: 12,
              borderBottomWidth: activeTab === 'listings' ? 2 : 0,
              borderBottomColor: activeTab === 'listings' ? '#EC4899' : 'transparent',
            }}
          >
            <Text
              style={{
                color: activeTab === 'listings' ? colors.textColor : colors.secondaryTextColor,
                fontSize: 16,
                fontWeight: activeTab === 'listings' ? '600' : '400',
                textAlign: 'center',
              }}
            >
              Listings ({formattedListings.length})
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('reviews')}
            style={{
              flex: 1,
              paddingBottom: 12,
              borderBottomWidth: activeTab === 'reviews' ? 2 : 0,
              borderBottomColor: activeTab === 'reviews' ? '#EC4899' : 'transparent',
            }}
          >
            <Text
              style={{
                color: activeTab === 'reviews' ? colors.textColor : colors.secondaryTextColor,
                fontSize: 16,
                fontWeight: activeTab === 'reviews' ? '600' : '400',
                textAlign: 'center',
              }}
            >
              Reviews ({reviews.length})
            </Text>
          </Pressable>
        </View>

        {/* Listings Tab */}
        {activeTab === 'listings' && (
          <>
            {formattedListings.length === 0 ? (
              <View style={{ paddingVertical: 48, alignItems: 'center' }}>
                <Ionicons name="cube-outline" size={64} color={colors.secondaryTextColor} />
                <Text style={{ color: colors.textColor, fontSize: 18, fontWeight: '600', marginTop: 16 }}>
                  No Active Listings
                </Text>
                <Text style={{ color: colors.secondaryTextColor, fontSize: 14, marginTop: 8, textAlign: 'center' }}>
                  This seller doesn't have any active listings at the moment.
                </Text>
              </View>
            ) : (
              <FlatList
                data={formattedListings}
                numColumns={2}
                scrollEnabled={false}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ gap: 16 }}
                columnWrapperStyle={{ gap: 16 }}
                renderItem={({ item }) => (
                  <View style={{ flex: 1 }}>
                    <ProductCard
                      {...item}
                      onWishlistPress={handleWishlistPress}
                      onPress={() => router.push({ pathname: '/buy-item', params: { productId: item.id } })}
                    />
                  </View>
                )}
              />
            )}
          </>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <View>
            {reviews.map((review) => (
              <View
                key={review.id}
                style={{
                  backgroundColor: colors.cardBackground,
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: colors.borderColor,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      overflow: 'hidden',
                      marginRight: 12,
                      backgroundColor: colors.iconBackground,
                    }}
                  >
                    <Image
                      source={{ uri: review.reviewerAvatar }}
                      style={{ width: '100%', height: '100%' }}
                      contentFit="cover"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      <Text style={{ color: colors.textColor, fontSize: 16, fontWeight: '600', marginRight: 8 }}>
                        {review.reviewerName}
                      </Text>
                      {review.verifiedPurchase && (
                        <View
                          style={{
                            backgroundColor: '#10B981',
                            borderRadius: 4,
                            paddingHorizontal: 6,
                            paddingVertical: 2,
                          }}
                        >
                          <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '600' }}>
                            Verified
                          </Text>
                        </View>
                      )}
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      {[...Array(5)].map((_, i) => (
                        <Ionicons
                          key={i}
                          name={i < review.rating ? 'star' : 'star-outline'}
                          size={14}
                          color={i < review.rating ? '#F59E0B' : colors.secondaryTextColor}
                        />
                      ))}
                      <Text style={{ color: colors.secondaryTextColor, fontSize: 12, marginLeft: 8 }}>
                        {review.date}
                      </Text>
                    </View>
                  </View>
                </View>
                <Text style={{ color: colors.textColor, fontSize: 14, lineHeight: 20 }}>
                  {review.comment}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Menu Modal */}
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => {
          translateY.setValue(0);
          setShowMenu(false);
        }}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: colors.backgroundColor + 'CC',
            justifyContent: 'flex-end',
          }}
          onPress={() => {
            translateY.setValue(0);
            setShowMenu(false);
          }}
        >
          <RNAnimated.View
            style={{
              backgroundColor: colors.cardBackground,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingTop: 12,
              paddingBottom: Math.max(insets.bottom, 24),
              paddingHorizontal: Math.max(insets.left, 0),
              paddingRight: Math.max(insets.right, 0),
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 20,
              transform: [{ translateY }],
            }}
            {...panResponder.panHandlers}
          >
            {/* Handle Bar */}
            <View
              style={{
                width: 40,
                height: 4,
                backgroundColor: colors.secondaryTextColor,
                borderRadius: 2,
                alignSelf: 'center',
                marginBottom: 16,
                opacity: 0.5,
              }}
            />

            {/* Heading */}
            <View style={{ paddingHorizontal: 24, marginBottom: 16 }}>
              <Text style={{ color: colors.textColor, fontSize: 18, fontWeight: 'bold' }}>
                Actions
              </Text>
            </View>

            {/* Menu Items */}
            <View style={{ paddingHorizontal: 24, gap: 20 }}>
              {/* Regular Actions Card */}
              <View
                style={{
                  backgroundColor: colors.iconBackground,
                  borderRadius: 12,
                  padding: 12,
                  gap: 12,
                }}
              >
                <Pressable
                  onPress={() => {
                    setShowMenu(false);
                    Alert.alert('Notifications', 'Seller notifications muted');
                  }}
                  style={({ pressed }) => ({
                    paddingVertical: 10,
                    paddingHorizontal: 8,
                    borderRadius: 8,
                    backgroundColor: pressed ? colors.iconBackground : 'transparent',
                  })}
                >
                  <View className="flex flex-row items-center gap-3">
                    <Ionicons name="notifications-outline" size={18} color={colors.textColor} />
                    <Text style={{ color: colors.textColor, fontSize: 16, fontWeight: '500' }}>
                      Mute Notifications
                    </Text>
                  </View>
                </Pressable>

                <Pressable
                  onPress={() => {
                    setShowMenu(false);
                    Alert.alert('Share Profile', 'Profile sharing feature coming soon');
                  }}
                  style={({ pressed }) => ({
                    paddingVertical: 10,
                    paddingHorizontal: 8,
                    borderRadius: 8,
                    backgroundColor: pressed ? colors.iconBackground : 'transparent',
                  })}
                >
                  <View className="flex flex-row items-center gap-3">
                    <Ionicons name="share-outline" size={18} color={colors.textColor} />
                    <Text style={{ color: colors.textColor, fontSize: 16, fontWeight: '500' }}>
                      Share Profile
                    </Text>
                  </View>
                </Pressable>
              </View>

              {/* Destructive Actions Card */}
              <View
                style={{
                  backgroundColor: colors.iconBackground,
                  borderRadius: 12,
                  padding: 12,
                  gap: 12,
                }}
              >
                <Pressable
                  onPress={() => {
                    setShowMenu(false);
                    Alert.alert(
                      'Block User',
                      `Are you sure you want to block ${seller?.username || seller?.full_name || 'this user'}?`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Block',
                          style: 'destructive',
                          onPress: () => Alert.alert('Blocked', 'User has been blocked'),
                        },
                      ]
                    );
                  }}
                  style={({ pressed }) => ({
                    paddingVertical: 10,
                    paddingHorizontal: 8,
                    borderRadius: 8,
                    backgroundColor: pressed ? colors.iconBackground : 'transparent',
                  })}
                >
                  <View className="flex flex-row items-center gap-3">
                    <Ionicons name="ban-outline" size={18} color="#EF4444" />
                    <Text style={{ color: colors.textColor, fontSize: 16, fontWeight: '500' }}>
                      Block User
                    </Text>
                  </View>
                </Pressable>

                <Pressable
                  onPress={() => {
                    setShowMenu(false);
                    Alert.alert(
                      'Report User',
                      `Report ${seller?.username || seller?.full_name || 'this user'} for inappropriate behavior?`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Report',
                          style: 'destructive',
                          onPress: () => Alert.alert('Reported', 'Thank you for your report'),
                        },
                      ]
                    );
                  }}
                  style={({ pressed }) => ({
                    paddingVertical: 10,
                    paddingHorizontal: 8,
                    borderRadius: 8,
                    backgroundColor: pressed ? colors.iconBackground : 'transparent',
                  })}
                >
                  <View className="flex flex-row items-center gap-3">
                    <Ionicons name="flag-outline" size={18} color="#EF4444" />
                    <Text style={{ color: colors.textColor, fontSize: 16, fontWeight: '500' }}>
                      Report User
                    </Text>
                  </View>
                </Pressable>
              </View>
            </View>
          </RNAnimated.View>
        </Pressable>
      </Modal>
    </View>
  );
}
