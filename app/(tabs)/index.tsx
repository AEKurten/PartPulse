import SubscriptionPaywall from "@/app/subscription-paywall";
import { AdBanner } from "@/components/ad-banner";
import { ProductCard } from "@/components/product-card";
import { SearchBar } from "@/components/search-bar";
import { SectionHeader } from "@/components/section-header";
import { TrendingProductCard } from "@/components/trending-product-card";
import {
  PaddingSizes,
  TextSizes,
  getPadding,
} from "@/constants/platform-styles";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { getProducts } from "@/lib/database";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUserData } from "../Helpers/UserDetailsHelper";
import { useAuthStore } from "../stores/useAuthStore";

interface RecommendedProduct {
  id: string;
  name: string;
  price: string;
  condition: string;
  image: string;
}

interface TrendingProduct {
  id: string;
  name: string;
  price: string;
  condition: string;
  image: string;
  rating: number;
  sellerName: string;
  aiCertified: boolean;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? "Good morning"
      : currentHour < 18
      ? "Good afternoon"
      : "Good evening";
  const { user } = useAuthStore();

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState<
    RecommendedProduct[]
  >([]);
  const [trendingProducts, setTrendingProducts] = useState<TrendingProduct[]>(
    []
  );
  const [loadingRecommended, setLoadingRecommended] = useState(true);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [wishlistMap, setWishlistMap] = useState<Record<string, boolean>>({});
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

  const USERNAME = useUserData()?.name || "User";

  // Fetch recommended products
  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        setLoadingRecommended(true);
        const products = await getProducts({
          status: "active",
          limit: 4,
        });

        const recommended = products.map((product) => {
          // Get price from database - ensure we're using the actual price value
          let priceValue: number;
          if (typeof product.price === "number") {
            priceValue = product.price;
          } else if (product.price) {
            priceValue = parseFloat(product.price.toString()) || 0;
          } else {
            priceValue = 0;
          }

          return {
            id: product.id,
            name: product.name,
            price: priceValue > 0 ? priceValue.toFixed(2) : "0.00", // Just the number, ProductCard adds "R " prefix
            condition: product.condition || "N/A",
            image:
              Array.isArray(product.images) && product.images.length > 0
                ? product.images[0]
                : "",
          };
        });

        setRecommendedProducts(recommended);
      } catch (error) {
        console.error("Error fetching recommended products:", error);
        setRecommendedProducts([]);
      } finally {
        setLoadingRecommended(false);
      }
    };

    fetchRecommended();
  }, []);

  // Fetch trending products (top 5 most viewed)
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoadingTrending(true);

        // Get view counts grouped by product_id
        const { data: viewCounts, error: viewsError } = await supabase
          .from("product_views")
          .select("product_id");

        if (viewsError) {
          console.error("Error fetching view counts:", viewsError);
        }

        // Count views per product
        const viewCountMap: Record<string, number> = {};
        viewCounts?.forEach((view: any) => {
          viewCountMap[view.product_id] =
            (viewCountMap[view.product_id] || 0) + 1;
        });

        // Get all active products
        const { data: allProducts, error: productsError } = await supabase
          .from("products")
          .select("*")
          .eq("status", "active")
          .limit(100);

        if (productsError) {
          console.error("Error fetching products:", productsError);
          setTrendingProducts([]);
          return;
        }

        // Sort by view count and take top 5
        const sorted = (allProducts || [])
          .map((product: any) => ({
            ...product,
            viewCount: viewCountMap[product.id] || 0,
          }))
          .sort((a, b) => b.viewCount - a.viewCount)
          .slice(0, 5);

        // Fetch seller names for trending products
        const trendingWithSellers = await Promise.all(
          sorted.map(async (product: any) => {
            let sellerName = "Unknown Seller";
            if (product.seller_id) {
              const { data: seller } = await supabase
                .from("profiles")
                .select("username")
                .eq("id", product.seller_id)
                .single();

              if (seller) {
                sellerName = seller.username || "Unknown Seller";
              }
            }

            // Format price - ensure we use the actual database price
            let priceValue: number;
            if (typeof product.price === "number") {
              priceValue = product.price;
            } else if (product.price) {
              priceValue = parseFloat(product.price.toString()) || 0;
            } else {
              priceValue = 0;
            }

            return {
              id: product.id,
              name: product.name,
              price: priceValue > 0 ? `R ${priceValue.toFixed(2)}` : "R 0.00", // Format with R prefix for TrendingProductCard
              condition: product.condition || "N/A",
              image:
                Array.isArray(product.images) && product.images.length > 0
                  ? product.images[0]
                  : "",
              rating: 4.5, // Default rating, can be enhanced later
              sellerName: sellerName,
              aiCertified: false, // Can be enhanced later
            };
          })
        );

        setTrendingProducts(trendingWithSellers);
      } catch (error) {
        console.error("Error fetching trending products:", error);
        setTrendingProducts([]);
      } finally {
        setLoadingTrending(false);
      }
    };

    fetchTrending();
  }, []);

  // Fetch wishlist status
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user?.id) {
        setWishlistMap({});
        return;
      }

      try {
        const { data, error } = await supabase
          .from("wishlist")
          .select("product_id")
          .eq("user_id", user.id);

        if (error) {
          console.error("Error fetching wishlist:", error);
          return;
        }

        const map: Record<string, boolean> = {};
        data?.forEach((item) => {
          map[item.product_id] = true;
        });
        setWishlistMap(map);
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      }
    };

    fetchWishlist();
  }, [user?.id]);

  const handleWishlistPress = async (
    productId: string,
    shouldBeWishlisted: boolean
  ) => {
    if (!user?.id) {
      return;
    }

    try {
      if (shouldBeWishlisted) {
        const { error } = await supabase.from("wishlist").insert({
          user_id: user.id,
          product_id: productId,
        });

        if (error && error.code !== "23505") {
          console.error("Error adding to wishlist:", error);
          return;
        }

        setWishlistMap((prev) => ({ ...prev, [productId]: true }));
      } else {
        const { error } = await supabase
          .from("wishlist")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", productId);

        if (error) {
          console.error("Error removing from wishlist:", error);
          return;
        }

        setWishlistMap((prev) => {
          const newMap = { ...prev };
          delete newMap[productId];
          return newMap;
        });
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
    }
  };

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
          paddingLeft: Math.max(insets.left, PaddingSizes.lg),
          paddingRight: Math.max(insets.right, PaddingSizes.lg),
          paddingBottom: PaddingSizes.lg,
        }}
      >
        {/* Welcome Message with Chats Button */}
        <View
          style={{ paddingTop: PaddingSizes.lg, marginBottom: getPadding(32) }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: PaddingSizes.sm,
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: "#EC4899" + "20",
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: PaddingSizes.base,
                  }}
                >
                  <Ionicons name="home" size={24} color="#EC4899" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: colors.textColor,
                      fontSize: TextSizes["2xl"],
                      fontWeight: "bold",
                      marginBottom: PaddingSizes.xs,
                    }}
                  >
                    {greeting}, {USERNAME}
                  </Text>
                  <Text
                    style={{
                      color: colors.secondaryTextColor,
                      fontSize: TextSizes.sm,
                    }}
                  >
                    Welcome back to PartPulse
                  </Text>
                </View>
              </View>
            </View>
            <Pressable
              onPress={() => router.push("/chats")}
              style={{
                backgroundColor: colors.cardBackground,
                borderRadius: 16,
                width: 56,
                height: 56,
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 1,
                borderColor: colors.borderColor,
              }}
            >
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={24}
                color={colors.textColor}
              />
            </Pressable>
          </View>
        </View>

        {/* Search Bar with Quick Access Buttons */}
        <View style={{ marginBottom: getPadding(32) }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ flex: 1 }}>
              <SearchBar
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                onSubmit={(query) => {
                  router.push({
                    pathname: "/(tabs)/market",
                    params: { search: query },
                  });
                }}
              />
            </View>

            {/* Wishlist Button */}
            <Animated.View style={buttonsAnimatedStyle}>
              <Pressable
                onPress={() => router.push("/(tabs)/wishlist")}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: colors.cardBackground,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#EC4899" + "30",
                  overflow: "hidden",
                }}
              >
                <Ionicons name="heart-outline" size={24} color="#EC4899" />
              </Pressable>
            </Animated.View>

            {/* Notifications Button */}
            <Animated.View style={buttonsAnimatedStyle}>
              <Pressable
                onPress={() => router.push("/(tabs)/notifications")}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: colors.cardBackground,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#3B82F6" + "30",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color="#3B82F6"
                />
                {/* Unread indicator */}
                <View
                  style={{
                    position: "absolute",
                    top: PaddingSizes.sm,
                    right: PaddingSizes.sm,
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: "#EC4899",
                    borderWidth: 2,
                    borderColor: colors.cardBackground,
                  }}
                />
              </Pressable>
            </Animated.View>
          </View>
        </View>

        {/* Recommended Items Section */}
        <View style={{ marginBottom: getPadding(32) }}>
          <SectionHeader
            title="Recommended for You"
            onShowAllPress={() => router.push("/(tabs)/market")}
          />
          {loadingRecommended ? (
            <View
              style={{
                height: 200,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ActivityIndicator size="large" color="#EC4899" />
            </View>
          ) : recommendedProducts.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: PaddingSizes.lg }}
            >
              {recommendedProducts.map((product) => (
                <View key={product.id} style={{ width: 180 }}>
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    condition={product.condition}
                    image={product.image}
                    isWishlisted={wishlistMap[product.id] || false}
                    onWishlistPress={handleWishlistPress}
                    onPress={() =>
                      router.push({
                        pathname: "/buy-item",
                        params: { productId: product.id },
                      })
                    }
                    source="home_recommended"
                  />
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={{ padding: PaddingSizes.lg, alignItems: "center" }}>
              <Text
                style={{
                  color: colors.secondaryTextColor,
                  fontSize: TextSizes.sm,
                }}
              >
                No products available
              </Text>
            </View>
          )}
        </View>

        {/* Trending Products Section */}
        <View>
          <SectionHeader
            title="Trending Products"
            onShowAllPress={() => router.push("/(tabs)/market")}
          />
          {loadingTrending ? (
            <View
              style={{
                height: 200,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ActivityIndicator size="large" color="#EC4899" />
            </View>
          ) : trendingProducts.length > 0 ? (
            <View>
              {trendingProducts.map((product, index) => (
                <View
                  key={product.id}
                  style={{ marginBottom: PaddingSizes.md }}
                >
                  <TrendingProductCard
                    id={index + 1}
                    name={product.name}
                    price={product.price}
                    condition={product.condition}
                    image={product.image}
                    rating={product.rating}
                    sellerName={product.sellerName}
                    aiCertified={product.aiCertified}
                    href={
                      {
                        pathname: "/buy-item",
                        params: { productId: product.id },
                      } as any
                    }
                  />
                </View>
              ))}
            </View>
          ) : (
            <View style={{ padding: PaddingSizes.lg, alignItems: "center" }}>
              <Text
                style={{
                  color: colors.secondaryTextColor,
                  fontSize: TextSizes.sm,
                }}
              >
                No trending products available
              </Text>
            </View>
          )}
        </View>

        {/* Ad Banner */}
        <View
          style={{ marginTop: getPadding(32), marginBottom: PaddingSizes.md }}
        >
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
