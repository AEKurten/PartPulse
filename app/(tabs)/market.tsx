import SubscriptionPaywall from "@/app/subscription-paywall";
import { AdBanner } from "@/components/ad-banner";
import { FilterChip } from "@/components/filter-chip";
import { FilterModal, FilterState } from "@/components/filter-modal";
import { FloatingActionButton } from "@/components/floating-action-button";
import { ProductCard } from "@/components/product-card";
import { SearchWithFilters } from "@/components/search-with-filters";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "../stores/useAuthStore";

// Mock product data - in real app this would come from database
interface Product {
  id: string;
  name: string;
  price: string;
  priceValue: number;
  condition: string;
  category: string;
  brand: string;
  images: string[];
  created_at: Date;
  Listing_Type: string;
}

const filterChips = ["All", "GPU", "CPU", "RAM", "Storage", "Motherboard"];

const initialFilters: FilterState = {
  minPrice: "",
  maxPrice: "",
  conditions: [],
  categories: [],
  brands: [],
  sortBy: "newest",
};

export default function MarketScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("All");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [showPaywall, setShowPaywall] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [wishlistMap, setWishlistMap] = useState<Record<string, boolean>>({});
  const [refreshing, setRefreshing] = useState(false);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'active'); // Only fetch active products

    if (error) {
      console.error('Error fetching products:', error.message);
      setAllProducts([]);
    } else {
      // Transform products to match the Product interface
      const transformedProducts: Product[] = (data || []).map((product: any) => ({
        id: product.id,
        name: product.name,
        price: typeof product.price === 'number' ? product.price.toFixed(2) : product.price.toString(),
        priceValue: typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0,
        condition: product.condition || '',
        category: product.category || '',
        brand: product.brand || '',
        images: product.images || [],
        created_at: product.created_at ? new Date(product.created_at) : new Date(),
        Listing_Type: product.listing_type || 'marketplace',
      }));
      setAllProducts(transformedProducts);
    }
  };

  const fetchWishlist = async () => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) {
      setWishlistMap({});
      return;
    }

    const { data, error } = await supabase
      .from('wishlist')
      .select('product_id')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching wishlist:', error.message);
    } else {
      const map: Record<string, boolean> = {};
      data?.forEach((item) => {
        map[item.product_id] = true;
      });
      setWishlistMap(map);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchProducts(), fetchWishlist()]);
    setRefreshing(false);
  };

  //fetch products and wishlist status
  useEffect(() => {
    fetchProducts();
    fetchWishlist();
  }, []);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let products = [...allProducts];

    // Category filter (quick chips) - only apply if modal categories are not set
    if (activeCategoryFilter !== "All" && filters.categories.length === 0) {
      products = products.filter((p) => p.category === activeCategoryFilter);
    }

    // Category filter (from modal) - takes precedence over chips
    if (filters.categories.length > 0) {
      products = products.filter((p) =>
        filters.categories.includes(p.category)
      );
    }

    // Search filter - search in name, brand, and model
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      products = products.filter((p) =>
        p.name.toLowerCase().includes(query) ||
        (p.brand && p.brand.toLowerCase().includes(query))
      );
    }

    // Price range filter
    if (filters.minPrice) {
      const minPrice = parseFloat(filters.minPrice);
      if (!isNaN(minPrice) && minPrice >= 0) {
        products = products.filter((p) => p.priceValue >= minPrice);
      }
    }
    if (filters.maxPrice) {
      const maxPrice = parseFloat(filters.maxPrice);
      if (!isNaN(maxPrice) && maxPrice >= 0) {
        products = products.filter((p) => p.priceValue <= maxPrice);
      }
    }

    // Condition filter
    if (filters.conditions.length > 0) {
      products = products.filter((p) =>
        filters.conditions.includes(p.condition)
      );
    }

    // Brand filter
    if (filters.brands.length > 0) {
      products = products.filter((p) => p.brand && filters.brands.includes(p.brand));
    }

    // Sort
    switch (filters.sortBy) {
      case "price-low":
        products.sort((a, b) => a.priceValue - b.priceValue);
        break;
      case "price-high":
        products.sort((a, b) => b.priceValue - a.priceValue);
        break;
      case "name":
        products.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "newest":
      default:
        products.sort((a, b) => {
          const dateA = a.created_at instanceof Date ? a.created_at.getTime() : new Date(a.created_at).getTime();
          const dateB = b.created_at instanceof Date ? b.created_at.getTime() : new Date(b.created_at).getTime();
          return dateB - dateA;
        }); 
        break;
    }

    return products;
  }, [searchQuery, activeCategoryFilter, filters, allProducts]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategoryFilterChange = (filter: string) => {
    setActiveCategoryFilter(filter);
  };

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    // Filters are already applied via useMemo
    setShowFilterModal(false);
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
    setActiveCategoryFilter("All");
  };

  const handleWishlistPress = async (
    productId: string,
    shouldBeWishlisted: boolean
  ) => {
    const userId = useAuthStore.getState().user?.id;

    if (!userId) {
      Alert.alert('Login Required', 'Please log in to add items to your wishlist');
      return;
    }

    try {
      if (shouldBeWishlisted) {
        // ADD to wishlist
        const { error } = await supabase
          .from('wishlist')
          .insert({
            user_id: userId,
            product_id: productId,
          });

        if (error) {
          if (error.code === '23505') {
            // Duplicate entry - already in wishlist, update state anyway
            setWishlistMap((prev) => ({
              ...prev,
              [productId]: true,
            }));
          } else {
            console.error('Error adding to wishlist:', error);
            Alert.alert('Error', `Failed to add to wishlist: ${error.message}`);
            // Revert ProductCard state on error
            return;
          }
        } else {
          // Update local state only on success
          setWishlistMap((prev) => ({
            ...prev,
            [productId]: true,
          }));
        }
      } else {
        // REMOVE from wishlist
        const { error } = await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', userId)
          .eq('product_id', productId);

        if (error) {
          console.error('Error removing from wishlist:', error);
          Alert.alert('Error', `Failed to remove from wishlist: ${error.message}`);
          // Revert ProductCard state on error
          return;
        }
        
        // Update local state only on success
        setWishlistMap((prev) => {
          const newMap = { ...prev };
          delete newMap[productId];
          return newMap;
        });
      }
    } catch (error: any) {
      console.error('Error updating wishlist:', error);
      Alert.alert('Error', `Failed to update wishlist: ${error?.message || 'Unknown error'}`);
    }
  };


  const activeFiltersCount =
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0) +
    filters.conditions.length +
    filters.categories.length +
    filters.brands.length;

  return (
    <View
      className="flex-1"
      style={{
        backgroundColor: colors.backgroundColor,
        paddingTop: insets.top,
      }}
    >
      <StatusBar style={colors.statusBarStyle} />
      <View
        style={{
          paddingLeft: Math.max(insets.left, 24),
          paddingRight: Math.max(insets.right, 24),
          paddingTop: 24,
          paddingBottom: 16,
        }}
      >
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 12,
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
                marginRight: 12,
              }}
            >
              <Ionicons name="storefront-outline" size={24} color="#EC4899" />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: colors.textColor,
                  fontSize: 28,
                  fontWeight: "bold",
                  marginBottom: 4,
                }}
              >
                Market
              </Text>
              <Text style={{ color: colors.secondaryTextColor, fontSize: 14 }}>
                Find the perfect parts for your build
              </Text>
            </View>
          </View>
        </View>

        {/* Search Bar with Filters Button */}
        <View style={{ marginBottom: 16 }}>
          <SearchWithFilters
            onSearchChange={handleSearchChange}
            onFiltersPress={() => setShowFilterModal(true)}
          />
          {activeFiltersCount > 0 && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 8,
                gap: 8,
              }}
            >
              <View
                style={{
                  backgroundColor: "#EC4899",
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Ionicons name="filter" size={14} color="#FFFFFF" />
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 12,
                    fontWeight: "600",
                  }}
                >
                  {activeFiltersCount} active
                </Text>
              </View>
              <Pressable onPress={handleResetFilters}>
                <Text
                  style={{
                    color: "#EC4899",
                    fontSize: 12,
                    fontWeight: "600",
                  }}
                >
                  Clear all
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Category Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 24 }}
        >
          {filterChips.map((chip) => (
            <FilterChip
              key={chip}
              label={chip}
              isActive={activeCategoryFilter === chip}
              onPress={() => handleCategoryFilterChange(chip)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Products Grid */}
      <FlatList
        data={filteredProducts}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#EC4899"
            colors={["#EC4899"]}
          />
        }
        contentContainerStyle={{
          paddingLeft: Math.max(insets.left, 24),
          paddingRight: Math.max(insets.right, 24),
          paddingBottom: 24,
          gap: 16,
        }}
        columnWrapperStyle={{ gap: 0 }}
        renderItem={({ item }) => (
          <View style={{ flex: 1 }}>
            <ProductCard
              id={item.id}
              name={item.name}
              price={typeof item.price === 'number' ? item.price.toString() : item.price}
              condition={item.condition}
              image={item.images && item.images.length > 0 ? item.images[0] : ''}
              isWishlisted={wishlistMap[item.id] || false}
              onWishlistPress={handleWishlistPress}
              onPress={() => router.push({
                pathname: "/buy-item",
                params: { productId: item.id }
              })}
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={{ padding: 32, alignItems: "center" }}>
            <Ionicons
              name="search-outline"
              size={48}
              color={colors.secondaryTextColor}
              style={{ marginBottom: 16, opacity: 0.5 }}
            />
            <Text
              style={{
                color: colors.textColor,
                fontSize: 18,
                fontWeight: "600",
                marginBottom: 8,
              }}
            >
              No products found
            </Text>
            <Text
              style={{
                color: colors.secondaryTextColor,
                fontSize: 14,
                textAlign: "center",
              }}
            >
              Try adjusting your search or filters
            </Text>
          </View>
        }
        ListHeaderComponent={
          <View>
            {filteredProducts.length > 0 && (
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    color: colors.secondaryTextColor,
                    fontSize: 14,
                  }}
                >
                  {filteredProducts.length} product
                  {filteredProducts.length !== 1 ? "s" : ""} found
                </Text>
              </View>
            )}
            <View style={{ marginBottom: 24 }}>
              <AdBanner onUpgradePress={() => setShowPaywall(true)} />
            </View>
          </View>
        }
      />
      <FloatingActionButton />

      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
      />

      {/* Paywall Modal */}
      <SubscriptionPaywall
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        trigger="upgrade-prompt"
      />
    </View>
  );
}
