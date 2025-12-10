import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import {
  Dimensions,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { FilterChip } from './filter-chip';

export interface FilterState {
  minPrice: string;
  maxPrice: string;
  conditions: string[];
  categories: string[];
  brands: string[];
  sortBy: 'newest' | 'price-low' | 'price-high' | 'name';
}

const CONDITIONS = ['A+', 'A', 'B', 'C', 'D'];
const CATEGORIES = ['GPU', 'CPU', 'RAM', 'Storage', 'Motherboard', 'PSU', 'Cooling', 'Case'];
const POPULAR_BRANDS = ['NVIDIA', 'AMD', 'Intel', 'ASUS', 'MSI', 'Corsair', 'Samsung', 'Western Digital'];
const SORT_OPTIONS = [
  { value: 'newest' as const, label: 'Newest First' },
  { value: 'price-low' as const, label: 'Price: Low to High' },
  { value: 'price-high' as const, label: 'Price: High to Low' },
  { value: 'name' as const, label: 'Name: A-Z' },
];

type FilterModalProps = {
  visible: boolean;
  onClose: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
};

export function FilterModal({
  visible,
  onClose,
  filters,
  onFiltersChange,
  onApplyFilters,
  onResetFilters,
}: FilterModalProps) {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const translateY = useSharedValue(0);
  const screenHeight = Dimensions.get('window').height;
  const scrollViewRef = useRef<ScrollView>(null);
  const isScrolling = useRef(false);
  const scrollOffset = useRef(0);

  useEffect(() => {
    if (visible) {
      translateY.value = 0;
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleDismiss = () => {
    onClose();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to downward drags when scroll is at top and not actively scrolling
        const canDrag = scrollOffset.current <= 0 && !isScrolling.current;
        return canDrag && gestureState.dy > 10 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderGrant: () => {
        translateY.value = 0;
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow downward movement
        if (gestureState.dy > 0 && scrollOffset.current <= 0 && !isScrolling.current) {
          translateY.value = gestureState.dy;
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 && scrollOffset.current <= 0 && !isScrolling.current) {
          // Dismiss if dragged down more than 100px
          translateY.value = withTiming(screenHeight, { duration: 200 }, () => {
            runOnJS(handleDismiss)();
            translateY.value = 0;
          });
        } else {
          // Snap back to original position
          translateY.value = withSpring(0);
        }
      },
    })
  ).current;

  // Separate pan responder for the handle bar area
  const handlePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        translateY.value = 0;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.value = gestureState.dy;
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          translateY.value = withTiming(screenHeight, { duration: 200 }, () => {
            runOnJS(handleDismiss)();
            translateY.value = 0;
          });
        } else {
          translateY.value = withSpring(0);
        }
      },
    })
  ).current;

  const handleToggleCondition = (condition: string) => {
    const newConditions = filters.conditions.includes(condition)
      ? filters.conditions.filter((c) => c !== condition)
      : [...filters.conditions, condition];
    onFiltersChange({ ...filters, conditions: newConditions });
  };

  const handleToggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const handleToggleBrand = (brand: string) => {
    const newBrands = filters.brands.includes(brand)
      ? filters.brands.filter((b) => b !== brand)
      : [...filters.brands, brand];
    onFiltersChange({ ...filters, brands: newBrands });
  };

  const handleReset = () => {
    onResetFilters();
  };

  const handleApply = () => {
    onApplyFilters();
    onClose();
  };

  const activeFiltersCount =
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0) +
    filters.conditions.length +
    filters.categories.length +
    filters.brands.length;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: colors.backgroundColor + 'CC',
          justifyContent: 'flex-end',
        }}
        onPress={onClose}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{ flex: 1, justifyContent: 'flex-end' }}
        >
          <Animated.View
            style={[
              {
                backgroundColor: colors.cardBackground,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 20,
                maxHeight: '90%',
              },
              animatedStyle,
            ]}
            {...panResponder.panHandlers}
          >
            {/* Handle Bar - Draggable */}
            <View
              style={{
                paddingVertical: 12,
                paddingHorizontal: 20,
                marginTop: 12,
                marginBottom: 8,
                alignItems: 'center',
              }}
              {...handlePanResponder.panHandlers}
            >
              <View
                style={{
                  width: 40,
                  height: 4,
                  backgroundColor: colors.secondaryTextColor,
                  borderRadius: 2,
                  opacity: 0.5,
                }}
              />
            </View>

            {/* Header - Also draggable */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24,
                paddingHorizontal: Math.max(insets.left, 24),
                paddingRight: Math.max(insets.right, 24),
              }}
              {...handlePanResponder.panHandlers}
            >
              <View>
                <Text
                  style={{
                    color: colors.textColor,
                    fontSize: 24,
                    fontWeight: 'bold',
                  }}
                >
                  Filter Products
                </Text>
                {activeFiltersCount > 0 && (
                  <Text
                    style={{
                      color: colors.secondaryTextColor,
                      fontSize: 14,
                      marginTop: 4,
                    }}
                  >
                    {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
                  </Text>
                )}
              </View>
              <Pressable onPress={onClose}>
                <Ionicons name="close" size={28} color={colors.textColor} />
              </Pressable>
            </View>

            <ScrollView
              ref={scrollViewRef}
              showsVerticalScrollIndicator={false}
              style={{
                paddingHorizontal: Math.max(insets.left, 24),
                paddingRight: Math.max(insets.right, 24),
                height: screenHeight * 0.55,
              }}
              contentContainerStyle={{ paddingBottom: 20 }}
              onScroll={(event) => {
                scrollOffset.current = event.nativeEvent.contentOffset.y;
              }}
              onScrollBeginDrag={() => {
                isScrolling.current = true;
              }}
              onScrollEndDrag={() => {
                isScrolling.current = false;
              }}
              onMomentumScrollEnd={() => {
                isScrolling.current = false;
              }}
              scrollEventThrottle={16}
            >
              {/* Price Range */}
              <View style={{ marginBottom: 32 }}>
                <Text
                  style={{
                    color: colors.textColor,
                    fontSize: 18,
                    fontWeight: '600',
                    marginBottom: 16,
                  }}
                >
                  Price Range
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    gap: 12,
                    alignItems: 'center',
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: colors.secondaryTextColor,
                        fontSize: 14,
                        marginBottom: 8,
                      }}
                    >
                      Min Price
                    </Text>
                    <TextInput
                      placeholder="$0"
                      placeholderTextColor={colors.secondaryTextColor}
                      value={filters.minPrice}
                      onChangeText={(text) =>
                        onFiltersChange({ ...filters, minPrice: text })
                      }
                      keyboardType="numeric"
                      style={{
                        backgroundColor: colors.inputBackground,
                        borderRadius: 12,
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        color: colors.textColor,
                        fontSize: 16,
                        borderWidth: 1,
                        borderColor: colors.borderColor,
                      }}
                    />
                  </View>
                  <View style={{ marginTop: 24 }}>
                    <Text
                      style={{
                        color: colors.secondaryTextColor,
                        fontSize: 16,
                      }}
                    >
                      to
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: colors.secondaryTextColor,
                        fontSize: 14,
                        marginBottom: 8,
                      }}
                    >
                      Max Price
                    </Text>
                    <TextInput
                      placeholder="No limit"
                      placeholderTextColor={colors.secondaryTextColor}
                      value={filters.maxPrice}
                      onChangeText={(text) =>
                        onFiltersChange({ ...filters, maxPrice: text })
                      }
                      keyboardType="numeric"
                      style={{
                        backgroundColor: colors.inputBackground,
                        borderRadius: 12,
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        color: colors.textColor,
                        fontSize: 16,
                        borderWidth: 1,
                        borderColor: colors.borderColor,
                      }}
                    />
                  </View>
                </View>
              </View>

              {/* Condition */}
              <View style={{ marginBottom: 32 }}>
                <Text
                  style={{
                    color: colors.textColor,
                    fontSize: 18,
                    fontWeight: '600',
                    marginBottom: 16,
                  }}
                >
                  Condition
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: 8,
                  }}
                >
                  {CONDITIONS.map((condition) => (
                    <FilterChip
                      key={condition}
                      label={condition}
                      isActive={filters.conditions.includes(condition)}
                      onPress={() => handleToggleCondition(condition)}
                    />
                  ))}
                </View>
              </View>

              {/* Category */}
              <View style={{ marginBottom: 32 }}>
                <Text
                  style={{
                    color: colors.textColor,
                    fontSize: 18,
                    fontWeight: '600',
                    marginBottom: 16,
                  }}
                >
                  Category
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: 8,
                  }}
                >
                  {CATEGORIES.map((category) => (
                    <FilterChip
                      key={category}
                      label={category}
                      isActive={filters.categories.includes(category)}
                      onPress={() => handleToggleCategory(category)}
                    />
                  ))}
                </View>
              </View>

              {/* Brand */}
              <View style={{ marginBottom: 32 }}>
                <Text
                  style={{
                    color: colors.textColor,
                    fontSize: 18,
                    fontWeight: '600',
                    marginBottom: 16,
                  }}
                >
                  Brand
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: 8,
                  }}
                >
                  {POPULAR_BRANDS.map((brand) => (
                    <FilterChip
                      key={brand}
                      label={brand}
                      isActive={filters.brands.includes(brand)}
                      onPress={() => handleToggleBrand(brand)}
                    />
                  ))}
                </View>
              </View>

              {/* Sort By */}
              <View style={{ marginBottom: 32 }}>
                <Text
                  style={{
                    color: colors.textColor,
                    fontSize: 18,
                    fontWeight: '600',
                    marginBottom: 16,
                  }}
                >
                  Sort By
                </Text>
                <View style={{ gap: 12 }}>
                  {SORT_OPTIONS.map((option) => (
                    <Pressable
                      key={option.value}
                      onPress={() =>
                        onFiltersChange({ ...filters, sortBy: option.value })
                      }
                    >
                      {({ pressed }) => (
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            backgroundColor:
                              filters.sortBy === option.value
                                ? '#EC4899' + '20'
                                : colors.inputBackground,
                            borderRadius: 12,
                            padding: 16,
                            borderWidth: 2,
                            borderColor:
                              filters.sortBy === option.value
                                ? '#EC4899'
                                : 'transparent',
                            opacity: pressed ? 0.8 : 1,
                          }}
                        >
                          <Text
                            style={{
                              color: colors.textColor,
                              fontSize: 16,
                              fontWeight:
                                filters.sortBy === option.value
                                  ? '600'
                                  : '400',
                            }}
                          >
                            {option.label}
                          </Text>
                          {filters.sortBy === option.value && (
                            <Ionicons
                              name="checkmark-circle"
                              size={24}
                              color="#EC4899"
                            />
                          )}
                        </View>
                      )}
                    </Pressable>
                  ))}
                </View>
              </View>
            </ScrollView>

            {/* Footer Buttons */}
            <View
              style={{
                paddingTop: 16,
                paddingBottom: Math.max(insets.bottom, 24),
                paddingHorizontal: Math.max(insets.left, 24),
                paddingRight: Math.max(insets.right, 24),
                borderTopWidth: 1,
                borderTopColor: colors.dividerColor,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  gap: 12,
                }}
              >
              <Pressable
                onPress={handleReset}
                style={{
                  flex: 1,
                  backgroundColor: colors.inputBackground,
                  borderRadius: 12,
                  paddingVertical: 16,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: colors.borderColor,
                }}
              >
                <Text
                  style={{
                    color: colors.textColor,
                    fontSize: 16,
                    fontWeight: '600',
                  }}
                >
                  Reset
                </Text>
              </Pressable>
              <Pressable
                onPress={handleApply}
                style={{
                  flex: 1,
                  backgroundColor: '#EC4899',
                  borderRadius: 12,
                  paddingVertical: 16,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontSize: 16,
                    fontWeight: '600',
                  }}
                >
                  Apply Filters
                </Text>
              </Pressable>
              </View>
            </View>
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

