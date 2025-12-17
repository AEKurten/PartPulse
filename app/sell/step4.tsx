import { useThemeColors } from '@/hooks/use-theme-colors';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSearchParams } from 'expo-router/build/hooks';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type listingData = {
  name: string;
  category: string;
  condition: string;
  description: string;
  price: string;
  photos: number;
  aiGrade: string;
  aiScore: number;
};


// Mock market data
const marketData = {
  currentMarketPrice: '$1,599',
  trend: 'up', // 'up' or 'down'
  changePercent: 3.2,
  averagePrice: '$1,520',
};

type ListingType = 'marketplace' | 'instant';

export default function SellStep4Screen() {
  const params = useSearchParams();
  const productId = params.get('productId');
  const [listingData, setListingData] = useState<listingData>();

  const [isLoading, setIsLoading] = useState(false);

  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const [listingType, setListingType] = useState<ListingType>('marketplace');

  useEffect(() => {
    const getListingData = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) {
        console.error('Error fetching listing data:', error);
        return;
      }

      const photosCount = data.images ? data.images.length : 0;
      const dataFormatted: listingData = {
        name: data.name,
        category: data.category,
        condition: data.condition,
        description: data.description,
        price: `R ${data.price.toFixed(2)}`,
        photos: photosCount,
        aiGrade: "A+", // hardcoded value for temp
        aiScore: 95,// hardcoded value for temp
      }
      setListingData(dataFormatted)
    };

    getListingData();
  }, [productId]);

  const handlePublish = async () => {
    setIsLoading(true);

    if (!productId) {
      console.error('Product ID not found in route parameters');
      return;
    }

    try {
      const { error } = await supabase.from('products')
        .update({
          Listing_Type: listingType,
          status: "active",
        })
        .eq('id', productId);

      if (error) throw error;

      router.push('/sell/step5');


    } catch (error) {
      console.error('Error updating listing type:', error);
    }
    finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: colors.backgroundColor }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
    >
      <StatusBar style={colors.statusBarStyle} />
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 140 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View
            style={{
              paddingTop: insets.top + 24,
              paddingBottom: 32,
              paddingLeft: Math.max(insets.left, 24),
              paddingRight: Math.max(insets.right, 24),
            }}
          >
            {/* Header */}
            <View style={{ marginBottom: 32 }}>
              <Pressable
                onPress={() => router.back()}
                style={{ marginBottom: 24, alignSelf: 'flex-start' }}
              >
                <Ionicons name="arrow-back" size={24} color={colors.textColor} />
              </Pressable>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
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
                  <Ionicons name="checkmark-circle" size={24} color="#EC4899" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.textColor, fontSize: 28, fontWeight: 'bold', marginBottom: 4 }}>
                    Review & Publish
                  </Text>
                  <Text style={{ color: colors.secondaryTextColor, fontSize: 14 }}>
                    Review your listing details before publishing
                  </Text>
                </View>
              </View>
            </View>

            {/* Market Price Trend */}
            <View
              style={{
                backgroundColor: colors.cardBackground,
                borderRadius: 16,
                padding: 20,
                marginBottom: 24,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.borderColor,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.secondaryTextColor, fontSize: 14, marginBottom: 4 }}>
                  Current Market Price
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ color: colors.textColor, fontSize: 24, fontWeight: 'bold' }}>
                    {marketData.currentMarketPrice}
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 8,
                      backgroundColor:
                        marketData.trend === 'up' ? '#10B98120' : '#EF444420',
                    }}
                  >
                    <Ionicons
                      name={marketData.trend === 'up' ? 'trending-up' : 'trending-down'}
                      size={16}
                      color={marketData.trend === 'up' ? '#10B981' : '#EF4444'}
                    />
                    <Text
                      style={{
                        color: marketData.trend === 'up' ? '#10B981' : '#EF4444',
                        fontSize: 12,
                        fontWeight: '600',
                        marginLeft: 4,
                      }}
                    >
                      {marketData.changePercent}%
                    </Text>
                  </View>
                </View>
                <Text style={{ color: colors.secondaryTextColor, fontSize: 12, marginTop: 8 }}>
                  Average: {marketData.averagePrice}
                </Text>
              </View>
            </View>

            {/* Listing Overview Card */}
            <View
              style={{
                backgroundColor: colors.cardBackground,
                borderRadius: 16,
                padding: 24,
                marginBottom: 24,
                borderWidth: 1,
                borderColor: colors.borderColor,
              }}
            >
              <Text style={{ color: colors.textColor, fontSize: 20, fontWeight: 'bold', marginBottom: 24 }}>
                Listing Overview
              </Text>

              {/* Item Name */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ color: colors.secondaryTextColor, fontSize: 14, marginBottom: 8 }}>Item Name</Text>
                <Text style={{ color: colors.textColor, fontSize: 18, fontWeight: '600' }}>
                  {listingData && listingData.name}
                </Text>
              </View>

              {/* Category & Condition */}
              <View
                style={{
                  flexDirection: 'row',
                  gap: 16,
                  marginBottom: 20,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.secondaryTextColor, fontSize: 14, marginBottom: 8 }}>Category</Text>
                  <View
                    style={{
                      backgroundColor: colors.iconBackground,
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      alignSelf: 'flex-start',
                    }}
                  >
                    <Text style={{ color: colors.textColor, fontSize: 14, fontWeight: '500' }}>
                      {listingData && listingData.category}
                    </Text>
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.secondaryTextColor, fontSize: 14, marginBottom: 8 }}>Condition</Text>
                  <View
                    style={{
                      backgroundColor: colors.iconBackground,
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      alignSelf: 'flex-start',
                    }}
                  >
                    <Text style={{ color: colors.textColor, fontSize: 14, fontWeight: '500' }}>
                      {listingData && listingData.condition}
                    </Text>
                  </View>
                </View>
              </View>
              {/* Description */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ color: colors.secondaryTextColor, fontSize: 14, marginBottom: 8 }}>Description</Text>
                <Text style={{ color: colors.textColor, fontSize: 16, lineHeight: 24 }}>
                  {listingData && listingData.description}
                </Text>
              </View>

              {/* Price & Photos */}
              <View
                style={{
                  flexDirection: 'row',
                  gap: 16,
                  marginBottom: 20,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.secondaryTextColor, fontSize: 14, marginBottom: 8 }}>Asking Price</Text>
                  <Text style={{ color: colors.textColor, fontSize: 20, fontWeight: 'bold' }}>
                    {listingData && listingData.price}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.secondaryTextColor, fontSize: 14, marginBottom: 8 }}>Photos</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name="images-outline" size={20} color={colors.secondaryTextColor} />
                    <Text style={{ color: colors.textColor, fontSize: 18, fontWeight: '600' }}>
                      {listingData && listingData.photos}
                    </Text>
                  </View>
                </View>
              </View>

              {/* AI Certification Badge */}
              <View
                style={{
                  backgroundColor: colors.iconBackground,
                  borderRadius: 12,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <Ionicons name="sparkles" size={24} color="#EC4899" />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.textColor, fontSize: 14, fontWeight: '600' }}>
                    AI Certified
                  </Text>
                  <Text style={{ color: colors.secondaryTextColor, fontSize: 12 }}>
                    Grade {listingData && listingData.aiGrade} • Score {listingData && listingData.aiScore}
                  </Text>
                </View>
              </View>
            </View>

            {/* Listing Type Selection */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ color: colors.textColor, fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
                Listing Type
              </Text>

              {/* Marketplace Option */}
              <Pressable
                onPress={() => setListingType('marketplace')}
                style={{ marginBottom: 12 }}
              >
                {({ pressed }) => (
                  <View
                    style={{
                      backgroundColor: colors.cardBackground,
                      borderRadius: 16,
                      padding: 20,
                      borderWidth: 2,
                      borderColor:
                        listingType === 'marketplace' ? '#EC4899' : colors.borderColor,
                      opacity: pressed ? 0.8 : 1,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: 12,
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.textColor, fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>
                          Marketplace Listing
                        </Text>
                        <Text style={{ color: colors.secondaryTextColor, fontSize: 14 }}>
                          List your item on the marketplace. Set your price and
                          negotiate with buyers.
                        </Text>
                      </View>
                      <View
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          borderWidth: 2,
                          borderColor:
                            listingType === 'marketplace' ? '#EC4899' : colors.secondaryTextColor,
                          backgroundColor:
                            listingType === 'marketplace' ? '#EC4899' : 'transparent',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        {listingType === 'marketplace' && (
                          <View
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: '#FFFFFF',
                            }}
                          />
                        )}
                      </View>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <Ionicons name="people-outline" size={16} color={colors.secondaryTextColor} />
                      <Text style={{ color: colors.secondaryTextColor, fontSize: 12 }}>
                        Reach thousands of buyers • You set the price
                      </Text>
                    </View>
                  </View>
                )}
              </Pressable>

              {/* Instant Sell Option */}
              <Pressable onPress={() => setListingType('instant')}>
                {({ pressed }) => (
                  <View
                    style={{
                      backgroundColor: colors.cardBackground,
                      borderRadius: 16,
                      padding: 20,
                      borderWidth: 2,
                      borderColor:
                        listingType === 'instant' ? '#EC4899' : colors.borderColor,
                      opacity: pressed ? 0.8 : 1,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: 12,
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.textColor, fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>
                          Sell to Platform
                        </Text>
                        <Text style={{ color: colors.secondaryTextColor, fontSize: 14 }}>
                          Sell directly to PartPulse. Get paid instantly at a
                          guaranteed price.
                        </Text>
                      </View>
                      <View
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          borderWidth: 2,
                          borderColor:
                            listingType === 'instant' ? '#EC4899' : colors.secondaryTextColor,
                          backgroundColor:
                            listingType === 'instant' ? '#EC4899' : 'transparent',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        {listingType === 'instant' && (
                          <View
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: '#FFFFFF',
                            }}
                          />
                        )}
                      </View>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <Ionicons name="flash-outline" size={16} color="#10B981" />
                      <Text style={{ color: colors.secondaryTextColor, fontSize: 12 }}>
                        Instant payment • Guaranteed price • No negotiations
                      </Text>
                    </View>
                  </View>
                )}
              </Pressable>
            </View>
          </View>
        </ScrollView>

        {/* Publish Button - Fixed to Bottom */}
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
            borderTopWidth: 1,
            borderTopColor: colors.borderColor,
          }}
        >
          <Pressable onPress={handlePublish} style={{ width: '100%' }}>
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
                <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' }}>
                  {listingType === 'instant' ? 'Sell' : 'Publish Listing'}
                </Text>
              </LinearGradient>
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
