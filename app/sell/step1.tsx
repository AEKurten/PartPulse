import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const categories = ['GPU', 'CPU', 'RAM', 'Storage', 'Motherboard', 'PSU', 'Cooling', 'Case', 'Other'];
const conditions = ['A+ (Like New)', 'A (Excellent)', 'B (Good)', 'C (Fair)', 'D (Poor)'];

export default function SellStep1Screen() {
  const insets = useSafeAreaInsets();
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showConditionDropdown, setShowConditionDropdown] = useState(false);
  
  // Focus states
  const [nameFocused, setNameFocused] = useState(false);
  const [descriptionFocused, setDescriptionFocused] = useState(false);
  const [priceFocused, setPriceFocused] = useState(false);

  const handleNext = () => {
    // Basic validation
    if (!itemName || !category || !condition || !description) {
      // Show error - for now just return
      return;
    }
    router.push('/sell/step2');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#0F0E11' }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
    >
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
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
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
                <Text style={{ color: '#FFFFFF', fontSize: 28, fontWeight: 'bold', marginBottom: 4 }}>
                  List Your Item
                </Text>
                <Text style={{ color: '#D1D5DB', fontSize: 14 }}>
                  Tell us about what you're selling
                </Text>
              </View>
            </View>
          </View>

          {/* Item Name */}
          <View style={{ marginBottom: 16 }}>
            <Text className="text-white text-sm font-semibold mb-2">
              Item Name *
            </Text>
            <TextInput
              placeholder="e.g., RTX 4090, Ryzen 9 7950X"
              placeholderTextColor="#9CA3AF"
              value={itemName}
              onChangeText={setItemName}
              onFocus={() => setNameFocused(true)}
              onBlur={() => setNameFocused(false)}
              autoCapitalize="words"
              returnKeyType="next"
              blurOnSubmit={false}
              style={{
                backgroundColor: '#2B2E36',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 16,
                fontSize: 16,
                color: '#FFFFFF',
                borderWidth: nameFocused ? 2 : 0,
                borderColor: nameFocused ? '#EC4899' : 'transparent',
              }}
            />
          </View>

          {/* Category Dropdown */}
          <View style={{ marginBottom: 16 }}>
            <Text className="text-white text-sm font-semibold mb-2">
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
                  backgroundColor: '#2B2E36',
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderWidth: showCategoryDropdown ? 2 : 0,
                  borderColor: showCategoryDropdown ? '#EC4899' : 'transparent',
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: category ? '#FFFFFF' : '#9CA3AF',
                  }}
                >
                  {category || 'Select category'}
                </Text>
                <Ionicons
                  name={showCategoryDropdown ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#9CA3AF"
                />
              </View>
            </Pressable>
            {showCategoryDropdown && (
              <View
                style={{
                  backgroundColor: '#2B2E36',
                  borderRadius: 12,
                  marginTop: 8,
                  overflow: 'hidden',
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
                      borderBottomColor: '#1F2937',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        color: category === cat ? '#EC4899' : '#FFFFFF',
                      }}
                    >
                      {cat}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {/* Condition Dropdown */}
          <View style={{ marginBottom: 16 }}>
            <Text className="text-white text-sm font-semibold mb-2">
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
                  backgroundColor: '#2B2E36',
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderWidth: showConditionDropdown ? 2 : 0,
                  borderColor: showConditionDropdown ? '#EC4899' : 'transparent',
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: condition ? '#FFFFFF' : '#9CA3AF',
                  }}
                >
                  {condition || 'Select condition'}
                </Text>
                <Ionicons
                  name={showConditionDropdown ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#9CA3AF"
                />
              </View>
            </Pressable>
            {showConditionDropdown && (
              <View
                style={{
                  backgroundColor: '#2B2E36',
                  borderRadius: 12,
                  marginTop: 8,
                  overflow: 'hidden',
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
                      borderBottomColor: '#1F2937',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        color: condition === cond ? '#EC4899' : '#FFFFFF',
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
            <Text className="text-white text-sm font-semibold mb-2">
              Description *
            </Text>
            <TextInput
              placeholder="Describe your item, any issues, usage history, etc."
              placeholderTextColor="#9CA3AF"
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
                backgroundColor: '#2B2E36',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 16,
                fontSize: 16,
                color: '#FFFFFF',
                minHeight: 120,
                borderWidth: descriptionFocused ? 2 : 0,
                borderColor: descriptionFocused ? '#EC4899' : 'transparent',
              }}
            />
          </View>

          {/* Price (Optional) */}
          <View style={{ marginBottom: 32 }}>
            <Text className="text-white text-sm font-semibold mb-2">
              Asking Price (Optional)
            </Text>
            <Text className="text-neutral-400 text-xs mb-2">
              Leave blank to get AI price suggestion
            </Text>
            <View style={{ position: 'relative' }}>
              <Text
                style={{
                  position: 'absolute',
                  left: 16,
                  top: 16,
                  fontSize: 16,
                  color: '#9CA3AF',
                  zIndex: 1,
                }}
              >
                $
              </Text>
              <TextInput
                placeholder="0.00"
                placeholderTextColor="#9CA3AF"
                value={price}
                onChangeText={setPrice}
                onFocus={() => setPriceFocused(true)}
                onBlur={() => setPriceFocused(false)}
                keyboardType="decimal-pad"
                returnKeyType="done"
                style={{
                  backgroundColor: '#2B2E36',
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingLeft: 32,
                  paddingVertical: 16,
                  fontSize: 16,
                  color: '#FFFFFF',
                  borderWidth: priceFocused ? 2 : 0,
                  borderColor: priceFocused ? '#EC4899' : 'transparent',
                }}
              />
            </View>
          </View>

          {/* Next Button */}
          <Pressable
            onPress={handleNext}
            disabled={!itemName || !category || !condition || !description}
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
                  opacity: (!itemName || !category || !condition || !description) ? 0.5 : pressed ? 0.8 : 1,
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
