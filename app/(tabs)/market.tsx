import { FilterChip } from "@/components/filter-chip";
import { FilterModal, FilterState } from "@/components/filter-modal";
import { FloatingActionButton } from "@/components/floating-action-button";
import { ProductCard } from "@/components/product-card";
import { SearchWithFilters } from "@/components/search-with-filters";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Mock product data - in real app this would come from database
interface Product {
  id: number;
  name: string;
  price: string;
  priceValue: number;
  condition: string;
  category: string;
  brand: string;
  image: string;
  createdAt: Date;
}

const allProducts: Product[] = [
  {
    id: 1,
    name: "RTX 4090",
    price: "$1,599",
    priceValue: 1599,
    condition: "A+",
    category: "GPU",
    brand: "NVIDIA",
    image:
      "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=300&fit=crop&q=80",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: 2,
    name: "Ryzen 9 7950X",
    price: "$549",
    priceValue: 549,
    condition: "A+",
    category: "CPU",
    brand: "AMD",
    image:
      "https://images.unsplash.com/photo-1587825147138-346b006e0937?w=400&h=300&fit=crop&q=80",
    createdAt: new Date("2024-01-20"),
  },
  {
    id: 3,
    name: "32GB DDR5 RAM",
    price: "$199",
    priceValue: 199,
    condition: "B",
    category: "RAM",
    brand: "Corsair",
    image:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop&q=80",
    createdAt: new Date("2024-01-10"),
  },
  {
    id: 4,
    name: "1TB NVMe SSD",
    price: "$89",
    priceValue: 89,
    condition: "B",
    category: "Storage",
    brand: "Samsung",
    image:
      "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=300&fit=crop&q=80",
    createdAt: new Date("2024-01-18"),
  },
  {
    id: 5,
    name: "NVIDIA GeForce RTX 4080 Super",
    price: "$999",
    priceValue: 999,
    condition: "A+",
    category: "GPU",
    brand: "NVIDIA",
    image:
      "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=300&fit=crop&q=80",
    createdAt: new Date("2024-01-22"),
  },
  {
    id: 6,
    name: "Intel i9-14900K",
    price: "$579",
    priceValue: 579,
    condition: "A",
    category: "CPU",
    brand: "Intel",
    image:
      "https://images.unsplash.com/photo-1587825147138-346b006e0937?w=400&h=300&fit=crop&q=80",
    createdAt: new Date("2024-01-12"),
  },
  {
    id: 7,
    name: "ASUS ROG Motherboard",
    price: "$349",
    priceValue: 349,
    condition: "A+",
    category: "Motherboard",
    brand: "ASUS",
    image:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop&q=80",
    createdAt: new Date("2024-01-25"),
  },
  {
    id: 8,
    name: "Corsair 850W PSU",
    price: "$129",
    priceValue: 129,
    condition: "A",
    category: "PSU",
    brand: "Corsair",
    image:
      "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=300&fit=crop&q=80",
    createdAt: new Date("2024-01-08"),
  },
  {
    id: 9,
    name: "AMD Radeon RX 7900 XTX",
    price: "$899",
    priceValue: 899,
    condition: "A",
    category: "GPU",
    brand: "AMD",
    image:
      "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=300&fit=crop&q=80",
    createdAt: new Date("2024-01-14"),
  },
  {
    id: 10,
    name: "MSI Z790 Motherboard",
    price: "$299",
    priceValue: 299,
    condition: "A+",
    category: "Motherboard",
    brand: "MSI",
    image:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop&q=80",
    createdAt: new Date("2024-01-19"),
  },
];

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
        products.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
    }

    return products;
  }, [searchQuery, activeCategoryFilter, filters]);

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

  const handleWishlistPress = (id: number, isWishlisted: boolean) => {
    console.log(`Product ${id} wishlisted: ${isWishlisted}`);
    // In real app, update wishlist state/API
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
        columnWrapperStyle={{ gap: 16 }}
        renderItem={({ item }) => (
          <View style={{ flex: 1 }}>
            <ProductCard
              id={item.id}
              name={item.name}
              price={item.price}
              condition={item.condition}
              image={item.image}
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
          filteredProducts.length > 0 ? (
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
          ) : null
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
    </View>
  );
}
