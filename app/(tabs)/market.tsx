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
import { FlatList, Pressable, ScrollView, Text, View } from "react-native";
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

  //fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*');

      if (error) {
        console.error('Error fetching products:', error.message);
      } else {
        console.log('Products fetched:', data);
        setAllProducts(data);
      }
    };

    fetchProducts();
  }, []);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let products = [...allProducts];

    // Category filter (quick chips)
    if (activeCategoryFilter !== "All") {
      products = products.filter((p) => p.category === activeCategoryFilter);
    }

    // Search filter
    if (searchQuery) {
      products = products.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Price range filter
    if (filters.minPrice) {
      const minPrice = parseFloat(filters.minPrice);
      if (!isNaN(minPrice)) {
        products = products.filter((p) => p.priceValue >= minPrice);
      }
    }
    if (filters.maxPrice) {
      const maxPrice = parseFloat(filters.maxPrice);
      if (!isNaN(maxPrice)) {
        products = products.filter((p) => p.priceValue <= maxPrice);
      }
    }

    // Condition filter
    if (filters.conditions.length > 0) {
      products = products.filter((p) =>
        filters.conditions.includes(p.condition)
      );
    }

    // Category filter (from modal)
    if (filters.categories.length > 0) {
      products = products.filter((p) =>
        filters.categories.includes(p.category)
      );
    }

    // Brand filter
    if (filters.brands.length > 0) {
      products = products.filter((p) => filters.brands.includes(p.brand));
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
        products.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); 
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
    isWishlisted: boolean
  ) => {
    const userId = useAuthStore.getState().session?.user.id;

    if (!userId) {
      console.warn('User not logged in');
      return;
    }

    if (isWishlisted) {
      // REMOVE from wishlist
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (error) {
        console.error('Error removing from wishlist:', error.message);
      }
    } else {
      // ADD to wishlist
      const { error } = await supabase
        .from('wishlist')
        .insert({
          user_id: userId,
          product_id: productId,
        });

      if (error && error.code !== '23505') {
        console.error('Error adding to wishlist:', error.message);
      }
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
              price={item.price}
              condition={item.condition}
              image={item.images[0]}
              onWishlistPress={handleWishlistPress}
              onPress={() => router.push("/buy-item")}
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
