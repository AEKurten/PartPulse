import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
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
  { id: 5, name: 'RTX 4080 Super', price: '$999', condition: 'Excellent', image: '🎮', rating: 4.8 },
  { id: 6, name: 'Intel i9-14900K', price: '$579', condition: 'Like New', image: '💻', rating: 4.9 },
  { id: 7, name: 'ASUS ROG Motherboard', price: '$349', condition: 'Excellent', image: '🔌', rating: 4.7 },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
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
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#2B2E36',
              borderRadius: 999,
              paddingHorizontal: 20,
              paddingVertical: 14,
            }}
          >
            <TextInput
              placeholder="Search for parts..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{
                flex: 1,
                fontSize: 16,
                color: '#FFFFFF',
              }}
            />
            <Ionicons name="search" size={24} color="#D62F76" />

          </View>
        </View>

        {/* Recommended Items Section */}
        <View style={{ marginBottom: 32 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <Text className="text-xl font-bold text-white">Recommended for You</Text>
            <Pressable>
              <Text className="text-[#EC4899]">Show all</Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 24 }}
          >
            {recommendedProducts.map((product, index) => (
              <View
                key={product.id}
                style={{
                  width: 180,
                  marginRight: 16,
                  backgroundColor: '#2B2E36',
                  borderRadius: 16,
                  padding: 16,
                }}
              >
                <View
                  style={{
                    width: '100%',
                    height: 120,
                    backgroundColor: '#1A1C22',
                    borderRadius: 12,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 12,
                  }}
                >
                  <Text style={{ fontSize: 48 }}>{product.image}</Text>
                </View>
                <Text
                  className="text-white font-semibold text-base mb-1"
                  numberOfLines={1}
                >
                  {product.name}
                </Text>
                <Text className="text-neutral-400 text-sm mb-2">{product.condition}</Text>
                <Text className="text-[#EC4899] font-bold text-lg">{product.price}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Trending Products Section */}
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text className="text-xl font-bold text-white">Trending Products</Text>
            <Pressable>
              <Text className="text-[#EC4899]">Show all</Text>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 24 }}
          >
            {trendingProducts.map((product) => (
              <Link key={product.id} href="/buy-item" asChild>
                <Pressable>
                  {({ pressed }) => (
                    <View
                      style={{
                        width: 320,
                        marginRight: 16,
                        backgroundColor: '#2B2E36',
                        borderRadius: 16,
                        padding: 16,
                        flexDirection: 'row',
                        opacity: pressed ? 0.8 : 1,
                      }}
                    >
                      <View
                        style={{
                          width: 100,
                          height: 100,
                          backgroundColor: '#1A1C22',
                          borderRadius: 12,
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginRight: 16,
                        }}
                      >
                        <Text style={{ fontSize: 40 }}>{product.image}</Text>
                      </View>
                      <View style={{ flex: 1, justifyContent: 'space-between' }}>
                        <View>
                          <Text className="text-white font-semibold text-base mb-1">
                            {product.name}
                          </Text>
                          <Text className="text-neutral-400 text-sm mb-2">
                            {product.condition}
                          </Text>
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              marginBottom: 8,
                            }}
                          >
                            <Ionicons name="star" size={14} color="#FBBF24" />
                            <Text className="text-white text-sm ml-1">{product.rating}</Text>
                          </View>
                        </View>
                        <Text className="text-[#EC4899] font-bold text-lg">{product.price}</Text>
                      </View>
                    </View>
                  )}
                </Pressable>
              </Link>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}
