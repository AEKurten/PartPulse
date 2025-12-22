import { BrandModelSelector } from '@/components/brand-model-selector';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../stores/useAuthStore';

const categories = ['GPU', 'CPU', 'RAM', 'Storage', 'Motherboard', 'PSU', 'Cooling', 'Case', 'Other'];
const conditions = ['A+ (Like New)', 'A (Excellent)', 'B (Good)', 'C (Fair)', 'D (Poor)'];

export default function SellStep1Screen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [condition, setCondition] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showConditionDropdown, setShowConditionDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false)

  // Focus states
  const [nameFocused, setNameFocused] = useState(false);
  const [descriptionFocused, setDescriptionFocused] = useState(false);
  const [priceFocused, setPriceFocused] = useState(false);

  const handleNext = async () => {
    // Basic validation
    if (!itemName.trim() || !category.trim() || !brand.trim() || !model.trim() || !condition.trim() || !description.trim()) {
      Alert.alert('Error', 'Please fill in all required fields (including brand and model).');
      return;
    }

    const priceNumber = parseFloat(price);
    if (priceNumber) {
      if (isNaN(priceNumber) || priceNumber < 0) {
        Alert.alert('Error', 'Please enter a valid positive price.');
        return;
      }
    }

    //user id 
    const userId = useAuthStore.getState().user?.id;

    if (!userId) {
      Alert.alert('Error', 'User not authenticated.');
      router.replace('/auth/login');
      return;
    }

    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('products')
        .insert([
          {
            seller_id: userId,
            name: itemName,
            description: description,
            price: parseFloat(price),
            condition: condition.split(' ')[0], // Store only the grade letter
            category: category,
            brand: brand,
            model: model,
            status: 'active', // Set to active immediately after creation
          },
        ]).select();

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error('Failed to create product listing.');
      }

      const productId = data[0].id;
      router.push({
        pathname: '/sell/step2',
        params: { productId },
      });
    }
    catch (error) {
      console.error('Error creating listing:', error);
      Alert.alert('Error', 'There was an error creating your listing. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: colors.backgroundColor }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
    >
      <StatusBar style={colors.statusBarStyle} />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View
          className="flex-1"
          style={{
            paddingTop: insets.top + 24,
            paddingBottom: insets.bottom + 32,
            paddingLeft: Math.max(insets.left, 24),
            paddingRight: Math.max(insets.right, 24),
          }}
        >
          {/* Header */}
          <View style={{ marginBottom: 32 }}>
            <Pressable
              onPress={() => router.back()}
              style={{ marginBottom: 24, alignSelf: 'flex-start' }}
            >
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
                <Ionicons name="add-circle" size={24} color="#EC4899" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.textColor, fontSize: 28, fontWeight: 'bold', marginBottom: 4 }}>
                  List Your Item
                </Text>
                <Text style={{ color: colors.secondaryTextColor, fontSize: 14 }}>
                  Tell us about what you're selling
                </Text>
              </View>
            </View>
          </View>

          {/* Item Name */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: colors.textColor, fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
              Item Name *
            </Text>
            <TextInput
              placeholder="e.g., RTX 4090, Ryzen 9 7950X"
              placeholderTextColor={colors.secondaryTextColor}
              value={itemName}
              onChangeText={setItemName}
              onFocus={() => setNameFocused(true)}
              onBlur={() => setNameFocused(false)}
              autoCapitalize="words"
              returnKeyType="next"
              blurOnSubmit={false}
              style={{
                backgroundColor: colors.cardBackground,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 16,
                fontSize: 16,
                color: colors.textColor,
                borderWidth: nameFocused ? 2 : 1,
                borderColor: nameFocused ? '#EC4899' : colors.borderColor,
              }}
            />
          </View>

          {/* Category Dropdown */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: colors.textColor, fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
              Category *
            </Text>
            <Pressable
              onPress={() => {
                setShowCategoryDropdown(!showCategoryDropdown);
                setShowConditionDropdown(false);
              }}
            >
              <View
                style={{
                  backgroundColor: colors.cardBackground,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderWidth: showCategoryDropdown ? 2 : 1,
                  borderColor: showCategoryDropdown ? '#EC4899' : colors.borderColor,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: category ? colors.textColor : colors.secondaryTextColor,
                  }}
                >
                  {category || 'Select category'}
                </Text>
                <Ionicons
                  name={showCategoryDropdown ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={colors.secondaryTextColor}
                />
              </View>
            </Pressable>
            {showCategoryDropdown && (
              <View
                style={{
                  backgroundColor: colors.cardBackground,
                  borderRadius: 12,
                  marginTop: 8,
                  overflow: 'hidden',
                  borderWidth: 1,
                  borderColor: colors.borderColor,
                }}
              >
                {categories.map((cat) => (
                  <Pressable
                    key={cat}
                    onPress={() => {
                      setCategory(cat);
                      setShowCategoryDropdown(false);
                    }}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      borderBottomWidth: categories.indexOf(cat) < categories.length - 1 ? 1 : 0,
                      borderBottomColor: colors.borderColor,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        color: category === cat ? '#EC4899' : colors.textColor,
                      }}
                    >
                      {cat}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {/* Brand and Model Selector - Only show after category is selected */}
          {category && (
            <BrandModelSelector
              category={category}
              brand={brand}
              model={model}
              onBrandChange={setBrand}
              onModelChange={setModel}
            />
          )}

          {/* Condition Dropdown */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: colors.textColor, fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
              Condition *
            </Text>
            <Pressable
              onPress={() => {
                setShowConditionDropdown(!showConditionDropdown);
                setShowCategoryDropdown(false);
              }}
            >
              <View
                style={{
                  backgroundColor: colors.cardBackground,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderWidth: showConditionDropdown ? 2 : 1,
                  borderColor: showConditionDropdown ? '#EC4899' : colors.borderColor,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: condition ? colors.textColor : colors.secondaryTextColor,
                  }}
                >
                  {condition || 'Select condition'}
                </Text>
                <Ionicons
                  name={showConditionDropdown ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={colors.secondaryTextColor}
                />
              </View>
            </Pressable>
            {showConditionDropdown && (
              <View
                style={{
                  backgroundColor: colors.cardBackground,
                  borderRadius: 12,
                  marginTop: 8,
                  overflow: 'hidden',
                  borderWidth: 1,
                  borderColor: colors.borderColor,
                }}
              >
                {conditions.map((cond) => (
                  <Pressable
                    key={cond}
                    onPress={() => {
                      setCondition(cond);
                      setShowConditionDropdown(false);
                    }}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      borderBottomWidth: conditions.indexOf(cond) < conditions.length - 1 ? 1 : 0,
                      borderBottomColor: colors.borderColor,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        color: condition === cond ? '#EC4899' : colors.textColor,
                      }}
                    >
                      {cond}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {/* Description */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: colors.textColor, fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
              Description *
            </Text>
            <TextInput
              placeholder="Describe your item, any issues, usage history, etc."
              placeholderTextColor={colors.secondaryTextColor}
              value={description}
              onChangeText={setDescription}
              onFocus={() => setDescriptionFocused(true)}
              onBlur={() => setDescriptionFocused(false)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              returnKeyType="next"
              blurOnSubmit={false}
              style={{
                backgroundColor: colors.cardBackground,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 16,
                fontSize: 16,
                color: colors.textColor,
                minHeight: 120,
                borderWidth: descriptionFocused ? 2 : 1,
                borderColor: descriptionFocused ? '#EC4899' : colors.borderColor,
              }}
            />
          </View>

          {/* Price (Optional) */}
          <View style={{ marginBottom: 32 }}>
            <Text style={{ color: colors.textColor, fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
              Asking Price (Optional)
            </Text>
            <Text style={{ color: colors.secondaryTextColor, fontSize: 12, marginBottom: 8 }}>
              Leave blank to get AI price suggestion
            </Text>
            <View style={{ position: 'relative' }}>
              <Text
                style={{
                  position: 'absolute',
                  left: 16,
                  top: 16,
                  fontSize: 16,
                  color: colors.secondaryTextColor,
                  zIndex: 1,
                }}
              >
                $
              </Text>
              <TextInput
                placeholder="0.00"
                placeholderTextColor={colors.secondaryTextColor}
                value={price}
                onChangeText={setPrice}
                onFocus={() => setPriceFocused(true)}
                onBlur={() => setPriceFocused(false)}
                keyboardType="decimal-pad"
                returnKeyType="done"
                style={{
                  backgroundColor: colors.cardBackground,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingLeft: 32,
                  paddingVertical: 16,
                  fontSize: 16,
                  color: colors.textColor,
                  borderWidth: priceFocused ? 2 : 1,
                  borderColor: priceFocused ? '#EC4899' : colors.borderColor,
                }}
              />
            </View>
          </View>

          {/* Next Button */}
          <Pressable
            onPress={handleNext}
            disabled={!itemName || !category || !brand || !model || !condition || !description}
            style={{ width: '100%' }}
          >
            {({ pressed }) => (
              <LinearGradient
                colors={["#EC4899", "#F97316"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  borderRadius: 16,
                  height: 56,
                  width: '100%',
                  opacity: (!itemName || !category || !brand || !model || !condition || !description) ? 0.5 : pressed ? 0.8 : 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text className="text-white text-lg font-bold">
                  Continue
                </Text>
              </LinearGradient>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
