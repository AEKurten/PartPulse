import { FilterChip } from '@/components/filter-chip';
import { ProductCard } from '@/components/product-card';
import { SearchWithFilters } from '@/components/search-with-filters';
import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Mock product data - in real app this would come from API/state
const allProducts = [
  { id: 1, name: 'RTX 4090', price: '$1,599', condition: 'A+', image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=300&fit=crop&q=80', category: 'GPU' },
  { id: 2, name: 'Ryzen 9 7950X', price: '$549', condition: 'A+', image: 'https://images.unsplash.com/photo-1587825147138-346b006e0937?w=400&h=300&fit=crop&q=80', category: 'CPU' },
  { id: 3, name: '32GB DDR5 RAM', price: '$199', condition: 'B', image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop&q=80', category: 'RAM' },
  { id: 4, name: '1TB NVMe SSD', price: '$89', condition: 'B', image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=300&fit=crop&q=80', category: 'Storage' },
  { id: 5, name: 'NVIDIA GeForce RTX 4080 Super', price: '$999', condition: 'A+', image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=300&fit=crop&q=80', category: 'GPU' },
  { id: 6, name: 'Intel i9-14900K', price: '$579', condition: 'A', image: 'https://images.unsplash.com/photo-1587825147138-346b006e0937?w=400&h=300&fit=crop&q=80', category: 'CPU' },
  { id: 7, name: 'ASUS ROG Motherboard', price: '$349', condition: 'A+', image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop&q=80', category: 'Motherboard' },
  { id: 8, name: 'Corsair 850W PSU', price: '$129', condition: 'A', image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=300&fit=crop&q=80', category: 'PSU' },
];

const filterChips = ['All', 'GPU', 'CPU', 'RAM', 'Storage', 'Motherboard'];

export default function ProductsScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [filteredProducts, setFilteredProducts] = useState(allProducts);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    filterProducts(query, activeFilter);
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    filterProducts(searchQuery, filter);
  };

  const filterProducts = (query: string, filter: string) => {
    let filtered = allProducts;

    if (filter !== 'All') {
      filtered = filtered.filter((p) => p.category === filter);
    }

    if (query) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const handleWishlistPress = (id: number, isWishlisted: boolean) => {
    console.log(`Product ${id} wishlisted: ${isWishlisted}`);
    // In real app, update wishlist state/API
  };

  return (
    <View
      className="flex-1"
      style={{
        backgroundColor: '#0F0E11',
        paddingTop: insets.top,
      }}
    >
      <View
        style={{
          paddingLeft: Math.max(insets.left, 24),
          paddingRight: Math.max(insets.right, 24),
          paddingTop: 24,
          paddingBottom: 16,
        }}
      >
        {/* Search Bar with Filters Button */}
        <View style={{ marginBottom: 16 }}>
          <SearchWithFilters
            onSearchChange={handleSearchChange}
            onFiltersPress={() => {
              // Navigate to filters modal/screen
              console.log('Open filters');
            }}
          />
        </View>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 24 }}
        >
          {filterChips.map((chip) => (
            <FilterChip
              key={chip}
              label={chip}
              isActive={activeFilter === chip}
              onPress={() => handleFilterChange(chip)}
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
              {...item}
              onWishlistPress={handleWishlistPress}
              onPress={() => router.push('/buy-item')}
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={{ padding: 32, alignItems: 'center' }}>
            <Text className="text-white text-lg">No products found</Text>
            <Text className="text-neutral-400 text-sm mt-2">
              Try adjusting your search or filters
            </Text>
          </View>
        }
      />
    </View>
  );
}

