import { PrivateChat } from '@/components/private-chat';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Dimensions, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mock product data (in real app, this would come from route params or API)
const productData = {
  id: 1,
  name: 'NVIDIA GeForce RTX 4090',
  price: '$1,599',
  condition: 'A+ (Like New)',
  images: [
    'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&h=600&fit=crop&q=80',
  ],
  sellerName: 'TechGuru',
  sellerRating: 4.8,
  aiCertified: true,
  aiGrade: 'A+',
  aiScore: 92,
  description:
    'Excellent condition RTX 4090, barely used. Original packaging included. All components functioning properly. No visible damage detected. Item shows minimal signs of use.',
  specifications: [
    { label: 'Brand', value: 'NVIDIA' },
    { label: 'Model', value: 'GeForce RTX 4090' },
    { label: 'Memory', value: '24GB GDDR6X' },
    { label: 'Interface', value: 'PCIe 4.0' },
    { label: 'Power Connector', value: '12VHPWR' },
    { label: 'Warranty', value: '2 years remaining' },
  ],
  location: 'San Francisco, CA',
  listedDate: '2 days ago',
  isPrivateSale: true, // true for private sale, false for marketplace
};

export default function BuyItemScreen() {
  const insets = useSafeAreaInsets();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [hasAlert, setHasAlert] = useState(false);

  const handleWishlistPress = () => {
    setIsWishlisted(!isWishlisted);
  };

  const handleAlertPress = () => {
    setHasAlert(!hasAlert);
  };

  const handleAddToCart = () => {
    router.push('/checkout');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: '#0F0E11' }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      {/* Fixed Top Buttons */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          paddingTop: insets.top + 16,
          paddingLeft: 16,
          paddingRight: 16,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10,
        }}
      >
        {/* Back Button */}
        <Pressable
          onPress={() => router.back()}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderRadius: 20,
            width: 40,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>

        {/* Wishlist & Alert Buttons */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {/* Alert Button */}
          <Pressable
            onPress={handleAlertPress}
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              borderRadius: 20,
              width: 40,
              height: 40,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons
              name={hasAlert ? 'notifications' : 'notifications-outline'}
              size={24}
              color={hasAlert ? '#EC4899' : '#FFFFFF'}
            />
          </Pressable>

          {/* Wishlist Button */}
          <Pressable
            onPress={handleWishlistPress}
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              borderRadius: 20,
              width: 40,
              height: 40,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons
              name={isWishlisted ? 'heart' : 'heart-outline'}
              size={24}
              color={isWishlisted ? '#EC4899' : '#FFFFFF'}
            />
          </Pressable>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: productData.isPrivateSale ? 120 : 100 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        {/* Image Gallery */}
        <View style={{ position: 'relative' }}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(
                event.nativeEvent.contentOffset.x / SCREEN_WIDTH
              );
              setCurrentImageIndex(index);
            }}
          >
            {productData.images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={{
                  width: SCREEN_WIDTH,
                  height: SCREEN_WIDTH,
                }}
                contentFit="cover"
              />
            ))}
          </ScrollView>

          {/* Image Indicators */}
          {productData.images.length > 1 && (
            <View
              style={{
                position: 'absolute',
                bottom: 16,
                left: 0,
                right: 0,
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {productData.images.map((_, index) => (
                <View
                  key={index}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor:
                      index === currentImageIndex
                        ? '#FFFFFF'
                        : 'rgba(255, 255, 255, 0.5)',
                  }}
                />
              ))}
            </View>
          )}
        </View>

        {/* Content */}
        <View
          style={{
            paddingLeft: Math.max(insets.left, 24),
            paddingRight: Math.max(insets.right, 24),
            paddingTop: 24,
          }}
        >
          {/* Product Name & Price */}
          <View style={{ marginBottom: 16 }}>
            <Text className="text-3xl font-bold text-white mb-2">
              {productData.name}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text className="text-white text-3xl font-bold">
                {productData.price}
              </Text>
              <View
                style={{
                  backgroundColor: '#2B2E36',
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                }}
              >
                <Text className="text-neutral-400 text-sm">
                  {productData.condition}
                </Text>
              </View>
            </View>
          </View>

          {/* AI Grade Quick Overview */}
          {productData.aiCertified && (
            <View
              style={{
                backgroundColor: '#2B2E36',
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <View
                style={{
                  backgroundColor: '#EC4899',
                  borderRadius: 8,
                  width: 48,
                  height: 48,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="sparkles" size={24} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1, justifyContent: 'space-between' }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 4,
                  }}
                >
                  <Text className="text-white text-base font-semibold">
                    AI Certified
                  </Text>
                  <View
                    style={{
                      backgroundColor: '#10B981',
                      borderRadius: 6,
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                    }}
                  >
                    <Text className="text-white text-xs font-bold">
                      Grade {productData.aiGrade}
                    </Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <View
                      style={{
                        width: 60,
                        height: 6,
                        backgroundColor: '#1F2937',
                        borderRadius: 3,
                        overflow: 'hidden',
                      }}
                    >
                      <View
                        style={{
                          width: `${productData.aiScore}%`,
                          height: '100%',
                          backgroundColor: '#10B981',
                        }}
                      />
                    </View>
                    <Text className="text-neutral-400 text-xs">
                      {productData.aiScore}/100
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Seller Info */}
          <Pressable
            onPress={() => router.push('/seller-profile')}
            style={{
              backgroundColor: '#2B2E36',
              borderRadius: 12,
              padding: 16,
              marginBottom: 24,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Ionicons name="person-circle" size={40} color="#9CA3AF" />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text className="text-white text-base font-semibold">
                  {productData.sellerName}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text className="text-neutral-400 text-sm">
                    {productData.sellerRating} • {productData.location}
                  </Text>
                </View>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </Pressable>

          {/* Private Chat Component - Only for Private Sales */}
          {productData.isPrivateSale && (
            <View style={{ marginBottom: 24 }}>
              <PrivateChat
                initialMessage={`Hi, I'm interested in your ${productData.name}`}
                onSend={(message) => {
                  console.log('Message sent:', message);
                  // Handle sending message
                }}
              />
            </View>
          )}

          {/* Description */}
          <View style={{ marginBottom: 24 }}>
            <Text className="text-white text-xl font-bold mb-3">
              Description
            </Text>
            <Text className="text-neutral-300 text-base leading-6">
              {productData.description}
            </Text>
          </View>

          {/* Specifications */}
          <View style={{ marginBottom: 24 }}>
            <Text className="text-white text-xl font-bold mb-3">
              Specifications
            </Text>
            <View
              style={{
                backgroundColor: '#2B2E36',
                borderRadius: 12,
                overflow: 'hidden',
              }}
            >
              {productData.specifications.map((spec, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingVertical: 16,
                    paddingHorizontal: 16,
                    borderBottomWidth:
                      index < productData.specifications.length - 1 ? 1 : 0,
                    borderBottomColor: '#1F2937',
                  }}
                >
                  <Text className="text-neutral-400 text-base">{spec.label}</Text>
                  <Text className="text-white text-base font-medium">
                    {spec.value}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Listing Info */}
          <View
            style={{
              backgroundColor: '#2B2E36',
              borderRadius: 12,
              padding: 16,
              marginBottom: 24,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="time-outline" size={16} color="#9CA3AF" />
                <Text className="text-neutral-400 text-sm">
                  Listed {productData.listedDate}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="location-outline" size={16} color="#9CA3AF" />
                <Text className="text-neutral-400 text-sm">
                  {productData.location}
                </Text>
              </View>
            </View>
          </View>

        </View>
      </ScrollView>

      {/* Action Buttons - Fixed to Bottom */}
      {!productData.isPrivateSale && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            paddingLeft: Math.max(insets.left, 24),
            paddingRight: Math.max(insets.right, 24),
            paddingBottom: insets.bottom + 16,
            paddingTop: 16,
            backgroundColor: '#0F0E11',
            flexDirection: 'row',
            gap: 12,
            borderTopWidth: 1,
            borderTopColor: '#1F2937',
          }}
        >
          {/* Add to Cart Button */}
          <Pressable
            onPress={handleAddToCart}
            style={{ flex: 1 }}
          >
            {({ pressed }) => (
              <LinearGradient
                colors={['#EC4899', '#F97316']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  borderRadius: 16,
                  height: 56,
                  width: '100%',
                  opacity: pressed ? 0.8 : 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text className="text-white text-lg font-bold">
                  Add to Cart
                </Text>
              </LinearGradient>
            )}
          </Pressable>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
