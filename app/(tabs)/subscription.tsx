import { useThemeColors } from '@/hooks/use-theme-colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useSubscription, SubscriptionPlan } from '@/contexts/subscription-context';
import SubscriptionPaywall from '@/app/subscription-paywall';

export default function SubscriptionScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const { subscription, upgradePlan, resetUsage, getUsagePercentage } = useSubscription();
  const [showPaywall, setShowPaywall] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const plans = [
    {
      id: 'basic' as SubscriptionPlan,
      name: 'Basic',
      price: '$4.99',
      period: '/month',
      aiBuilds: 10,
      aiUpgrades: 5,
      features: ['Ad-free experience', 'Advanced filters', 'Priority listings'],
    },
    {
      id: 'pro' as SubscriptionPlan,
      name: 'Pro',
      price: '$9.99',
      period: '/month',
      aiBuilds: 50,
      aiUpgrades: 25,
      features: ['Everything in Basic', 'Priority support', 'Unlimited wishlist', 'Early access features'],
      popular: true,
    },
    {
      id: 'premium' as SubscriptionPlan,
      name: 'Premium',
      price: '$19.99',
      period: '/month',
      aiBuilds: -1,
      aiUpgrades: -1,
      features: ['Everything in Pro', 'Unlimited AI builds', 'Unlimited AI upgrades', '1-on-1 support'],
    },
  ];

  const handleUpgrade = async (planId: SubscriptionPlan) => {
    setIsProcessing(true);
    setTimeout(async () => {
      await upgradePlan(planId);
      setIsProcessing(false);
    }, 2000);
  };

  const currentPlan = plans.find(p => p.id === subscription.plan);
  const buildsUsage = getUsagePercentage('new');
  const upgradesUsage = getUsagePercentage('upgrade');

  return (
    <View style={{ flex: 1, backgroundColor: colors.backgroundColor }}>
      <StatusBar style={colors.statusBarStyle} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 24,
          paddingBottom: Math.max(insets.bottom, 24),
          paddingLeft: Math.max(insets.left, 24),
          paddingRight: Math.max(insets.right, 24),
        }}
      >
        {/* Header */}
        <View style={{ marginBottom: 32 }}>
          <Pressable onPress={() => router.back()} style={{ marginBottom: 24, alignSelf: 'flex-start' }}>
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
              <Ionicons name="rocket" size={24} color="#EC4899" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textColor, fontSize: 28, fontWeight: 'bold', marginBottom: 4 }}>
                Subscription
              </Text>
              <Text style={{ color: colors.secondaryTextColor, fontSize: 14 }}>
                Manage your plan and usage
              </Text>
            </View>
          </View>
        </View>

        {/* Current Plan Card */}
        <View
          style={{
            backgroundColor: colors.cardBackground,
            borderRadius: 16,
            padding: 24,
            marginBottom: 24,
            borderWidth: 2,
            borderColor: '#EC4899',
            borderStyle: 'solid',
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <View>
              <Text style={{ color: colors.secondaryTextColor, fontSize: 14, marginBottom: 4 }}>
                Current Plan
              </Text>
              <Text style={{ color: colors.textColor, fontSize: 24, fontWeight: 'bold' }}>
                {currentPlan?.name || 'Free'}
              </Text>
            </View>
            <View
              style={{
                backgroundColor: '#EC4899' + '20',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 8,
              }}
            >
              <Text style={{ color: '#EC4899', fontSize: 14, fontWeight: '600' }}>
                {currentPlan?.price || 'Free'}
              </Text>
            </View>
          </View>

          {subscription.subscriptionEndDate && (
            <Text style={{ color: colors.secondaryTextColor, fontSize: 12 }}>
              Renews on {new Date(subscription.subscriptionEndDate).toLocaleDateString()}
            </Text>
          )}
        </View>

        {/* Usage Stats */}
        {subscription.plan !== 'premium' && (
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
            <Text style={{ color: colors.textColor, fontSize: 18, fontWeight: '600', marginBottom: 20 }}>
              Usage This Month
            </Text>

            {/* AI Builds Usage */}
            <View style={{ marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ color: colors.textColor, fontSize: 14, fontWeight: '600' }}>
                  AI Builds
                </Text>
                <Text style={{ color: colors.textColor, fontSize: 14 }}>
                  {subscription.usage.aiBuildsUsed} / {subscription.features.aiBuildsPerMonth}
                </Text>
              </View>
              <View
                style={{
                  height: 8,
                  backgroundColor: colors.iconBackground,
                  borderRadius: 4,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    height: '100%',
                    width: `${buildsUsage}%`,
                    backgroundColor: buildsUsage >= 80 ? '#EF4444' : buildsUsage >= 60 ? '#F59E0B' : '#10B981',
                    borderRadius: 4,
                  }}
                />
              </View>
            </View>

            {/* AI Upgrades Usage */}
            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ color: colors.textColor, fontSize: 14, fontWeight: '600' }}>
                  AI Upgrades
                </Text>
                <Text style={{ color: colors.textColor, fontSize: 14 }}>
                  {subscription.usage.aiUpgradesUsed} / {subscription.features.aiUpgradesPerMonth}
                </Text>
              </View>
              <View
                style={{
                  height: 8,
                  backgroundColor: colors.iconBackground,
                  borderRadius: 4,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    height: '100%',
                    width: `${upgradesUsage}%`,
                    backgroundColor: upgradesUsage >= 80 ? '#EF4444' : upgradesUsage >= 60 ? '#F59E0B' : '#10B981',
                    borderRadius: 4,
                  }}
                />
              </View>
            </View>
          </View>
        )}

        {/* Available Plans */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: colors.textColor, fontSize: 18, fontWeight: '600', marginBottom: 16 }}>
            Available Plans
          </Text>

          {plans
            .filter(plan => plan.id !== subscription.plan)
            .map((plan) => (
              <Pressable
                key={plan.id}
                onPress={() => {
                  if (plan.id === subscription.plan) return;
                  setShowPaywall(true);
                }}
                style={{ marginBottom: 12 }}
              >
                {({ pressed }) => (
                  <View
                    style={{
                      backgroundColor: colors.cardBackground,
                      borderRadius: 16,
                      padding: 20,
                      borderWidth: 1,
                      borderColor: colors.borderColor,
                      opacity: pressed ? 0.8 : 1,
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.textColor, fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>
                          {plan.name}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 8 }}>
                          <Text style={{ color: colors.textColor, fontSize: 24, fontWeight: 'bold' }}>
                            {plan.price}
                          </Text>
                          <Text style={{ color: colors.secondaryTextColor, fontSize: 14, marginLeft: 4 }}>
                            {plan.period}
                          </Text>
                        </View>
                        <View style={{ gap: 4 }}>
                          {plan.features.slice(0, 2).map((feature, idx) => (
                            <View key={idx} style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <Ionicons name="checkmark" size={14} color="#10B981" style={{ marginRight: 6 }} />
                              <Text style={{ color: colors.secondaryTextColor, fontSize: 12 }}>{feature}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                      <Ionicons name="chevron-forward" size={24} color={colors.secondaryTextColor} />
                    </View>
                  </View>
                )}
              </Pressable>
            ))}
        </View>

        {/* Cancel Subscription */}
        {subscription.plan !== 'free' && (
          <Pressable
            onPress={() => {
              // Handle cancellation
              upgradePlan('free');
            }}
            style={{
              backgroundColor: colors.cardBackground,
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: '#EF4444',
              marginBottom: 24,
            }}
          >
            <Text style={{ color: '#EF4444', fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
              Cancel Subscription
            </Text>
          </Pressable>
        )}
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

