import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { StatusBar } from 'expo-status-bar';

// Mock listing data (in real app, this would come from previous steps)
const listingData = {
  itemName: 'NVIDIA GeForce RTX 4090',
  category: 'GPU',
  condition: 'A+ (Like New)',
  description: 'Excellent condition RTX 4090, barely used. Original packaging included. All components functioning properly.',
  price: '$1,549',
  photos: 3,
  aiGrade: 'A+',
  aiScore: 92,
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
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const [listingType, setListingType] = useState<ListingType>('marketplace');

  const handlePublish = () => {
    // Publish listing
    router.push('/sell/step5');
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
                  {listingData.itemName}
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
                      {listingData.category}
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
                      {listingData.condition}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Description */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ color: colors.secondaryTextColor, fontSize: 14, marginBottom: 8 }}>Description</Text>
                <Text style={{ color: colors.textColor, fontSize: 16, lineHeight: 24 }}>
                  {listingData.description}
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
                    {listingData.price}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.secondaryTextColor, fontSize: 14, marginBottom: 8 }}>Photos</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name="images-outline" size={20} color={colors.secondaryTextColor} />
                    <Text style={{ color: colors.textColor, fontSize: 18, fontWeight: '600' }}>
                      {listingData.photos}
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
                    Grade {listingData.aiGrade} • Score {listingData.aiScore}
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
