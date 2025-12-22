import { PrivateChat } from '@/components/private-chat';
import { ProductDetailSkeleton } from '@/components/product-detail-skeleton';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { getProduct } from '@/lib/database';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Alert, Dimensions, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from './stores/useAuthStore';
import type { Product } from '@/lib/database.types';
import type { Profile } from '@/lib/database.types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function BuyItemScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const params = useLocalSearchParams();
  const productId = params.productId as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [seller, setSeller] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [hasAlert, setHasAlert] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  // Fetch product and seller data
  useEffect(() => {
    const fetchProductData = async () => {
      if (!productId) {
        Alert.alert('Error', 'Product ID is missing');
        router.back();
        return;
      }

      try {
        setLoading(true);
        
        // Fetch product
        const productData = await getProduct(productId);
        if (!productData) {
          Alert.alert('Error', 'Product not found');
          router.back();
          return;
        }
        setProduct(productData);

        // Fetch seller profile
        const { data: sellerData, error: sellerError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', productData.seller_id)
          .single();

        if (sellerError) {
          console.error('Error fetching seller:', sellerError);
        } else {
          setSeller(sellerData);
        }

        // Check if product is in wishlist and has alert, and if user is owner
        const userId = useAuthStore.getState().user?.id;
        if (userId) {
          setIsOwner(productData.seller_id === userId);
          
          const [wishlistResult, alertResult] = await Promise.all([
            supabase
              .from('wishlist')
              .select('id')
              .eq('user_id', userId)
              .eq('product_id', productId)
              .single(),
            supabase
              .from('product_alerts')
              .select('id')
              .eq('user_id', userId)
              .eq('product_id', productId)
              .single()
          ]);
          
          setIsWishlisted(!!wishlistResult.data);
          setHasAlert(!!alertResult.data);
        }
      } catch (error) {
        console.error('Error fetching product data:', error);
        Alert.alert('Error', 'Failed to load product details');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [productId]);

  const handleWishlistPress = async () => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) {
      Alert.alert('Login Required', 'Please log in to add items to your wishlist');
      return;
    }

    const shouldBeWishlisted = !isWishlisted;

    try {
      if (shouldBeWishlisted) {
        // Add to wishlist
        const { error } = await supabase
          .from('wishlist')
          .insert({
            user_id: userId,
            product_id: productId,
          });

        if (error) {
          if (error.code === '23505') {
            // Duplicate entry - already in wishlist, update state anyway
            setIsWishlisted(true);
          } else {
            console.error('Error adding to wishlist:', error);
            Alert.alert('Error', `Failed to add to wishlist: ${error.message}`);
            return;
          }
        } else {
          setIsWishlisted(true);
        }
      } else {
        // Remove from wishlist
        const { error } = await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', userId)
          .eq('product_id', productId);

        if (error) {
          console.error('Error removing from wishlist:', error);
          Alert.alert('Error', `Failed to remove from wishlist: ${error.message}`);
          return;
        }
        setIsWishlisted(false);
      }
    } catch (error: any) {
      console.error('Error updating wishlist:', error);
      Alert.alert('Error', `Failed to update wishlist: ${error?.message || 'Unknown error'}`);
    }
  };

  const handleAlertPress = async () => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) {
      Alert.alert('Login Required', 'Please log in to set alerts for products');
      return;
    }

    const shouldHaveAlert = !hasAlert;

    try {
      if (shouldHaveAlert) {
        // Add alert
        const { error } = await supabase
          .from('product_alerts')
          .insert({
            user_id: userId,
            product_id: productId,
            alert_price: null, // Can be extended to allow custom price alerts
          });

        if (error) {
          if (error.code === '23505') {
            // Duplicate entry - already has alert, update state anyway
            setHasAlert(true);
          } else {
            console.error('Error adding alert:', error);
            Alert.alert('Error', `Failed to add alert: ${error.message}`);
            return;
          }
        } else {
          setHasAlert(true);
          Alert.alert('Alert Set', 'You will be notified of price drops and updates for this product');
        }
      } else {
        // Remove alert
        const { error } = await supabase
          .from('product_alerts')
          .delete()
          .eq('user_id', userId)
          .eq('product_id', productId);

        if (error) {
          console.error('Error removing alert:', error);
          Alert.alert('Error', `Failed to remove alert: ${error.message}`);
          return;
        }
        setHasAlert(false);
      }
    } catch (error: any) {
      console.error('Error updating alert:', error);
      Alert.alert('Error', `Failed to update alert: ${error?.message || 'Unknown error'}`);
    }
  };

  const handleContactSeller = () => {
    // Navigate to chat with seller
    router.push({
      pathname: '/chat',
      params: { 
        sellerId: product.seller_id,
        productId: product.id 
      }
    });
  };

  const handleBuyNow = () => {
    // For instant listings, go directly to checkout
    if (!product) return;
    router.push({
      pathname: '/checkout',
      params: { 
        productId: product.id,
        listingType: 'instant'
      }
    });
  };

  // Format price
  const formatPrice = (price: number) => {
    return `R ${price.toFixed(2)}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  // Build specifications from product data
  const getSpecifications = () => {
    if (!product) return [];
    const specs = [];
    if (product.brand) specs.push({ label: 'Brand', value: product.brand });
    if (product.model) specs.push({ label: 'Model', value: product.model });
    if (product.category) specs.push({ label: 'Category', value: product.category });
    specs.push({ label: 'Condition', value: product.condition });
    return specs;
  };

  // Show skeleton loading state
  if (loading || !product) {
    return <ProductDetailSkeleton />;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colors.backgroundColor }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <StatusBar style={colors.statusBarStyle} />
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
            backgroundColor: colors.cardBackground + 'CC',
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
              backgroundColor: colors.cardBackground + 'CC',
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
              color={hasAlert ? '#EC4899' : colors.textColor}
            />
          </Pressable>

          {/* Wishlist Button */}
          <Pressable
            onPress={handleWishlistPress}
            style={{
              backgroundColor: colors.cardBackground + 'CC',
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
              color={isWishlisted ? '#EC4899' : colors.textColor}
            />
          </Pressable>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: product.listing_type === 'instant' ? 100 : 120 }}
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
            {product.images && product.images.length > 0 ? (
              product.images.map((image, index) => (
                <Image
                  key={index}
                  source={{ uri: image }}
                  style={{
                    width: SCREEN_WIDTH,
                    height: SCREEN_WIDTH,
                  }}
                  contentFit="cover"
                />
              ))
            ) : (
              <View style={{
                width: SCREEN_WIDTH,
                height: SCREEN_WIDTH,
                backgroundColor: colors.iconBackground,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <Ionicons name="image-outline" size={64} color={colors.secondaryTextColor} />
              </View>
            )}
          </ScrollView>

          {/* Image Indicators */}
          {product.images && product.images.length > 1 && (
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
              {product.images.map((_, index) => (
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
              <Text style={{ color: colors.textColor, fontSize: 30, fontWeight: 'bold', flex: 1 }}>
                {product.name}
              </Text>
              {/* Listing Type Badge */}
              {product.listing_type && (
                <View
                  style={{
                    backgroundColor: product.listing_type === 'instant' ? '#10B98120' : '#EC489920',
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderWidth: 1,
                    borderColor: product.listing_type === 'instant' ? '#10B981' : '#EC4899',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Ionicons 
                    name={product.listing_type === 'instant' ? 'flash' : 'storefront'} 
                    size={14} 
                    color={product.listing_type === 'instant' ? '#10B981' : '#EC4899'} 
                  />
                  <Text 
                    style={{ 
                      color: product.listing_type === 'instant' ? '#10B981' : '#EC4899', 
                      fontSize: 12, 
                      fontWeight: '600' 
                    }}
                  >
                    {product.listing_type === 'instant' ? 'Instant Sale' : 'Marketplace'}
                  </Text>
                </View>
              )}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text style={{ color: colors.textColor, fontSize: 30, fontWeight: 'bold' }}>
                {formatPrice(product.price)}
              </Text>
              <View
                style={{
                  backgroundColor: colors.cardBackground,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                }}
              >
                <Text style={{ color: colors.secondaryTextColor, fontSize: 14 }}>
                  {product.condition}
                </Text>
              </View>
            </View>
          </View>

          {/* AI Grade Quick Overview - Placeholder for future AI features */}
          {false && (
            <View
              style={{
                backgroundColor: colors.cardBackground,
                borderRadius: 16,
                padding: 16,
                marginBottom: 16,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                borderWidth: 1,
                borderColor: colors.borderColor,
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
                  <Text style={{ color: colors.textColor, fontSize: 16, fontWeight: '600' }}>
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
                    <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' }}>
                      Grade A+
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
                          width: '92%',
                          height: '100%',
                          backgroundColor: '#10B981',
                        }}
                      />
                    </View>
                    <Text style={{ color: colors.secondaryTextColor, fontSize: 12 }}>
                      92/100
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Seller Info */}
          <Pressable
            onPress={() => router.push({
              pathname: '/seller-profile',
              params: { sellerId: product.seller_id }
            })}
            style={{
              backgroundColor: colors.cardBackground,
              borderRadius: 16,
              padding: 16,
              marginBottom: 24,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderWidth: 1,
              borderColor: colors.borderColor,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              {seller?.avatar_url ? (
                <Image
                  source={{ uri: seller.avatar_url }}
                  style={{ width: 40, height: 40, borderRadius: 20 }}
                  contentFit="cover"
                />
              ) : (
                <Ionicons name="person-circle" size={40} color={colors.secondaryTextColor} />
              )}
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={{ color: colors.textColor, fontSize: 16, fontWeight: '600' }}>
                  {seller?.username || seller?.full_name || 'Unknown Seller'}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text style={{ color: colors.secondaryTextColor, fontSize: 14 }}>
                    4.8 {/* TODO: Calculate from reviews */}
                  </Text>
                </View>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.secondaryTextColor} />
          </Pressable>

          {/* Chat Component - Only for Marketplace Listings */}
          {product.listing_type === 'marketplace' && (
            <View style={{ marginBottom: 24 }}>
              <PrivateChat
                initialMessage={`Hi, I'm interested in your ${product.name}`}
                onSend={(message) => {
                  console.log('Message sent:', message);
                  // Handle sending message - create chat with seller
                }}
              />
            </View>
          )}

          {/* Description */}
          {product.description && (
            <View style={{ marginBottom: 24 }}>
              <Text style={{ color: colors.textColor, fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>
                Description
              </Text>
              <Text style={{ color: colors.secondaryTextColor, fontSize: 16, lineHeight: 24 }}>
                {product.description}
              </Text>
            </View>
          )}

          {/* Specifications */}
          {getSpecifications().length > 0 && (
            <View style={{ marginBottom: 24 }}>
              <Text style={{ color: colors.textColor, fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>
                Specifications
              </Text>
              <View
                style={{
                  backgroundColor: colors.cardBackground,
                  borderRadius: 16,
                  overflow: 'hidden',
                  borderWidth: 1,
                  borderColor: colors.borderColor,
                }}
              >
                {getSpecifications().map((spec, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingVertical: 16,
                    paddingHorizontal: 16,
                    borderBottomWidth:
                      index < getSpecifications().length - 1 ? 1 : 0,
                    borderBottomColor: colors.borderColor,
                  }}
                >
                  <Text style={{ color: colors.secondaryTextColor, fontSize: 16 }}>{spec.label}</Text>
                  <Text style={{ color: colors.textColor, fontSize: 16, fontWeight: '500' }}>
                    {spec.value}
                  </Text>
                </View>
              ))}
              </View>
            </View>
          )}

          {/* Listing Info */}
          <View
            style={{
              backgroundColor: colors.cardBackground,
              borderRadius: 16,
              padding: 16,
              marginBottom: 24,
              borderWidth: 1,
              borderColor: colors.borderColor,
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
                <Ionicons name="time-outline" size={16} color={colors.secondaryTextColor} />
                <Text style={{ color: colors.secondaryTextColor, fontSize: 14 }}>
                  Listed {formatDate(product.created_at)}
                </Text>
              </View>
            </View>
          </View>

        </View>
      </ScrollView>

      {/* Action Buttons - Fixed to Bottom */}
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
          backgroundColor: colors.backgroundColor,
          flexDirection: 'row',
          gap: 12,
          borderTopWidth: 1,
          borderTopColor: colors.borderColor,
        }}
      >
        {isOwner ? (
          /* Edit Listing Button - For Product Owner */
          <Pressable
            onPress={() => router.push({
              pathname: '/edit-listing',
              params: { productId }
            })}
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
                  flexDirection: 'row',
                  gap: 8,
                }}
              >
                <Ionicons name="create-outline" size={20} color="#FFFFFF" />
                <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' }}>
                  Edit Listing
                </Text>
              </LinearGradient>
            )}
          </Pressable>
        ) : product.listing_type === 'instant' ? (
          /* Instant Buy Button - For Platform Sales */
          <Pressable
            onPress={handleBuyNow}
            style={{ flex: 1 }}
          >
            {({ pressed }) => (
              <LinearGradient
                colors={['#10B981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  borderRadius: 16,
                  height: 56,
                  width: '100%',
                  opacity: pressed ? 0.8 : 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'row',
                  gap: 8,
                }}
              >
                <Ionicons name="flash" size={20} color="#FFFFFF" />
                <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' }}>
                  Buy Now
                </Text>
              </LinearGradient>
            )}
          </Pressable>
        ) : (
          /* Marketplace Button - Contact Seller Only */
          <Pressable
            onPress={handleContactSeller}
            style={{ flex: 1 }}
          >
            {({ pressed }) => (
              <View
                style={{
                  borderRadius: 16,
                  height: 56,
                  width: '100%',
                  opacity: pressed ? 0.8 : 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: colors.cardBackground,
                  borderWidth: 1,
                  borderColor: colors.borderColor,
                  flexDirection: 'row',
                  gap: 8,
                }}
              >
                <Ionicons name="chatbubble-outline" size={20} color={colors.textColor} />
                <Text style={{ color: colors.textColor, fontSize: 16, fontWeight: '600' }}>
                  Contact Seller
                </Text>
              </View>
            )}
          </Pressable>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
