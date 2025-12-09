import { ProductCard } from '@/components/product-card';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
import { Alert, Animated, FlatList, Modal, PanResponder, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

// Mock seller data (in real app, this would come from route params or API)
const sellerData = {
  id: 1,
  name: 'TechGuru',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&q=80',
  location: 'San Francisco, CA',
  rating: 4.8,
  totalReviews: 127,
  responseTime: 'Usually responds within 1 hour',
  memberSince: '2022',
  aiVerified: true,
  aiGrade: 'A+',
  stats: {
    itemsSold: 89,
    activeListings: 12,
    totalRating: 4.8,
    responseRate: '98%',
  },
};

// Mock listings
const sellerListings = [
  { id: 1, name: 'RTX 4090', price: '$1,599', condition: 'A+', image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=300&fit=crop&q=80' },
  { id: 2, name: 'Ryzen 9 7950X', price: '$549', condition: 'A', image: 'https://images.unsplash.com/photo-1587825147138-346b006e0937?w=400&h=300&fit=crop&q=80' },
  { id: 3, name: '32GB DDR5 RAM', price: '$199', condition: 'B', image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop&q=80' },
  { id: 4, name: '1TB NVMe SSD', price: '$89', condition: 'A+', image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=300&fit=crop&q=80' },
  { id: 5, name: 'ASUS ROG Motherboard', price: '$349', condition: 'A', image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop&q=80' },
  { id: 6, name: 'Corsair 850W PSU', price: '$129', condition: 'B', image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=300&fit=crop&q=80' },
];

// Mock reviews
const reviews = [
  {
    id: 1,
    reviewerName: 'Alex M.',
    reviewerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80',
    rating: 5,
    date: '2 weeks ago',
    comment: 'Excellent seller! Item was exactly as described and shipped quickly. Highly recommend!',
    verifiedPurchase: true,
  },
  {
    id: 2,
    reviewerName: 'Sarah K.',
    reviewerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&q=80',
    rating: 5,
    date: '1 month ago',
    comment: 'Great communication and fast shipping. The GPU works perfectly. Will buy from again!',
    verifiedPurchase: true,
  },
  {
    id: 3,
    reviewerName: 'Mike T.',
    reviewerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&q=80',
    rating: 4,
    date: '2 months ago',
    comment: 'Good seller, item arrived as expected. Minor delay in shipping but overall satisfied.',
    verifiedPurchase: true,
  },
];

export default function SellerProfileScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const [activeTab, setActiveTab] = useState<'listings' | 'reviews'>('listings');
  const [showMenu, setShowMenu] = useState(false);
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showMenu) {
      translateY.setValue(0);
    }
  }, [showMenu]);

  const handleWishlistPress = (id: number, isWishlisted: boolean) => {
    console.log(`Product ${id} wishlisted: ${isWishlisted}`);
  };

  // Pan responder for swipe down to dismiss
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
          Animated.timing(translateY, {
            toValue: 500,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            translateY.setValue(0);
            setShowMenu(false);
          });
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

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
              <Image
                source={{ uri: sellerData.avatar }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
              />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ color: colors.textColor, fontSize: 24, fontWeight: 'bold', marginRight: 8 }}>
                  {sellerData.name}
                </Text>
                {sellerData.aiVerified && (
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
                    <Ionicons name="sparkles" size={14} color="#FFFFFF" />
                    <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600', marginLeft: 4 }}>
                      AI Verified
                    </Text>
                  </View>
                )}
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Ionicons name="location-outline" size={16} color={colors.secondaryTextColor} />
                <Text style={{ color: colors.secondaryTextColor, fontSize: 14, marginLeft: 4 }}>
                  {sellerData.location}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12 }}>
                  <Ionicons name="star" size={16} color="#F59E0B" />
                  <Text style={{ color: colors.textColor, fontSize: 14, fontWeight: '600', marginLeft: 4 }}>
                    {sellerData.rating}
                  </Text>
                  <Text style={{ color: colors.secondaryTextColor, fontSize: 14, marginLeft: 4 }}>
                    ({sellerData.totalReviews})
                  </Text>
                </View>
                {sellerData.aiVerified && (
                  <View
                    style={{
                      backgroundColor: '#10B981',
                      borderRadius: 6,
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                    }}
                  >
                    <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' }}>
                      Grade {sellerData.aiGrade}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Response Time */}
          <View
            style={{
              backgroundColor: colors.cardBackground,
              borderRadius: 16,
              padding: 12,
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.borderColor,
            }}
          >
            <Ionicons name="time-outline" size={20} color={colors.secondaryTextColor} />
            <Text style={{ color: colors.secondaryTextColor, fontSize: 14, marginLeft: 8 }}>
              {sellerData.responseTime}
            </Text>
          </View>
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
                {sellerData.stats.itemsSold}
              </Text>
            </View>
            <View style={{ flex: 1, minWidth: '45%' }}>
              <Text style={{ color: colors.secondaryTextColor, fontSize: 14, marginBottom: 4 }}>
                Active Listings
              </Text>
              <Text style={{ color: colors.textColor, fontSize: 24, fontWeight: 'bold' }}>
                {sellerData.stats.activeListings}
              </Text>
            </View>
            <View style={{ flex: 1, minWidth: '45%' }}>
              <Text style={{ color: colors.secondaryTextColor, fontSize: 14, marginBottom: 4 }}>
                Rating
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="star" size={20} color="#F59E0B" />
                <Text style={{ color: colors.textColor, fontSize: 24, fontWeight: 'bold', marginLeft: 4 }}>
                  {sellerData.stats.totalRating}
                </Text>
              </View>
            </View>
            <View style={{ flex: 1, minWidth: '45%' }}>
              <Text style={{ color: colors.secondaryTextColor, fontSize: 14, marginBottom: 4 }}>
                Response Rate
              </Text>
              <Text style={{ color: colors.textColor, fontSize: 24, fontWeight: 'bold' }}>
                {sellerData.stats.responseRate}
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
              Listings ({sellerListings.length})
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
          <FlatList
            data={sellerListings}
            numColumns={2}
            scrollEnabled={false}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ gap: 16 }}
            columnWrapperStyle={{ gap: 16 }}
            renderItem={({ item }) => (
              <View style={{ flex: 1 }}>
                <ProductCard
                  {...item}
                  onWishlistPress={handleWishlistPress}
                  onPress={() => router.push('/buy-item')}
                />
              </View>
            )}
          />
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
          <Animated.View
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
                      `Are you sure you want to block ${sellerData.name}?`,
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
                      `Report ${sellerData.name} for inappropriate behavior?`,
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
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
}
