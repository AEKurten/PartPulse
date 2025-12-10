import { ProductCard } from '@/components/product-card';
import { SearchBar } from '@/components/search-bar';
import { SectionHeader } from '@/components/section-header';
import { TrendingProductCard } from '@/components/trending-product-card';
import { AdBanner } from '@/components/ad-banner';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SubscriptionPaywall from '@/app/subscription-paywall';

// Hardcoded username for now
const USERNAME = 'Alex';

// Mock product data with Unsplash images
const recommendedProducts = [
  { id: 1, name: 'RTX 4090', price: '$1,599', condition: 'A+', image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=300&fit=crop&q=80' },
  { id: 2, name: 'Ryzen 9 7950X', price: '$549', condition: 'B', image: 'https://images.unsplash.com/photo-1587825147138-346b006e0937?w=400&h=300&fit=crop&q=80' },
  { id: 3, name: '32GB DDR5 RAM', price: '$199', condition: 'A', image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop&q=80' },
  { id: 4, name: '1TB NVMe SSD', price: '$89', condition: 'C', image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=300&fit=crop&q=80' },
];

const trendingProducts = [
  { id: 5, name: 'NVIDIA GeForce RTX 4080 Super', price: '$999', condition: 'Excellent', image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=300&fit=crop&q=80', rating: 4.8, sellerName: 'TechGuru', aiCertified: true },
  { id: 6, name: 'Intel i9-14900K', price: '$579', condition: 'Like New', image: 'https://images.unsplash.com/photo-1587825147138-346b006e0937?w=400&h=300&fit=crop&q=80', rating: 4.9, sellerName: 'PCBuilder Pro', aiCertified: true },
  { id: 7, name: 'ASUS ROG Motherboard', price: '$349', condition: 'Excellent', image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop&q=80', rating: 4.7, sellerName: 'Hardware Haven', aiCertified: false },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';
  
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const buttonsOpacity = useSharedValue(1);
  const buttonsWidth = useSharedValue(56);
  const buttonsMargin = useSharedValue(12);

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    buttonsOpacity.value = withTiming(0, { duration: 200 });
    buttonsWidth.value = withTiming(0, { duration: 200 });
    buttonsMargin.value = withTiming(0, { duration: 200 });
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
    buttonsOpacity.value = withTiming(1, { duration: 200 });
    buttonsWidth.value = withTiming(56, { duration: 200 });
    buttonsMargin.value = withTiming(12, { duration: 200 });
  };

  const buttonsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
    width: buttonsWidth.value,
    marginLeft: buttonsMargin.value,
  }));

  return (
    <View
      className="flex-1"
      style={{
        backgroundColor: colors.backgroundColor,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <StatusBar style={colors.statusBarStyle} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingLeft: Math.max(insets.left, 24),
          paddingRight: Math.max(insets.right, 24),
          paddingBottom: 24,
        }}
      >
        {/* Welcome Message with Chats Button */}
        <View style={{ paddingTop: 24, marginBottom: 32 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
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
                  <Ionicons name="home" size={24} color="#EC4899" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.textColor, fontSize: 24, fontWeight: 'bold', marginBottom: 4 }}>
                    {greeting}, {USERNAME}
                  </Text>
                  <Text style={{ color: colors.secondaryTextColor, fontSize: 14 }}>
                    Welcome back to PartPulse
                  </Text>
                </View>
              </View>
            </View>
            <Pressable
              onPress={() => router.push('/chats')}
              style={{
                backgroundColor: colors.cardBackground,
                borderRadius: 16,
                width: 56,
                height: 56,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.borderColor,
              }}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={24} color={colors.textColor} />
            </Pressable>
          </View>
        </View>

        {/* Search Bar with Quick Access Buttons */}
        <View style={{ marginBottom: 32 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <SearchBar onFocus={handleSearchFocus} onBlur={handleSearchBlur} />
            </View>
            
            {/* Wishlist Button */}
            <Animated.View style={buttonsAnimatedStyle}>
              <Pressable
                onPress={() => router.push('/(tabs)/wishlist')}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: colors.cardBackground,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: '#EC4899' + '30',
                  overflow: 'hidden',
                }}
              >
                <Ionicons name="heart-outline" size={24} color="#EC4899" />
              </Pressable>
            </Animated.View>

            {/* Notifications Button */}
            <Animated.View style={buttonsAnimatedStyle}>
              <Pressable
                onPress={() => router.push('/(tabs)/notifications')}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: colors.cardBackground,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: '#3B82F6' + '30',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Ionicons name="notifications-outline" size={24} color="#3B82F6" />
                {/* Unread indicator */}
                <View
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: '#EC4899',
                    borderWidth: 2,
                    borderColor: colors.cardBackground,
                  }}
                />
              </Pressable>
            </Animated.View>
          </View>
        </View>

        {/* Recommended Items Section */}
        <View style={{ marginBottom: 32 }}>
          <SectionHeader
            title="Recommended for You"
            onShowAllPress={() => router.push('/(tabs)/market')}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 24 }}
          >
            {recommendedProducts.map((product) => (
              <View key={product.id} style={{ width: 180 }}>
                <ProductCard {...product} />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Trending Products Section */}
        <View>
          <SectionHeader
            title="Trending Products"
            onShowAllPress={() => router.push('/(tabs)/market')}
          />
          <View>
            {trendingProducts.map((product) => (
              <View key={product.id} style={{ marginBottom: 16 }}>
                <TrendingProductCard {...product} />
              </View>
            ))}
          </View>
        </View>

        {/* Ad Banner */}
        <View style={{ marginTop: 32, marginBottom: 16 }}>
          <AdBanner onUpgradePress={() => setShowPaywall(true)} />
        </View>
      </ScrollView>

      {/* Paywall Modal */}
      <SubscriptionPaywall
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        trigger="upgrade-prompt"
      />
    </View>
  );
}
