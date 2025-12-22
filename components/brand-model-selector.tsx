import { useThemeColors } from '@/hooks/use-theme-colors';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

type BrandModelSelectorProps = {
  category: string;
  brand: string;
  model: string;
  onBrandChange: (brand: string) => void;
  onModelChange: (model: string) => void;
};

export function BrandModelSelector({
  category,
  brand,
  model,
  onBrandChange,
  onModelChange,
}: BrandModelSelectorProps) {
  const colors = useThemeColors();
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);
  const [models, setModels] = useState<{ id: string; name: string }[]>([]);
  const [brandSearch, setBrandSearch] = useState('');
  const [modelSearch, setModelSearch] = useState('');
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [isAddingBrand, setIsAddingBrand] = useState(false);
  const [isAddingModel, setIsAddingModel] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [newModelName, setNewModelName] = useState('');

  // Fetch brands when category changes
  useEffect(() => {
    const fetchBrands = async () => {
      if (!category) return;

      try {
        // Fetch brands for this category or general brands
        const { data, error } = await supabase
          .from('brands')
          .select('id, name')
          .or(`category.eq.${category},category.is.null`)
          .order('name');

        if (error) throw error;
        setBrands(data || []);
      } catch (error) {
        console.error('Error fetching brands:', error);
      }
    };

    fetchBrands();
  }, [category]);

  // Fetch models when brand changes
  useEffect(() => {
    const fetchModels = async () => {
      if (!brand || !category) {
        setModels([]);
        return;
      }

      try {
        // Find brand ID
        const brandData = brands.find((b) => b.name === brand);
        if (!brandData) {
          setModels([]);
          return;
        }

        // Fetch models for this brand and category
        const { data, error } = await supabase
          .from('models')
          .select('id, name')
          .eq('brand_id', brandData.id)
          .or(`category.eq.${category},category.is.null`)
          .order('name');

        if (error) throw error;
        setModels(data || []);
      } catch (error) {
        console.error('Error fetching models:', error);
        setModels([]);
      }
    };

    fetchModels();
  }, [brand, category, brands]);

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(brandSearch.toLowerCase())
  );

  const filteredModels = models.filter((m) =>
    m.name.toLowerCase().includes(modelSearch.toLowerCase())
  );

  const handleAddBrand = async () => {
    if (!newBrandName.trim()) {
      Alert.alert('Error', 'Please enter a brand name');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('brands')
        .insert([{ name: newBrandName.trim(), category }])
        .select()
        .single();

      if (error) {
        // If brand already exists, just use it
        if (error.code === '23505') {
          const { data: existingBrand } = await supabase
            .from('brands')
            .select('id, name')
            .eq('name', newBrandName.trim())
            .single();

          if (existingBrand) {
            setBrands([...brands, existingBrand]);
            onBrandChange(existingBrand.name);
            setNewBrandName('');
            setIsAddingBrand(false);
            return;
        }
        }
        throw error;
      }

      setBrands([...brands, data]);
      onBrandChange(data.name);
      setNewBrandName('');
      setIsAddingBrand(false);
      Alert.alert('Success', 'Brand added successfully');
    } catch (error: any) {
      console.error('Error adding brand:', error);
      Alert.alert('Error', error.message || 'Failed to add brand');
    }
  };

  const handleAddModel = async () => {
    if (!newModelName.trim()) {
      Alert.alert('Error', 'Please enter a model name');
      return;
    }

    if (!brand) {
      Alert.alert('Error', 'Please select a brand first');
      return;
    }

    try {
      const brandData = brands.find((b) => b.name === brand);
      if (!brandData) {
        Alert.alert('Error', 'Brand not found');
        return;
      }

      const { data, error } = await supabase
        .from('models')
        .insert([{ brand_id: brandData.id, name: newModelName.trim(), category }])
        .select()
        .single();

      if (error) {
        // If model already exists, just use it
        if (error.code === '23505') {
          const { data: existingModel } = await supabase
            .from('models')
            .select('id, name')
            .eq('brand_id', brandData.id)
            .eq('name', newModelName.trim())
            .single();

          if (existingModel) {
            setModels([...models, existingModel]);
            onModelChange(existingModel.name);
            setNewModelName('');
            setIsAddingModel(false);
            return;
          }
        }
        throw error;
      }

      setModels([...models, data]);
      onModelChange(data.name);
      setNewModelName('');
      setIsAddingModel(false);
      Alert.alert('Success', 'Model added successfully');
    } catch (error: any) {
      console.error('Error adding model:', error);
      Alert.alert('Error', error.message || 'Failed to add model');
    }
  };

  return (
    <View>
      {/* Brand Selector */}
      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: colors.textColor, fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
          Brand *
        </Text>
        {!isAddingBrand ? (
          <>
            <Pressable
              onPress={() => {
                setShowBrandDropdown(!showBrandDropdown);
                setShowModelDropdown(false);
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
                  borderWidth: showBrandDropdown ? 2 : 1,
                  borderColor: showBrandDropdown ? '#EC4899' : colors.borderColor,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: brand ? colors.textColor : colors.secondaryTextColor,
                  }}
                >
                  {brand || 'Select brand'}
                </Text>
                <Ionicons
                  name={showBrandDropdown ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={colors.secondaryTextColor}
                />
              </View>
            </Pressable>
            {showBrandDropdown && (
              <View
                style={{
                  backgroundColor: colors.cardBackground,
                  borderRadius: 12,
                  marginTop: 8,
                  maxHeight: 200,
                  borderWidth: 1,
                  borderColor: colors.borderColor,
                }}
              >
                {/* Search Input */}
                <View style={{ padding: 8 }}>
                  <TextInput
                    placeholder="Search brands..."
                    placeholderTextColor={colors.secondaryTextColor}
                    value={brandSearch}
                    onChangeText={setBrandSearch}
                    style={{
                      backgroundColor: colors.iconBackground,
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      fontSize: 14,
                      color: colors.textColor,
                    }}
                  />
                </View>
                <ScrollView style={{ maxHeight: 150 }}>
                  {filteredBrands.map((b) => (
                    <Pressable
                      key={b.id}
                      onPress={() => {
                        onBrandChange(b.name);
                        setShowBrandDropdown(false);
                        setBrandSearch('');
                        onModelChange(''); // Reset model when brand changes
                      }}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 14,
                        borderBottomWidth: 1,
                        borderBottomColor: colors.borderColor,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          color: brand === b.name ? '#EC4899' : colors.textColor,
                          fontWeight: brand === b.name ? '600' : '400',
                        }}
                      >
                        {b.name}
                      </Text>
                    </Pressable>
                  ))}
                  {/* Add New Brand Option */}
                  <Pressable
                    onPress={() => {
                      setIsAddingBrand(true);
                      setShowBrandDropdown(false);
                    }}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                      borderTopWidth: 1,
                      borderTopColor: colors.borderColor,
                    }}
                  >
                    <Ionicons name="add-circle-outline" size={20} color="#EC4899" />
                    <Text style={{ fontSize: 16, color: '#EC4899', fontWeight: '600' }}>
                      Add New Brand
                    </Text>
                  </Pressable>
                </ScrollView>
              </View>
            )}
          </>
        ) : (
          <View
            style={{
              backgroundColor: colors.cardBackground,
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: colors.borderColor,
            }}
          >
            <TextInput
              placeholder="Enter brand name"
              placeholderTextColor={colors.secondaryTextColor}
              value={newBrandName}
              onChangeText={setNewBrandName}
              autoCapitalize="words"
              style={{
                backgroundColor: colors.iconBackground,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 12,
                fontSize: 16,
                color: colors.textColor,
                marginBottom: 12,
              }}
            />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Pressable
                onPress={handleAddBrand}
                style={{
                  flex: 1,
                  backgroundColor: '#EC4899',
                  borderRadius: 8,
                  paddingVertical: 12,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>Add</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setIsAddingBrand(false);
                  setNewBrandName('');
                }}
                style={{
                  flex: 1,
                  backgroundColor: colors.iconBackground,
                  borderRadius: 8,
                  paddingVertical: 12,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: colors.textColor, fontSize: 14, fontWeight: '600' }}>
                  Cancel
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>

      {/* Model Selector */}
      {brand && (
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: colors.textColor, fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
            Model *
          </Text>
          {!isAddingModel ? (
            <>
              <Pressable
                onPress={() => {
                  setShowModelDropdown(!showModelDropdown);
                  setShowBrandDropdown(false);
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
                    borderWidth: showModelDropdown ? 2 : 1,
                    borderColor: showModelDropdown ? '#EC4899' : colors.borderColor,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color: model ? colors.textColor : colors.secondaryTextColor,
                    }}
                  >
                    {model || 'Select model'}
                  </Text>
                  <Ionicons
                    name={showModelDropdown ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={colors.secondaryTextColor}
                  />
                </View>
              </Pressable>
              {showModelDropdown && (
                <View
                  style={{
                    backgroundColor: colors.cardBackground,
                    borderRadius: 12,
                    marginTop: 8,
                    maxHeight: 200,
                    borderWidth: 1,
                    borderColor: colors.borderColor,
                  }}
                >
                  {/* Search Input */}
                  <View style={{ padding: 8 }}>
                    <TextInput
                      placeholder="Search models..."
                      placeholderTextColor={colors.secondaryTextColor}
                      value={modelSearch}
                      onChangeText={setModelSearch}
                      style={{
                        backgroundColor: colors.iconBackground,
                        borderRadius: 8,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        fontSize: 14,
                        color: colors.textColor,
                      }}
                    />
                  </View>
                  <ScrollView style={{ maxHeight: 150 }}>
                    {filteredModels.map((m) => (
                      <Pressable
                        key={m.id}
                        onPress={() => {
                          onModelChange(m.name);
                          setShowModelDropdown(false);
                          setModelSearch('');
                        }}
                        style={{
                          paddingHorizontal: 16,
                          paddingVertical: 14,
                          borderBottomWidth: 1,
                          borderBottomColor: colors.borderColor,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 16,
                            color: model === m.name ? '#EC4899' : colors.textColor,
                            fontWeight: model === m.name ? '600' : '400',
                          }}
                        >
                          {m.name}
                        </Text>
                      </Pressable>
                    ))}
                    {/* Add New Model Option */}
                    <Pressable
                      onPress={() => {
                        setIsAddingModel(true);
                        setShowModelDropdown(false);
                      }}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 14,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                        borderTopWidth: 1,
                        borderTopColor: colors.borderColor,
                      }}
                    >
                      <Ionicons name="add-circle-outline" size={20} color="#EC4899" />
                      <Text style={{ fontSize: 16, color: '#EC4899', fontWeight: '600' }}>
                        Add New Model
                      </Text>
                    </Pressable>
                  </ScrollView>
                </View>
              )}
            </>
          ) : (
            <View
              style={{
                backgroundColor: colors.cardBackground,
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.borderColor,
              }}
            >
              <TextInput
                placeholder="Enter model name"
                placeholderTextColor={colors.secondaryTextColor}
                value={newModelName}
                onChangeText={setNewModelName}
                autoCapitalize="words"
                style={{
                  backgroundColor: colors.iconBackground,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: colors.textColor,
                  marginBottom: 12,
                }}
              />
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Pressable
                  onPress={handleAddModel}
                  style={{
                    flex: 1,
                    backgroundColor: '#EC4899',
                    borderRadius: 8,
                    paddingVertical: 12,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>Add</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setIsAddingModel(false);
                    setNewModelName('');
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: colors.iconBackground,
                    borderRadius: 8,
                    paddingVertical: 12,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: colors.textColor, fontSize: 14, fontWeight: '600' }}>
                    Cancel
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

