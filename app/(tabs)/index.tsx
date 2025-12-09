import { ProductCard } from '@/components/product-card';
import { SearchBar } from '@/components/search-bar';
import { SectionHeader } from '@/components/section-header';
import { TrendingProductCard } from '@/components/trending-product-card';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Hardcoded username for now
const USERNAME = 'Alex';

// Mock product data
const recommendedProducts = [
  { id: 1, name: 'RTX 4090', price: '$1,599', condition: 'Excellent', image: '🎮' },
  { id: 2, name: 'Ryzen 9 7950X', price: '$549', condition: 'Like New', image: '💻' },
  { id: 3, name: '32GB DDR5 RAM', price: '$199', condition: 'Excellent', image: '💾' },
  { id: 4, name: '1TB NVMe SSD', price: '$89', condition: 'Good', image: '💿' },
];

const trendingProducts = [
  { id: 5, name: 'NVIDIA GeForce RTX 4080 Super', price: '$999', condition: 'Excellent', image: '🎮', rating: 4.8, sellerName: 'TechGuru', aiCertified: true },
  { id: 6, name: 'Intel i9-14900K', price: '$579', condition: 'Like New', image: '💻', rating: 4.9, sellerName: 'PCBuilder Pro', aiCertified: true },
  { id: 7, name: 'ASUS ROG Motherboard', price: '$349', condition: 'Excellent', image: '🔌', rating: 4.7, sellerName: 'Hardware Haven', aiCertified: false },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <View
      className="flex-1"
      style={{
        backgroundColor: '#0F0E11',
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingLeft: Math.max(insets.left, 24),
          paddingRight: Math.max(insets.right, 24),
          paddingBottom: 24,
        }}
      >
        {/* Welcome Message */}
        <View style={{ paddingTop: 24, marginBottom: 20 }}>
          <Text className="text-2xl font-bold text-white">
            {greeting}, {USERNAME}
          </Text>
          <Text className="text-base text-neutral-400 mt-1">
            Welcome back
          </Text>
        </View>

        {/* Search Bar */}
        <View style={{ marginBottom: 32 }}>
          <SearchBar />
        </View>

        {/* Recommended Items Section */}
        <View style={{ marginBottom: 32 }}>
          <SectionHeader
            title="Recommended for You"
            onShowAllPress={() => console.log('Show all recommended')}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 24 }}
          >
            {recommendedProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </ScrollView>
        </View>

        {/* Trending Products Section */}
        <View>
          <SectionHeader
            title="Trending Products"
            onShowAllPress={() => console.log('Show all trending')}
          />
          <View>
            {trendingProducts.map((product) => (
              <View key={product.id} style={{ marginBottom: 16 }}>
                <TrendingProductCard {...product} />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
