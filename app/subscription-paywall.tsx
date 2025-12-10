import {
  SubscriptionPlan,
  useSubscription,
} from "@/contexts/subscription-context";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface PaywallProps {
  visible: boolean;
  onClose: () => void;
  onSubscribe?: () => void;
  buildMode?: "new" | "upgrade";
  trigger?: "limit-reached" | "first-use" | "upgrade-prompt";
}

export default function SubscriptionPaywall({
  visible,
  onClose,
  onSubscribe,
  buildMode = "new",
  trigger = "limit-reached",
}: PaywallProps) {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const { subscription, upgradePlan } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>("pro");
  const [isProcessing, setIsProcessing] = useState(false);

  const plans = [
    {
      id: "basic" as SubscriptionPlan,
      name: "Basic",
      price: "$4.99",
      period: "/month",
      aiBuilds: 10,
      aiUpgrades: 5,
      features: ["Ad-free experience", "Advanced filters", "Priority listings"],
      popular: false,
    },
    {
      id: "pro" as SubscriptionPlan,
      name: "Pro",
      price: "$9.99",
      period: "/month",
      aiBuilds: 50,
      aiUpgrades: 25,
      features: [
        "Everything in Basic",
        "Priority support",
        "Unlimited wishlist",
        "Early access features",
      ],
      popular: true,
    },
    {
      id: "premium" as SubscriptionPlan,
      name: "Premium",
      price: "$19.99",
      period: "/month",
      aiBuilds: -1, // Unlimited
      aiUpgrades: -1, // Unlimited
      features: [
        "Everything in Pro",
        "Unlimited AI builds",
        "Unlimited AI upgrades",
        "1-on-1 support",
      ],
      popular: false,
    },
  ];

  const handleSubscribe = async () => {
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(async () => {
      await upgradePlan(selectedPlan);
      setIsProcessing(false);
      onClose();
      onSubscribe?.();

      // Navigate back to AI tools if needed
      if (buildMode === "new" && trigger === "limit-reached") {
        router.push("/(tabs)/ai-tools");
      }
    }, 2000);
  };

  const getTriggerMessage = () => {
    switch (trigger) {
      case "first-use":
        return {
          title: "Unlock AI-Powered Build Planning",
          subtitle:
            "Get personalized PC build recommendations powered by advanced AI",
        };
      case "limit-reached":
        return {
          title: "You've Reached Your Free Limit",
          subtitle: `You've used all ${
            buildMode === "new"
              ? subscription.features.aiBuildsPerMonth
              : subscription.features.aiUpgradesPerMonth
          } free ${buildMode === "new" ? "builds" : "upgrades"} this month`,
        };
      default:
        return {
          title: "Upgrade to Premium",
          subtitle: "Unlock unlimited AI builds and remove ads",
        };
    }
  };

  const message = getTriggerMessage();

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <StatusBar style={colors.statusBarStyle} />
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "flex-end",
        }}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        <Animated.View
          entering={FadeInUp.duration(300)}
          style={{
            backgroundColor: colors.backgroundColor,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: "90%",
            paddingBottom: insets.bottom,
          }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingTop: 24,
              paddingBottom: 24,
            }}
          >
            {/* Close Button */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                marginBottom: 16,
              }}
            >
              <Pressable onPress={onClose}>
                <Ionicons name="close" size={24} color={colors.textColor} />
              </Pressable>
            </View>

            {/* Header */}
            <Animated.View
              entering={FadeInDown.delay(100)}
              style={{ marginBottom: 32 }}
            >
              <View style={{ alignItems: "center", marginBottom: 16 }}>
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: "#EC4899" + "20",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <Ionicons name="rocket" size={40} color="#EC4899" />
                </View>
                <Text
                  style={{
                    color: colors.textColor,
                    fontSize: 28,
                    fontWeight: "bold",
                    marginBottom: 8,
                    textAlign: "center",
                  }}
                >
                  {message.title}
                </Text>
                <Text
                  style={{
                    color: colors.secondaryTextColor,
                    fontSize: 16,
                    textAlign: "center",
                  }}
                >
                  {message.subtitle}
                </Text>
              </View>

              {/* Urgency Indicator */}
              {trigger === "limit-reached" && (
                <View
                  style={{
                    backgroundColor: "#EF4444" + "20",
                    borderRadius: 12,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: "#EF4444",
                    marginBottom: 16,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons
                      name="warning"
                      size={20}
                      color="#EF4444"
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={{
                        color: "#EF4444",
                        fontSize: 14,
                        fontWeight: "600",
                        flex: 1,
                      }}
                    >
                      Upgrade now to continue using AI features
                    </Text>
                  </View>
                </View>
              )}
            </Animated.View>

            {/* Benefits List */}
            <Animated.View
              entering={FadeInDown.delay(200)}
              style={{ marginBottom: 32 }}
            >
              <Text
                style={{
                  color: colors.textColor,
                  fontSize: 18,
                  fontWeight: "600",
                  marginBottom: 16,
                }}
              >
                What you get:
              </Text>
              {[
                "🎯 AI-powered build recommendations",
                "⚡ Lightning-fast processing",
                "🎮 FPS performance predictions",
                "💰 Smart price optimization",
                "📊 Market trend analysis",
                "🚫 Ad-free experience",
              ].map((benefit, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color="#10B981"
                    style={{ marginRight: 12 }}
                  />
                  <Text
                    style={{ color: colors.textColor, fontSize: 15, flex: 1 }}
                  >
                    {benefit}
                  </Text>
                </View>
              ))}
            </Animated.View>

            {/* Subscription Plans */}
            <Animated.View
              entering={FadeInDown.delay(300)}
              style={{ marginBottom: 32 }}
            >
              <Text
                style={{
                  color: colors.textColor,
                  fontSize: 18,
                  fontWeight: "600",
                  marginBottom: 16,
                }}
              >
                Choose your plan:
              </Text>

              {plans.map((plan, index) => (
                <Pressable
                  key={plan.id}
                  onPress={() => setSelectedPlan(plan.id)}
                  style={{ marginBottom: 12 }}
                >
                  {({ pressed }) => (
                    <View
                      style={{
                        backgroundColor:
                          selectedPlan === plan.id
                            ? "#EC4899" + "20"
                            : colors.cardBackground,
                        borderRadius: 16,
                        padding: 20,
                        borderWidth: selectedPlan === plan.id ? 2 : 1,
                        borderColor:
                          selectedPlan === plan.id
                            ? "#EC4899"
                            : colors.borderColor,
                        opacity: pressed ? 0.8 : 1,
                      }}
                    >
                      {plan.popular && (
                        <View
                          style={{
                            position: "absolute",
                            top: -10,
                            right: 20,
                            backgroundColor: "#EC4899",
                            borderRadius: 12,
                            paddingHorizontal: 12,
                            paddingVertical: 4,
                          }}
                        >
                          <Text
                            style={{
                              color: "#FFFFFF",
                              fontSize: 11,
                              fontWeight: "700",
                            }}
                          >
                            MOST POPULAR
                          </Text>
                        </View>
                      )}

                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: 12,
                        }}
                      >
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              color: colors.textColor,
                              fontSize: 20,
                              fontWeight: "bold",
                              marginBottom: 4,
                            }}
                          >
                            {plan.name}
                          </Text>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "baseline",
                            }}
                          >
                            <Text
                              style={{
                                color: colors.textColor,
                                fontSize: 28,
                                fontWeight: "bold",
                              }}
                            >
                              {plan.price}
                            </Text>
                            <Text
                              style={{
                                color: colors.secondaryTextColor,
                                fontSize: 14,
                                marginLeft: 4,
                              }}
                            >
                              {plan.period}
                            </Text>
                          </View>
                        </View>
                        <View
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 12,
                            borderWidth: 2,
                            borderColor:
                              selectedPlan === plan.id
                                ? "#EC4899"
                                : colors.borderColor,
                            backgroundColor:
                              selectedPlan === plan.id
                                ? "#EC4899"
                                : "transparent",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          {selectedPlan === plan.id && (
                            <Ionicons
                              name="checkmark"
                              size={16}
                              color="#FFFFFF"
                            />
                          )}
                        </View>
                      </View>

                      <View style={{ marginBottom: 12 }}>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginBottom: 8,
                          }}
                        >
                          <Ionicons
                            name="sparkles"
                            size={16}
                            color="#EC4899"
                            style={{ marginRight: 8 }}
                          />
                          <Text
                            style={{
                              color: colors.textColor,
                              fontSize: 14,
                              fontWeight: "600",
                            }}
                          >
                            {plan.aiBuilds === -1 ? "Unlimited" : plan.aiBuilds}{" "}
                            AI Builds/month
                          </Text>
                        </View>
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <Ionicons
                            name="arrow-up-circle"
                            size={16}
                            color="#EC4899"
                            style={{ marginRight: 8 }}
                          />
                          <Text
                            style={{
                              color: colors.textColor,
                              fontSize: 14,
                              fontWeight: "600",
                            }}
                          >
                            {plan.aiUpgrades === -1
                              ? "Unlimited"
                              : plan.aiUpgrades}{" "}
                            AI Upgrades/month
                          </Text>
                        </View>
                      </View>

                      <View style={{ gap: 6 }}>
                        {plan.features.map((feature, idx) => (
                          <View
                            key={idx}
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                          >
                            <Ionicons
                              name="checkmark"
                              size={14}
                              color={
                                selectedPlan === plan.id
                                  ? "#EC4899"
                                  : colors.secondaryTextColor
                              }
                              style={{ marginRight: 8 }}
                            />
                            <Text
                              style={{
                                color: colors.secondaryTextColor,
                                fontSize: 13,
                              }}
                            >
                              {feature}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </Pressable>
              ))}
            </Animated.View>

            {/* Social Proof */}
            <Animated.View
              entering={FadeInDown.delay(400)}
              style={{ marginBottom: 24 }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 8,
                }}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name="star"
                    size={16}
                    color="#F59E0B"
                    style={{ marginHorizontal: 2 }}
                  />
                ))}
              </View>
              <Text
                style={{
                  color: colors.secondaryTextColor,
                  fontSize: 14,
                  textAlign: "center",
                }}
              >
                Trusted by 10,000+ PC builders
              </Text>
            </Animated.View>

            {/* CTA Button */}
            <Pressable onPress={handleSubscribe} disabled={isProcessing}>
              {({ pressed }) => (
                <LinearGradient
                  colors={["#EC4899", "#F97316"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    borderRadius: 16,
                    height: 56,
                    justifyContent: "center",
                    alignItems: "center",
                    opacity: isProcessing ? 0.7 : pressed ? 0.8 : 1,
                  }}
                >
                  {isProcessing ? (
                    <Text
                      style={{
                        color: "#FFFFFF",
                        fontSize: 18,
                        fontWeight: "bold",
                      }}
                    >
                      Processing...
                    </Text>
                  ) : (
                    <Text
                      style={{
                        color: "#FFFFFF",
                        fontSize: 18,
                        fontWeight: "bold",
                      }}
                    >
                      Subscribe to{" "}
                      {plans.find((p) => p.id === selectedPlan)?.name}
                    </Text>
                  )}
                </LinearGradient>
              )}
            </Pressable>

            {/* Continue with Free (first-use only) */}
            {trigger === "first-use" && (
              <Pressable
                onPress={() => {
                  // Allow user to continue with free plan
                  onClose();
                }}
                style={{ marginTop: 12 }}
              >
                {({ pressed }) => (
                  <Text
                    style={{
                      color: colors.secondaryTextColor,
                      fontSize: 14,
                      textAlign: "center",
                      textDecorationLine: "underline",
                      opacity: pressed ? 0.7 : 1,
                    }}
                  >
                    Continue with Free Plan (
                    {subscription.features.aiBuildsPerMonth} builds/month)
                  </Text>
                )}
              </Pressable>
            )}

            {/* Terms */}
            <Text
              style={{
                color: colors.secondaryTextColor,
                fontSize: 11,
                textAlign: "center",
                marginTop: 16,
              }}
            >
              Cancel anytime. Auto-renews unless cancelled.
            </Text>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}
