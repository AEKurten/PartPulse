import { BrandModelSelector } from '@/components/brand-model-selector';
import { TextSizes, PaddingSizes, getPadding } from '@/constants/platform-styles';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { getProduct } from '@/lib/database';
import { supabase } from '@/lib/supabase';
import { getProductAnalytics } from '@/lib/analytics';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from './stores/useAuthStore';
import type { Product } from '@/lib/database.types';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import { ActivityIndicator } from 'react-native';

const categories = ['GPU', 'CPU', 'RAM', 'Storage', 'Motherboard', 'PSU', 'Cooling', 'Case', 'Other'];
const conditions = ['A+ (Like New)', 'A (Excellent)', 'B (Good)', 'C (Fair)', 'D (Poor)'];

export default function EditListingScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const { user } = useAuthStore();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Analytics state
  const [analytics, setAnalytics] = useState<{
    viewCount: number;
    clickCount: number;
    shareCount: number;
    impressionCount: number;
  } | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  
  // Form state
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [condition, setCondition] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showConditionDropdown, setShowConditionDropdown] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  // Focus states
  const [nameFocused, setNameFocused] = useState(false);
  const [descriptionFocused, setDescriptionFocused] = useState(false);
  const [priceFocused, setPriceFocused] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        Alert.alert('Error', 'Product ID is missing');
        router.back();
        return;
      }

      try {
        setLoading(true);
        const productData = await getProduct(productId);
        
        if (!productData) {
          Alert.alert('Error', 'Product not found');
          router.back();
          return;
        }

        // Check if user owns this product
        if (productData.seller_id !== user?.id) {
          Alert.alert('Error', 'You can only edit your own listings');
          router.back();
          return;
        }

        setProduct(productData);
        setItemName(productData.name);
        setCategory(productData.category);
        setBrand(productData.brand || '');
        setModel(productData.model || '');
        setCondition(productData.condition);
        setDescription(productData.description || '');
        setPrice(productData.price.toString());
        
        // Load images from Supabase Storage URLs
        if (productData.images && productData.images.length > 0) {
          setPhotos(productData.images);
        }

        // Fetch analytics
        await fetchAnalytics(productId);
      } catch (error) {
        console.error('Error fetching product:', error);
        Alert.alert('Error', 'Failed to load product');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, user?.id]);

  const fetchAnalytics = async (productId: string) => {
    try {
      setLoadingAnalytics(true);
      const analyticsData = await getProductAnalytics(productId);
      if (analyticsData) {
        setAnalytics(analyticsData);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to add photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      const newPhotos = result.assets.map(asset => asset.uri);
      setPhotos([...photos, ...newPhotos]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const compressImage = async (uri: string): Promise<string> => {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) {
      throw new Error('File does not exist');
    }

    let currentUri = uri;
    let currentSize = fileInfo.size || 0;
    let quality = 0.8;

    const targetSize = 2 * 1024 * 1024; // 2MB

    while (currentSize > targetSize && quality > 0.1) {
      const manipResult = await ImageManipulator.manipulateAsync(
        currentUri,
        [{ resize: { width: 1920 } }],
        { compress: quality, format: ImageManipulator.SaveFormat.JPEG, base64: false }
      );
      currentUri = manipResult.uri;
      const newFileInfo = await FileSystem.getInfoAsync(currentUri);
      currentSize = newFileInfo.size || 0;
      quality -= 0.1;
    }
    return currentUri;
  };

  const uploadImages = async (): Promise<string[]> => {
    if (photos.length === 0) return [];

    setIsUploadingImages(true);
    const uploadedUrls: string[] = [];

    try {
      for (const uri of photos) {
        // Check if it's already a URL (from existing images)
        if (uri.startsWith('http://') || uri.startsWith('https://')) {
          uploadedUrls.push(uri);
          continue;
        }

        // Compress and upload new images
        const compressedUri = await compressImage(uri);
        const base64Data = await FileSystem.readAsStringAsync(compressedUri, {
          encoding: 'base64',
        });

        const fileExtension = uri.split('.').pop()?.toLowerCase() || 'jpg';
        const contentType = fileExtension === 'png' ? 'image/png' : 'image/jpeg';
        const filename = `product_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExtension}`;

        // Convert base64 to ArrayBuffer
        let binaryString: string;
        if (Platform.OS === 'web') {
          binaryString = atob(base64Data);
        } else {
          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
          let output = '';
          let i = 0;
          const cleanBase64 = base64Data.replace(/[^A-Za-z0-9\+\/\=]/g, '');
          while (i < cleanBase64.length) {
            const enc1 = chars.indexOf(cleanBase64.charAt(i++));
            const enc2 = chars.indexOf(cleanBase64.charAt(i++));
            const enc3 = chars.indexOf(cleanBase64.charAt(i++));
            const enc4 = chars.indexOf(cleanBase64.charAt(i++));
            const chr1 = (enc1 << 2) | (enc2 >> 4);
            const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            const chr3 = ((enc3 & 3) << 6) | enc4;
            output += String.fromCharCode(chr1);
            if (enc3 !== 64) output += String.fromCharCode(chr2);
            if (enc4 !== 64) output += String.fromCharCode(chr3);
          }
          binaryString = output;
        }

        const byteNumbers = new Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          byteNumbers[i] = binaryString.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const arrayBuffer = byteArray.buffer;

        const { error: uploadError } = await supabase.storage
          .from('Product-images')
          .upload(filename, arrayBuffer, {
            cacheControl: '3600',
            upsert: false,
            contentType,
          });

        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          continue;
        }

        const publicUrl = supabase.storage
          .from('Product-images')
          .getPublicUrl(filename);
        uploadedUrls.push(publicUrl.data.publicUrl);
      }
    } finally {
      setIsUploadingImages(false);
    }

    return uploadedUrls;
  };

  const handleSave = async () => {
    // Validation
    if (!itemName.trim() || !category.trim() || !brand.trim() || !model.trim() || !condition.trim() || !description.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const priceNumber = parseFloat(price);
    if (!priceNumber || isNaN(priceNumber) || priceNumber < 0) {
      Alert.alert('Error', 'Please enter a valid positive price');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    try {
      setSaving(true);

      // Upload new images (only uploads local files, keeps existing URLs)
      // uploadImages() already preserves existing URLs and only uploads new ones
      const allImageUrls = await uploadImages();

      // Update product
      const { error } = await supabase
        .from('products')
        .update({
          name: itemName.trim(),
          description: description.trim(),
          price: priceNumber,
          condition: condition.split(' ')[0],
          category: category,
          brand: brand,
          model: model,
          images: allImageUrls.length > 0 ? allImageUrls : [],
          updated_at: new Date().toISOString(),
        })
        .eq('id', productId)
        .eq('seller_id', user.id);

      if (error) {
        throw error;
      }

      Alert.alert('Success', 'Listing updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Error updating listing:', error);
      Alert.alert('Error', `Failed to update listing: ${error.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleMarkAsSold = async () => {
    if (!user?.id || !productId) return;

    Alert.alert(
      'Mark as Sold',
      'Are you sure you want to mark this listing as sold?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark as Sold',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('products')
                .update({ status: 'sold' })
                .eq('id', productId)
                .eq('seller_id', user.id);

              if (error) throw error;

              // Refresh product data
              const updatedProduct = await getProduct(productId);
              if (updatedProduct) {
                setProduct(updatedProduct);
              }

              Alert.alert('Success', 'Listing marked as sold');
            } catch (error: any) {
              Alert.alert('Error', `Failed to update listing: ${error.message}`);
            }
          }
        }
      ]
    );
  };

  const handleReactivate = async () => {
    if (!user?.id || !productId) return;

    Alert.alert(
      'Reactivate Listing',
      'Are you sure you want to reactivate this listing? It will be visible to buyers again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reactivate',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('products')
                .update({ status: 'active' })
                .eq('id', productId)
                .eq('seller_id', user.id);

              if (error) throw error;

              // Refresh product data
              const updatedProduct = await getProduct(productId);
              if (updatedProduct) {
                setProduct(updatedProduct);
              }

              Alert.alert('Success', 'Listing reactivated and visible to buyers');
            } catch (error: any) {
              Alert.alert('Error', `Failed to reactivate listing: ${error.message}`);
            }
          }
        }
      ]
    );
  };

  const handlePause = async () => {
    if (!user?.id || !productId) return;

    Alert.alert(
      'Pause Listing',
      'Are you sure you want to pause this listing? It will be hidden from buyers until you resume it.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pause',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('products')
                .update({ status: 'paused' })
                .eq('id', productId)
                .eq('seller_id', user.id);

              if (error) throw error;

              // Refresh product data
              const updatedProduct = await getProduct(productId);
              if (updatedProduct) {
                setProduct(updatedProduct);
              }

              Alert.alert('Success', 'Listing paused and hidden from buyers');
            } catch (error: any) {
              Alert.alert('Error', `Failed to pause listing: ${error.message}`);
            }
          }
        }
      ]
    );
  };

  const handleResume = async () => {
    if (!user?.id || !productId) return;

    Alert.alert(
      'Resume Listing',
      'Are you sure you want to resume this listing? It will be visible to buyers again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Resume',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('products')
                .update({ status: 'active' })
                .eq('id', productId)
                .eq('seller_id', user.id);

              if (error) throw error;

              // Refresh product data
              const updatedProduct = await getProduct(productId);
              if (updatedProduct) {
                setProduct(updatedProduct);
              }

              Alert.alert('Success', 'Listing resumed and visible to buyers');
            } catch (error: any) {
              Alert.alert('Error', `Failed to resume listing: ${error.message}`);
            }
          }
        }
      ]
    );
  };

  const handlePublish = async () => {
    if (!user?.id || !productId) return;

    // Validate required fields before publishing
    if (!itemName.trim() || !category.trim() || !brand.trim() || !model.trim() || !condition.trim() || !description.trim()) {
      Alert.alert('Error', 'Please fill in all required fields before publishing');
      return;
    }

    const priceNumber = parseFloat(price);
    if (!priceNumber || isNaN(priceNumber) || priceNumber < 0) {
      Alert.alert('Error', 'Please enter a valid positive price');
      return;
    }

    if (photos.length === 0) {
      Alert.alert('Error', 'Please add at least one photo before publishing');
      return;
    }

    Alert.alert(
      'Publish Listing',
      'Are you sure you want to publish this listing? It will be visible to buyers.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Publish',
          onPress: async () => {
            try {
              setSaving(true);

              // Upload new images if any
              const allImageUrls = await uploadImages();

              // Update product status and details
              const { error } = await supabase
                .from('products')
                .update({
                  status: 'active',
                  name: itemName.trim(),
                  description: description.trim(),
                  price: priceNumber,
                  condition: condition.split(' ')[0],
                  category: category,
                  brand: brand,
                  model: model,
                  images: allImageUrls.length > 0 ? allImageUrls : photos,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', productId)
                .eq('seller_id', user.id);

              if (error) throw error;

              // Refresh product data
              const updatedProduct = await getProduct(productId);
              if (updatedProduct) {
                setProduct(updatedProduct);
              }

              Alert.alert('Success', 'Listing published and visible to buyers');
            } catch (error: any) {
              Alert.alert('Error', `Failed to publish listing: ${error.message}`);
            } finally {
              setSaving(false);
            }
          }
        }
      ]
    );
  };

  const handleDelete = async () => {
    if (!user?.id || !productId) return;

    Alert.alert(
      'Delete Listing',
      'Are you sure you want to delete this listing? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', productId)
                .eq('seller_id', user.id);

              if (error) throw error;

              Alert.alert('Success', 'Listing deleted', [
                { text: 'OK', onPress: () => router.back() }
              ]);
            } catch (error: any) {
              Alert.alert('Error', `Failed to delete listing: ${error.message}`);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.backgroundColor }}>
        <ActivityIndicator size="large" color="#EC4899" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: colors.backgroundColor }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
    >
      <StatusBar style={colors.statusBarStyle} />
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 140 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View
            style={{
              paddingTop: insets.top + PaddingSizes.lg,
              paddingBottom: getPadding(32),
              paddingLeft: Math.max(insets.left, PaddingSizes.lg),
              paddingRight: Math.max(insets.right, PaddingSizes.lg),
            }}
          >
            {/* Header */}
            <View style={{ marginBottom: getPadding(32) }}>
              <Pressable
                onPress={() => router.back()}
                style={{ marginBottom: PaddingSizes.lg, alignSelf: 'flex-start' }}
              >
                <Ionicons name="arrow-back" size={24} color={colors.textColor} />
              </Pressable>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: PaddingSizes.base }}>
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: '#EC4899' + '20',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: PaddingSizes.base,
                  }}
                >
                  <Ionicons name="create-outline" size={24} color="#EC4899" />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: PaddingSizes.sm, marginBottom: PaddingSizes.xs }}>
                    <Text style={{ color: colors.textColor, fontSize: TextSizes['3xl'], fontWeight: 'bold' }}>
                      Edit Listing
                    </Text>
                    {product && (
                      <View
                        style={{
                          backgroundColor: 
                            product.status === 'active' ? '#10B981' + '20' :
                            product.status === 'sold' ? '#EF4444' + '20' :
                            product.status === 'paused' ? '#6B7280' + '20' :
                            '#F59E0B' + '20',
                          borderRadius: 8,
                          paddingHorizontal: PaddingSizes.sm,
                          paddingVertical: PaddingSizes.xs,
                          borderWidth: 1,
                          borderColor:
                            product.status === 'active' ? '#10B981' :
                            product.status === 'sold' ? '#EF4444' :
                            product.status === 'paused' ? '#6B7280' :
                            '#F59E0B',
                        }}
                      >
                        <Text
                          style={{
                            color:
                              product.status === 'active' ? '#10B981' :
                              product.status === 'sold' ? '#EF4444' :
                              product.status === 'paused' ? '#6B7280' :
                              '#F59E0B',
                            fontSize: getFontSize(11),
                            fontWeight: '700',
                            textTransform: 'uppercase',
                          }}
                        >
                          {product.status === 'paused' ? 'Paused' : product.status}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={{ color: colors.secondaryTextColor, fontSize: TextSizes.sm }}>
                    Update your product details
                  </Text>
                </View>
              </View>
            </View>

            {/* Analytics Section */}
            {analytics !== null && (
              <View style={{ marginBottom: getPadding(32) }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: PaddingSizes.md }}>
                  <Text style={{ color: colors.textColor, fontSize: TextSizes.lg, fontWeight: 'bold' }}>
                    Listing Analytics
                  </Text>
                  <Pressable
                    onPress={() => productId && fetchAnalytics(productId)}
                    disabled={loadingAnalytics}
                    style={{
                      padding: PaddingSizes.sm,
                      borderRadius: 8,
                      backgroundColor: colors.cardBackground,
                      borderWidth: 1,
                      borderColor: colors.borderColor,
                    }}
                  >
                    <Ionicons
                      name="refresh"
                      size={20}
                      color={colors.textColor}
                      style={{ opacity: loadingAnalytics ? 0.5 : 1 }}
                    />
                  </Pressable>
                </View>
                <View
                  style={{
                    backgroundColor: colors.cardBackground,
                    borderRadius: 16,
                    padding: 20,
                    borderWidth: 1,
                    borderColor: colors.borderColor,
                  }}
                >
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
                    {/* Impressions */}
                    <View style={{ flex: 1, minWidth: '45%' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <View
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: '#3B82F6' + '20',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginRight: 12,
                          }}
                        >
                          <Ionicons name="eye-outline" size={20} color="#3B82F6" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: colors.secondaryTextColor, fontSize: TextSizes.xs, marginBottom: getPadding(2) }}>
                            Impressions
                          </Text>
                          {loadingAnalytics ? (
                            <ActivityIndicator size="small" color="#3B82F6" />
                          ) : (
                            <Text style={{ color: colors.textColor, fontSize: TextSizes.xl, fontWeight: 'bold' }}>
                              {analytics.impressionCount.toLocaleString()}
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>

                    {/* Views */}
                    <View style={{ flex: 1, minWidth: '45%' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <View
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: '#10B981' + '20',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginRight: 12,
                          }}
                        >
                          <Ionicons name="eye" size={20} color="#10B981" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: colors.secondaryTextColor, fontSize: TextSizes.xs, marginBottom: getPadding(2) }}>
                            Views
                          </Text>
                          {loadingAnalytics ? (
                            <ActivityIndicator size="small" color="#10B981" />
                          ) : (
                            <Text style={{ color: colors.textColor, fontSize: TextSizes.xl, fontWeight: 'bold' }}>
                              {analytics.viewCount.toLocaleString()}
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>

                    {/* Clicks */}
                    <View style={{ flex: 1, minWidth: '45%' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <View
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: '#EC4899' + '20',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginRight: 12,
                          }}
                        >
                          <Ionicons name="hand-left-outline" size={20} color="#EC4899" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: colors.secondaryTextColor, fontSize: TextSizes.xs, marginBottom: getPadding(2) }}>
                            Clicks
                          </Text>
                          {loadingAnalytics ? (
                            <ActivityIndicator size="small" color="#EC4899" />
                          ) : (
                            <Text style={{ color: colors.textColor, fontSize: TextSizes.xl, fontWeight: 'bold' }}>
                              {analytics.clickCount.toLocaleString()}
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>

                    {/* Shares */}
                    <View style={{ flex: 1, minWidth: '45%' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <View
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: '#F59E0B' + '20',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginRight: 12,
                          }}
                        >
                          <Ionicons name="share-social-outline" size={20} color="#F59E0B" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: colors.secondaryTextColor, fontSize: TextSizes.xs, marginBottom: getPadding(2) }}>
                            Shares
                          </Text>
                          {loadingAnalytics ? (
                            <ActivityIndicator size="small" color="#F59E0B" />
                          ) : (
                            <Text style={{ color: colors.textColor, fontSize: TextSizes.xl, fontWeight: 'bold' }}>
                              {analytics.shareCount.toLocaleString()}
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Item Name */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ color: colors.textColor, fontSize: TextSizes.base, fontWeight: '600', marginBottom: PaddingSizes.sm }}>
                Item Name *
              </Text>
              <TextInput
                placeholder="e.g., NVIDIA GeForce RTX 4090"
                placeholderTextColor={colors.secondaryTextColor}
                value={itemName}
                onChangeText={setItemName}
                onFocus={() => setNameFocused(true)}
                onBlur={() => setNameFocused(false)}
                style={{
                  backgroundColor: colors.cardBackground,
                  borderRadius: 12,
                  paddingHorizontal: PaddingSizes.md,
                  paddingVertical: getPadding(14),
                  fontSize: TextSizes.base,
                  color: colors.textColor,
                  borderWidth: 2,
                  borderColor: nameFocused ? '#EC4899' : colors.borderColor,
                }}
              />
            </View>

            {/* Category & Condition */}
            <View style={{ flexDirection: 'row', gap: 16, marginBottom: 24 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.textColor, fontSize: TextSizes.base, fontWeight: '600', marginBottom: PaddingSizes.sm }}>
                  Category *
                </Text>
                <Pressable
                  onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  style={{
                    backgroundColor: colors.cardBackground,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    borderWidth: 2,
                    borderColor: colors.borderColor,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: category ? colors.textColor : colors.secondaryTextColor, fontSize: TextSizes.base }}>
                    {category || 'Select category'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={colors.secondaryTextColor} />
                </Pressable>
                {showCategoryDropdown && (
                  <View
                    style={{
                      backgroundColor: colors.cardBackground,
                      borderRadius: 12,
                      marginTop: 8,
                      borderWidth: 1,
                      borderColor: colors.borderColor,
                      maxHeight: 200,
                    }}
                  >
                    <ScrollView>
                      {categories.map((cat) => (
                        <Pressable
                          key={cat}
                          onPress={() => {
                            setCategory(cat);
                            setShowCategoryDropdown(false);
                          }}
                          style={{
                            paddingHorizontal: 16,
                            paddingVertical: 12,
                            borderBottomWidth: 1,
                            borderBottomColor: colors.borderColor,
                          }}
                        >
                          <Text style={{ color: colors.textColor, fontSize: 16 }}>
                            {cat}
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.textColor, fontSize: TextSizes.base, fontWeight: '600', marginBottom: PaddingSizes.sm }}>
                  Condition *
                </Text>
                <Pressable
                  onPress={() => setShowConditionDropdown(!showConditionDropdown)}
                  style={{
                    backgroundColor: colors.cardBackground,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    borderWidth: 2,
                    borderColor: colors.borderColor,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: condition ? colors.textColor : colors.secondaryTextColor, fontSize: 16 }}>
                    {condition || 'Select condition'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={colors.secondaryTextColor} />
                </Pressable>
                {showConditionDropdown && (
                  <View
                    style={{
                      backgroundColor: colors.cardBackground,
                      borderRadius: 12,
                      marginTop: 8,
                      borderWidth: 1,
                      borderColor: colors.borderColor,
                      maxHeight: 200,
                    }}
                  >
                    <ScrollView>
                      {conditions.map((cond) => (
                        <Pressable
                          key={cond}
                          onPress={() => {
                            setCondition(cond);
                            setShowConditionDropdown(false);
                          }}
                          style={{
                            paddingHorizontal: 16,
                            paddingVertical: 12,
                            borderBottomWidth: 1,
                            borderBottomColor: colors.borderColor,
                          }}
                        >
                          <Text style={{ color: colors.textColor, fontSize: 16 }}>
                            {cond}
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            </View>

            {/* Brand & Model */}
            <View style={{ marginBottom: 24 }}>
              <BrandModelSelector
                category={category}
                brand={brand}
                model={model}
                onBrandChange={setBrand}
                onModelChange={setModel}
              />
            </View>

            {/* Description */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ color: colors.textColor, fontSize: TextSizes.base, fontWeight: '600', marginBottom: PaddingSizes.sm }}>
                Description *
              </Text>
              <TextInput
                placeholder="Describe your item in detail..."
                placeholderTextColor={colors.secondaryTextColor}
                value={description}
                onChangeText={setDescription}
                onFocus={() => setDescriptionFocused(true)}
                onBlur={() => setDescriptionFocused(false)}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                style={{
                  backgroundColor: colors.cardBackground,
                  borderRadius: 12,
                  paddingHorizontal: PaddingSizes.md,
                  paddingVertical: getPadding(14),
                  fontSize: TextSizes.base,
                  color: colors.textColor,
                  borderWidth: 2,
                  borderColor: descriptionFocused ? '#EC4899' : colors.borderColor,
                  minHeight: 120,
                }}
              />
            </View>

            {/* Price */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ color: colors.textColor, fontSize: TextSizes.base, fontWeight: '600', marginBottom: PaddingSizes.sm }}>
                Price (R) *
              </Text>
              <TextInput
                placeholder="0.00"
                placeholderTextColor={colors.secondaryTextColor}
                value={price}
                onChangeText={setPrice}
                onFocus={() => setPriceFocused(true)}
                onBlur={() => setPriceFocused(false)}
                keyboardType="decimal-pad"
                style={{
                  backgroundColor: colors.cardBackground,
                  borderRadius: 12,
                  paddingHorizontal: PaddingSizes.md,
                  paddingVertical: getPadding(14),
                  fontSize: TextSizes.base,
                  color: colors.textColor,
                  borderWidth: 2,
                  borderColor: priceFocused ? '#EC4899' : colors.borderColor,
                }}
              />
            </View>

            {/* Photos */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ color: colors.textColor, fontSize: TextSizes.base, fontWeight: '600', marginBottom: PaddingSizes.sm }}>
                Photos ({photos.length}/10)
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  {photos.map((uri, index) => (
                    <View key={index} style={{ position: 'relative', width: 100, height: 100 }}>
                      <Image
                        source={{ uri }}
                        style={{ width: 100, height: 100, borderRadius: 12 }}
                        contentFit="cover"
                      />
                      <Pressable
                        onPress={() => removePhoto(index)}
                        style={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          backgroundColor: 'rgba(0, 0, 0, 0.7)',
                          borderRadius: 16,
                          width: 28,
                          height: 28,
                          justifyContent: 'center',
                          alignItems: 'center',
                          zIndex: 1000,
                          elevation: 10,
                        }}
                      >
                        <Ionicons name="close" size={18} color="#FFFFFF" />
                      </Pressable>
                    </View>
                  ))}
                  {photos.length < 10 && (
                    <Pressable
                      onPress={pickImage}
                      style={{
                        width: 100,
                        height: 100,
                        borderRadius: 12,
                        backgroundColor: colors.cardBackground,
                        borderWidth: 2,
                        borderColor: colors.borderColor,
                        borderStyle: 'dashed',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Ionicons name="add" size={32} color={colors.secondaryTextColor} />
                    </Pressable>
                  )}
                </View>
              </ScrollView>
            </View>

            {/* Listing Actions */}
            <View style={{ marginTop: 32, marginBottom: 24 }}>
              <Text style={{ color: colors.textColor, fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
                Listing Actions
              </Text>
              
              {/* Show different actions based on status */}
              {product?.status === 'sold' && (
                <Pressable
                  onPress={handleReactivate}
                  style={{
                    backgroundColor: colors.cardBackground,
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: '#10B981',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Ionicons name="refresh-outline" size={24} color="#10B981" />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={{ color: colors.textColor, fontSize: 16, fontWeight: '600' }}>
                      Reactivate Listing
                    </Text>
                    <Text style={{ color: colors.secondaryTextColor, fontSize: 14 }}>
                      Make this listing active and visible to buyers again
                    </Text>
                  </View>
                </Pressable>
              )}

              {product?.status === 'draft' && (
                <Pressable
                  onPress={handlePublish}
                  style={{
                    backgroundColor: colors.cardBackground,
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: '#10B981',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Ionicons name="checkmark-circle-outline" size={24} color="#10B981" />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={{ color: colors.textColor, fontSize: 16, fontWeight: '600' }}>
                      Publish Listing
                    </Text>
                    <Text style={{ color: colors.secondaryTextColor, fontSize: 14 }}>
                      Make this listing active and visible to buyers
                    </Text>
                  </View>
                </Pressable>
              )}

              {product?.status === 'active' && (
                <>
                  <Pressable
                    onPress={handlePause}
                    style={{
                      backgroundColor: colors.cardBackground,
                      borderRadius: 12,
                      padding: 16,
                      marginBottom: 12,
                      borderWidth: 1,
                      borderColor: '#6B7280',
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <Ionicons name="pause-circle-outline" size={24} color="#6B7280" />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={{ color: colors.textColor, fontSize: 16, fontWeight: '600' }}>
                        Pause Listing
                      </Text>
                      <Text style={{ color: colors.secondaryTextColor, fontSize: 14 }}>
                        Temporarily hide this listing from buyers
                      </Text>
                    </View>
                  </Pressable>
                  <Pressable
                    onPress={handleMarkAsSold}
                    style={{
                      backgroundColor: colors.cardBackground,
                      borderRadius: 12,
                      padding: 16,
                      marginBottom: 12,
                      borderWidth: 1,
                      borderColor: '#F59E0B',
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <Ionicons name="checkmark-circle-outline" size={24} color="#F59E0B" />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={{ color: colors.textColor, fontSize: 16, fontWeight: '600' }}>
                        Mark as Sold
                      </Text>
                      <Text style={{ color: colors.secondaryTextColor, fontSize: 14 }}>
                        Mark this listing as sold
                      </Text>
                    </View>
                  </Pressable>
                </>
              )}

              {product?.status === 'paused' && (
                <Pressable
                  onPress={handleResume}
                  style={{
                    backgroundColor: colors.cardBackground,
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: '#10B981',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Ionicons name="play-circle-outline" size={24} color="#10B981" />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={{ color: colors.textColor, fontSize: 16, fontWeight: '600' }}>
                      Resume Listing
                    </Text>
                    <Text style={{ color: colors.secondaryTextColor, fontSize: 14 }}>
                      Make this listing active and visible to buyers again
                    </Text>
                  </View>
                </Pressable>
              )}

              <Pressable
                onPress={handleDelete}
                style={{
                  backgroundColor: colors.cardBackground,
                  borderRadius: 12,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: '#EF4444',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="trash-outline" size={24} color="#EF4444" />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ color: '#EF4444', fontSize: 16, fontWeight: '600' }}>
                    Delete Listing
                  </Text>
                  <Text style={{ color: colors.secondaryTextColor, fontSize: 14 }}>
                    Permanently delete this listing
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>
        </ScrollView>

        {/* Save Button - Fixed to Bottom */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            paddingLeft: Math.max(insets.left, 24),
            paddingRight: Math.max(insets.right, 24),
            paddingBottom: insets.bottom + 16,
            paddingTop: 16,
            backgroundColor: colors.backgroundColor,
            borderTopWidth: 1,
            borderTopColor: colors.borderColor,
          }}
        >
          <Pressable onPress={handleSave} disabled={saving || isUploadingImages} style={{ width: '100%' }}>
            {({ pressed }) => (
              <LinearGradient
                colors={['#EC4899', '#F97316']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  borderRadius: 16,
                  height: 56,
                  width: '100%',
                  opacity: (pressed || saving || isUploadingImages) ? 0.8 : 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {saving || isUploadingImages ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' }}>
                    Save Changes
                  </Text>
                )}
              </LinearGradient>
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

