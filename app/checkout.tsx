import { useThemeColors } from '@/hooks/use-theme-colors';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Dashed Line Component
function DashedLine({ color }: { color: string }) {
  const dashWidth = 6;
  const dashGap = 4;
  const lineLength = SCREEN_WIDTH - 48; // Account for padding
  const dashes = Math.floor(lineLength / (dashWidth + dashGap));

  return (
    <View style={{ flexDirection: 'row', marginVertical: 8, width: '100%' }}>
      {Array.from({ length: dashes }).map((_, i) => (
        <View
          key={i}
          style={{
            width: dashWidth,
            height: 1,
            backgroundColor: color,
            marginRight: dashGap,
          }}
        />
      ))}
    </View>
  );
}

// Mock order data (in real app, this would come from route params or cart state)
const orderData = {
  orderId: '#ORD-2024-001234',
  date: new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }),
  items: [
    {
      id: 1,
      name: 'NVIDIA GeForce RTX 4090',
      image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=300&fit=crop&q=80',
      price: 1599.00,
      quantity: 1,
      condition: 'A+ (Like New)',
    },
  ],
  subtotal: 1599.00,
  shipping: 25.00,
  tax: 129.92,
  total: 1753.92,
  shippingAddress: {
    name: 'John Doe',
    street: '123 Main Street',
    city: 'San Francisco',
    state: 'CA',
    zip: '94102',
  },
};

const paymentMethods = [
  { id: 'card', name: 'Credit/Debit Card', icon: 'card-outline', popular: true },
  { id: 'paypal', name: 'PayPal', icon: 'logo-paypal', popular: false },
  { id: 'apple', name: 'Apple Pay', icon: 'logo-apple', popular: false },
  { id: 'google', name: 'Google Pay', icon: 'logo-google', popular: false },
];

export default function CheckoutScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const [selectedPayment, setSelectedPayment] = useState('card');

  const handlePlaceOrder = () => {
    // In real app, process payment and create order
    router.push('/order-status');
  };

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
          flexDirection: 'row',
          alignItems: 'center',
          paddingLeft: Math.max(insets.left, 24),
          paddingRight: Math.max(insets.right, 24),
          paddingTop: 16,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.borderColor,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{ marginRight: 16 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textColor} />
        </Pressable>
        <Text style={{ color: colors.textColor, fontSize: 18, fontWeight: '600', flex: 1 }}>
          Checkout
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingLeft: Math.max(insets.left, 24),
          paddingRight: Math.max(insets.right, 24),
          paddingBottom: 24,
        }}
      >
        {/* Order Summary */}
        <View style={{ marginTop: 24, marginBottom: 24 }}>
          {/* Header */}
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <Text style={{ color: colors.textColor, fontSize: 20, fontWeight: 'bold', marginBottom: 4 }}>
              PartPulse
            </Text>
            <Text style={{ color: colors.secondaryTextColor, fontSize: 12 }}>
              Order Receipt
            </Text>
            <Text style={{ color: colors.secondaryTextColor, fontSize: 11, marginTop: 8 }}>
              Order #{orderData.orderId}
            </Text>
            <Text style={{ color: colors.secondaryTextColor, fontSize: 11 }}>
              {orderData.date}
            </Text>
          </View>

          {/* Items */}
          <View style={{ marginBottom: 20 }}>
            {orderData.items.map((item, index) => (
              <View key={item.id}>
                <View
                  style={{
                    flexDirection: 'row',
                    marginBottom: 16,
                    paddingBottom: 16,
                  }}
                >
                  <View
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 8,
                      overflow: 'hidden',
                      marginRight: 12,
                      backgroundColor: colors.iconBackground,
                    }}
                  >
                    <Image
                      source={{ uri: item.image }}
                      style={{ width: '100%', height: '100%' }}
                      contentFit="cover"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.textColor, fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
                      {item.name}
                    </Text>
                    <Text style={{ color: colors.secondaryTextColor, fontSize: 12, marginBottom: 4 }}>
                      Condition: {item.condition}
                    </Text>
                    <Text style={{ color: colors.secondaryTextColor, fontSize: 12, marginBottom: 8 }}>
                      Qty: {item.quantity}
                    </Text>
                    <Text style={{ color: colors.textColor, fontSize: 18, fontWeight: 'bold' }}>
                      ${item.price.toFixed(2)}
                    </Text>
                  </View>
                </View>
                {index < orderData.items.length - 1 && (
                  <DashedLine color={colors.borderColor} />
                )}
              </View>
            ))}
          </View>

          {/* Dashed Divider */}
          <DashedLine color={colors.borderColor} />

          {/* Price Breakdown */}
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.secondaryTextColor, fontSize: 14 }}>
                Subtotal
              </Text>
              <Text style={{ color: colors.textColor, fontSize: 14 }}>
                ${orderData.subtotal.toFixed(2)}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.secondaryTextColor, fontSize: 14 }}>
                Shipping
              </Text>
              <Text style={{ color: colors.textColor, fontSize: 14 }}>
                ${orderData.shipping.toFixed(2)}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.secondaryTextColor, fontSize: 14 }}>
                Tax
              </Text>
              <Text style={{ color: colors.textColor, fontSize: 14 }}>
                ${orderData.tax.toFixed(2)}
              </Text>
            </View>
            <DashedLine color={colors.borderColor} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.textColor, fontSize: 18, fontWeight: 'bold' }}>
                Total
              </Text>
              <Text style={{ color: colors.textColor, fontSize: 20, fontWeight: 'bold' }}>
                ${orderData.total.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Shipping Address */}
          <View
            style={{
              marginTop: 24,
              paddingTop: 20,
            }}
          >
            <DashedLine color={colors.borderColor} />
            <Text style={{ color: colors.textColor, fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
              Shipping To:
            </Text>
            <Text style={{ color: colors.secondaryTextColor, fontSize: 14, lineHeight: 20 }}>
              {orderData.shippingAddress.name}
              {'\n'}
              {orderData.shippingAddress.street}
              {'\n'}
              {orderData.shippingAddress.city}, {orderData.shippingAddress.state} {orderData.shippingAddress.zip}
            </Text>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: colors.textColor, fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
            Payment Method
          </Text>
          <View style={{ gap: 12 }}>
            {paymentMethods.map((method) => (
              <Pressable
                key={method.id}
                onPress={() => setSelectedPayment(method.id)}
                style={{ marginBottom: method.id !== paymentMethods[paymentMethods.length - 1].id ? 0 : 0 }}
              >
                {({ pressed }) => (
                  <View
                    style={{
                      backgroundColor: colors.cardBackground,
                      borderRadius: 16,
                      padding: 20,
                      borderWidth: 2,
                      borderColor: selectedPayment === method.id ? '#EC4899' : 'transparent',
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
                        <Text style={{ 
                          color: colors.textColor, 
                          fontSize: 18, 
                          fontWeight: 'bold',
                          marginBottom: 4,
                        }}>
                          {method.name}
                        </Text>
                        {method.popular && (
                          <Text style={{ 
                            color: colors.secondaryTextColor, 
                            fontSize: 14,
                            marginBottom: 8,
                          }}>
                            Most popular payment method
                          </Text>
                        )}
                        {!method.popular && method.id === 'paypal' && (
                          <Text style={{ 
                            color: colors.secondaryTextColor, 
                            fontSize: 14,
                            marginBottom: 8,
                          }}>
                            Pay securely with PayPal
                          </Text>
                        )}
                        {!method.popular && method.id === 'apple' && (
                          <Text style={{ 
                            color: colors.secondaryTextColor, 
                            fontSize: 14,
                            marginBottom: 8,
                          }}>
                            Quick and secure Apple Pay
                          </Text>
                        )}
                        {!method.popular && method.id === 'google' && (
                          <Text style={{ 
                            color: colors.secondaryTextColor, 
                            fontSize: 14,
                            marginBottom: 8,
                          }}>
                            Fast checkout with Google Pay
                          </Text>
                        )}
                      </View>
                      <View
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          borderWidth: 2,
                          borderColor: selectedPayment === method.id ? '#EC4899' : colors.secondaryTextColor,
                          backgroundColor: selectedPayment === method.id ? '#EC4899' : 'transparent',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        {selectedPayment === method.id && (
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
                      <Ionicons name={method.icon as any} size={16} color={colors.secondaryTextColor} />
                      <Text style={{ color: colors.secondaryTextColor, fontSize: 12 }}>
                        {method.id === 'card' && 'Secure card payment • Accepted worldwide'}
                        {method.id === 'paypal' && 'Pay with your PayPal account'}
                        {method.id === 'apple' && 'Touch ID or Face ID authentication'}
                        {method.id === 'google' && 'One-tap payment with Google'}
                      </Text>
                    </View>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Place Order Button */}
        <Pressable
          onPress={handlePlaceOrder}
          style={{ marginBottom: 24 }}
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
              <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' }}>
                Place Order - ${orderData.total.toFixed(2)}
              </Text>
            </LinearGradient>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}
