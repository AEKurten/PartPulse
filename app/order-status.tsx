import { useThemeColors } from '@/hooks/use-theme-colors';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import { Modal, PanResponder, Pressable, ScrollView, Text, View, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing } from 'react-native-reanimated';
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

// Mock order data (in real app, this would come from route params or API)
const orderData = {
  orderId: '#ORD-2024-001234',
  date: new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }),
  status: 'Processing',
  estimatedDelivery: 'December 28, 2024',
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
  paymentMethod: 'Credit/Debit Card',
  paymentLast4: '4242',
  shippingAddress: {
    name: 'John Doe',
    street: '123 Main Street',
    city: 'San Francisco',
    state: 'CA',
    zip: '94102',
  },
};

// Tracking steps data
const trackingSteps = [
  { id: 1, status: 'Order Placed', completed: true, date: 'Dec 24, 2024 10:30 AM', icon: 'checkmark-circle' },
  { id: 2, status: 'Packed', completed: true, date: 'Dec 24, 2024 2:15 PM', icon: 'cube' },
  { id: 3, status: 'Shipped', completed: true, date: 'Dec 25, 2024 9:00 AM', icon: 'car' },
  { id: 4, status: 'Out for Delivery', completed: true, date: 'Dec 28, 2024 8:00 AM', icon: 'bicycle' },
  { id: 5, status: 'Delivered', completed: false, date: 'Expected: Dec 28, 2024', icon: 'home' },
];

export default function OrderStatusScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const [showTrackingSheet, setShowTrackingSheet] = useState(false);
  const trackingTranslateY = useRef(new Animated.Value(0)).current;

  // Animation values for drone
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Floating up and down animation - smooth continuous loop
    translateY.value = withRepeat(
      withTiming(15, {
        duration: 2000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true // reverse the animation to create smooth up/down motion
    );

    // Rotation left and right animation - smooth continuous loop
    rotation.value = withRepeat(
      withTiming(8, {
        duration: 3000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true // reverse the animation to create smooth left/right motion
    );
  }, []);

  // Animated style for drone
  const droneAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value },
        { rotate: `${rotation.value}deg` },
      ],
    };
  });

  useEffect(() => {
    if (showTrackingSheet) {
      trackingTranslateY.setValue(0);
    }
  }, [showTrackingSheet]);

  // Pan responder for swipe down to dismiss tracking sheet
  const trackingPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 0 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          trackingTranslateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 150) {
          Animated.timing(trackingTranslateY, {
            toValue: 500,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            trackingTranslateY.setValue(0);
            setShowTrackingSheet(false);
          });
        } else {
          Animated.spring(trackingTranslateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const handleTrackOrder = () => {
    setShowTrackingSheet(true);
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
          Order Status
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
        {/* Success Message with Drone Image */}
        <View style={{ alignItems: 'center', marginTop: 24, marginBottom: 32 }}>
          <Animated.View style={droneAnimatedStyle}>
            <Image
              source={require('@/assets/images/flyingDroneDelivery.png')}
              style={{
                width: 200,
                height: 200,
              }}
              contentFit="contain"
            />
          </Animated.View>
          <Text style={{ color: colors.textColor, fontSize: 24, fontWeight: 'bold', marginTop: 16, marginBottom: 8 }}>
            Order Confirmed!
          </Text>
          <Text style={{ color: colors.secondaryTextColor, fontSize: 16, textAlign: 'center' }}>
            Your order is being processed and will be delivered soon
          </Text>
        </View>

        {/* Order Summary Receipt */}
        <View style={{ marginBottom: 24 }}>
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
            <View
              style={{
                marginTop: 12,
                backgroundColor: '#10B981' + '20',
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 6,
              }}
            >
              <Text style={{ color: '#10B981', fontSize: 12, fontWeight: '600' }}>
                Status: {orderData.status}
              </Text>
            </View>
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

          {/* Payment Summary */}
          <View
            style={{
              marginTop: 24,
              paddingTop: 20,
            }}
          >
            <DashedLine color={colors.borderColor} />
            <Text style={{ color: colors.textColor, fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
              Payment Method:
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Ionicons name="card-outline" size={16} color={colors.secondaryTextColor} />
              <Text style={{ color: colors.secondaryTextColor, fontSize: 14, marginLeft: 8 }}>
                {orderData.paymentMethod} •••• {orderData.paymentLast4}
              </Text>
            </View>
            <Text style={{ color: colors.secondaryTextColor, fontSize: 12, marginLeft: 24 }}>
              Paid on {orderData.date}
            </Text>
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
            <View
              style={{
                marginTop: 12,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Ionicons name="time-outline" size={16} color={colors.secondaryTextColor} />
              <Text style={{ color: colors.secondaryTextColor, fontSize: 12 }}>
                Estimated delivery: {orderData.estimatedDelivery}
              </Text>
            </View>
          </View>
        </View>

        {/* Track Order Button */}
        <Pressable
          onPress={handleTrackOrder}
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
                Track Your Order
              </Text>
            </LinearGradient>
          )}
        </Pressable>
      </ScrollView>

      {/* Tracking Bottom Sheet */}
      <Modal
        visible={showTrackingSheet}
        transparent
        animationType="fade"
        onRequestClose={() => {
          trackingTranslateY.setValue(0);
          setShowTrackingSheet(false);
        }}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: colors.backgroundColor + 'CC',
            justifyContent: 'flex-end',
          }}
          onPress={() => {
            trackingTranslateY.setValue(0);
            setShowTrackingSheet(false);
          }}
        >
          <Animated.View
            style={{
              backgroundColor: colors.cardBackground,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingTop: 12,
              paddingBottom: Math.max(insets.bottom, 24),
              paddingHorizontal: Math.max(insets.left, 24),
              paddingRight: Math.max(insets.right, 24),
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 20,
              transform: [{ translateY: trackingTranslateY }],
              maxHeight: '80%',
            }}
            {...trackingPanResponder.panHandlers}
          >
            {/* Handle Bar */}
            <View
              style={{
                width: 40,
                height: 4,
                backgroundColor: colors.secondaryTextColor,
                borderRadius: 2,
                alignSelf: 'center',
                marginBottom: 20,
                opacity: 0.5,
              }}
            />

            {/* Header */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ color: colors.textColor, fontSize: 24, fontWeight: 'bold', marginBottom: 4 }}>
                Track Your Order
              </Text>
              <Text style={{ color: colors.secondaryTextColor, fontSize: 14 }}>
                Order #{orderData.orderId}
              </Text>
            </View>

            {/* Tracking Steps */}
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ gap: 20 }}>
                {trackingSteps.map((step, index) => {
                  const isLast = index === trackingSteps.length - 1;
                  const isActive = step.completed || (!step.completed && index === trackingSteps.findIndex(s => !s.completed));

                  return (
                    <View key={step.id} style={{ flexDirection: 'row' }}>
                      {/* Timeline Line & Icon */}
                      <View style={{ alignItems: 'center', marginRight: 16 }}>
                        <View
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: step.completed ? '#10B981' : isActive ? '#EC4899' : colors.iconBackground,
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderWidth: step.completed ? 0 : 2,
                            borderColor: isActive ? '#EC4899' : colors.borderColor,
                          }}
                        >
                          {step.completed ? (
                            <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                          ) : (
                            <Ionicons name={step.icon as any} size={20} color={isActive ? '#EC4899' : colors.secondaryTextColor} />
                          )}
                        </View>
                        {!isLast && (
                          <View
                            style={{
                              width: 2,
                              flex: 1,
                              minHeight: 60,
                              backgroundColor: step.completed ? '#10B981' : colors.borderColor,
                              marginTop: 8,
                            }}
                          />
                        )}
                      </View>

                      {/* Step Details */}
                      <View style={{ flex: 1, paddingTop: 2 }}>
                        <Text style={{ 
                          color: step.completed ? colors.textColor : isActive ? colors.textColor : colors.secondaryTextColor,
                          fontSize: 16,
                          fontWeight: step.completed || isActive ? '600' : '400',
                          marginBottom: 4,
                        }}>
                          {step.status}
                        </Text>
                        <Text style={{ 
                          color: colors.secondaryTextColor,
                          fontSize: 12,
                          marginBottom: 8,
                        }}>
                          {step.date}
                        </Text>
                        {step.completed && (
                          <View
                            style={{
                              alignSelf: 'flex-start',
                              backgroundColor: '#10B981' + '20',
                              borderRadius: 6,
                              paddingHorizontal: 8,
                              paddingVertical: 4,
                            }}
                          >
                            <Text style={{ color: '#10B981', fontSize: 11, fontWeight: '600' }}>
                              Completed
                            </Text>
                          </View>
                        )}
                        {!step.completed && isActive && (
                          <View
                            style={{
                              alignSelf: 'flex-start',
                              backgroundColor: '#EC4899' + '20',
                              borderRadius: 6,
                              paddingHorizontal: 8,
                              paddingVertical: 4,
                            }}
                          >
                            <Text style={{ color: '#EC4899', fontSize: 11, fontWeight: '600' }}>
                              In Progress
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
}
