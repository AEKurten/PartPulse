import { useThemeColors } from '@/hooks/use-theme-colors';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSearchParams } from 'expo-router/build/hooks';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../stores/useAuthStore';

export default function SellStep2Screen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const [photos, setPhotos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const searchParams = useSearchParams();


  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'We need access to your photos to upload images.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const requestCameraPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'We need access to your camera to take photos.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  // Compress image to be under 2MB
  const compressImage = async (uri: string): Promise<string> => {
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB in bytes
    let quality = 0.8;
    let compressedUri = uri;

    // Check file size
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (fileInfo.exists && fileInfo.size) {
      let currentSize = fileInfo.size;
      
      // If file is already under 2MB, return as is
      if (currentSize <= MAX_SIZE) {
        return uri;
      }

      // Compress in steps until under 2MB
      while (currentSize > MAX_SIZE && quality > 0.1) {
        const manipResult = await ImageManipulator.manipulateAsync(
          uri,
          [{ resize: { width: 1920 } }], // Resize to max width 1920px
          { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
        );
        
        compressedUri = manipResult.uri;
        const newFileInfo = await FileSystem.getInfoAsync(compressedUri);
        
        if (newFileInfo.exists && newFileInfo.size) {
          currentSize = newFileInfo.size;
          if (currentSize <= MAX_SIZE) {
            break;
          }
          quality -= 0.1; // Reduce quality further
        } else {
          break;
        }
      }
    }

    return compressedUri;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1, // Start with full quality, we'll compress later
    });

    if (!result.canceled && result.assets[0]) {
      try {
        // Compress the image
        const compressedUri = await compressImage(result.assets[0].uri);
        setPhotos((prev) => {
          const newPhotos = [...prev, compressedUri];
          return newPhotos.slice(0, 10); // Limit to 10 photos
        });
      } catch (error) {
        console.error('Error compressing image:', error);
        Alert.alert('Error', 'Failed to process image. Please try again.');
      }
    }
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1, // Start with full quality, we'll compress later
    });

    if (!result.canceled && result.assets[0]) {
      try {
        // Compress the image
        const compressedUri = await compressImage(result.assets[0].uri);
        setPhotos((prev) => {
          const newPhotos = [...prev, compressedUri];
          return newPhotos.slice(0, 10); // Limit to 10 photos
        });
      } catch (error) {
        console.error('Error compressing image:', error);
        Alert.alert('Error', 'Failed to process image. Please try again.');
      }
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      'Add Photo',
      'Choose an option',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Photo Library', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const uploadImages = async () => {
    setIsUploading(true);
    const uploadedUrls: string[] = [];
    const productId = searchParams.get('productId');

    try {
      for (const uri of photos) {
      try {
        // Determine file extension and content type
        const fileExtension = uri.split('.').pop() || 'jpg';
        const lowerExt = fileExtension.toLowerCase();
        const contentType =
          lowerExt === 'jpg' || lowerExt === 'jpeg'
            ? 'image/jpeg'
            : lowerExt === 'png'
            ? 'image/png'
            : 'image/jpeg';

        const filename = `item_${Date.now()}_${Math.random()
          .toString(36)
          .substring(2)}.${fileExtension}`;

        // Read the file using expo-file-system and convert to ArrayBuffer
        // This ensures proper binary data handling in React Native
        const base64Data = await FileSystem.readAsStringAsync(uri, {
          encoding: 'base64',
        });

        // Convert base64 to ArrayBuffer (which Supabase Storage accepts)
        // React Native-compatible base64 to ArrayBuffer conversion
        let binaryString: string;
        if (Platform.OS === 'web') {
          binaryString = atob(base64Data);
        } else {
          // Manual base64 decode for React Native (since atob might not be available)
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

        // Upload the ArrayBuffer to Supabase Storage
        const { error } = await supabase.storage
          .from('Product-images')
          .upload(filename, arrayBuffer, {
            cacheControl: '3600',
            upsert: false,
            contentType,
          });

        if (error) throw error;

        const publicUrl = supabase.storage
          .from('Product-images')
          .getPublicUrl(filename);
        uploadedUrls.push(publicUrl.data.publicUrl);


      }
      catch (error) {
        console.error('Error uploading images:', error);
        throw error;
      }
    }

    const userId = useAuthStore.getState().user?.id;

    if (!userId) {
      throw new Error('User not authenticated');
    }

      // single update after all uploads
      const { error } = await supabase
        .from('products')
        .update({ images: uploadedUrls, seller_id: userId })
        .eq('id', productId);

      if (error) throw error;
    } catch (error) {
      console.error('Error uploading images:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  }

  const handleNext = async () => {
    if (photos.length === 0) {
      Alert.alert('Photos Required', 'Please add at least one photo of your item.');
      return;
    }

    if (isUploading) {
      return; // Prevent multiple clicks while uploading
    }

    const test = searchParams.get('productId')
    console.log('Navigating to step 3 with productId:', test);

    try {
      await uploadImages();
      router.push({
        pathname: '/sell/step3',
        params: {
          productId: test,
        },
      });
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Upload Error', 'There was an error uploading your photos. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: colors.backgroundColor }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
    >
      <StatusBar style={colors.statusBarStyle} />
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View
            style={{
              paddingTop: insets.top + 24,
              paddingBottom: 24,
              paddingLeft: Math.max(insets.left, 24),
              paddingRight: Math.max(insets.right, 24),
            }}
          >
            {/* Header */}
            <View style={{ marginBottom: 24 }}>
              <Pressable
                onPress={() => router.back()}
                style={{ marginBottom: 24, alignSelf: 'flex-start' }}
              >
                <Ionicons name="arrow-back" size={24} color={colors.textColor} />
              </Pressable>
              <Text style={{ color: colors.textColor, fontSize: 28, fontWeight: 'bold', marginBottom: 8 }}>
                Add Photos
              </Text>
              <Text style={{ color: colors.secondaryTextColor, fontSize: 16 }}>
                Upload photos of your item. Add at least one photo.
              </Text>
            </View>

            {/* Add Photo Button - Full Width */}
            {photos.length < 10 && (
              <Pressable
                onPress={showImagePickerOptions}
                style={{
                  width: '100%',
                  paddingVertical: 32,
                  marginBottom: 24,
                  backgroundColor: 'transparent',
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: colors.borderColor,
                  borderStyle: 'dashed',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'row',
                }}
              >
                <Ionicons name="cloud-upload-outline" size={24} color={colors.secondaryTextColor} style={{ marginRight: 8 }} />
                <Text style={{ color: colors.secondaryTextColor, fontSize: 16, fontWeight: '600' }}>
                  Add Photo
                </Text>
              </Pressable>
            )}

            {/* Photo Grid */}
            {photos.length > 0 && (
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: 12,
                  marginBottom: 32,
                }}
              >
                {/* Display existing photos */}
                {photos.map((uri, index) => (
                  <View
                    key={index}
                    style={{
                      width: '48%',
                      aspectRatio: 1,
                      position: 'relative',
                    }}
                  >
                    <Image
                      source={{ uri }}
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 12,
                      }}
                      contentFit="cover"
                    />
                    <Pressable
                      onPress={() => removePhoto(index)}
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        borderRadius: 20,
                        width: 32,
                        height: 32,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Ionicons name="close" size={20} color="#FFFFFF" />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}

            {/* Tips */}
            {photos.length === 0 && (
              <View
                style={{
                  backgroundColor: colors.cardBackground,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 32,
                  borderWidth: 1,
                  borderColor: colors.borderColor,
                }}
              >
                <Text style={{ color: colors.textColor, fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
                  📸 Photo Tips
                </Text>
                <Text style={{ color: colors.secondaryTextColor, fontSize: 12, lineHeight: 20 }}>
                  • Take clear, well-lit photos{'\n'}
                  • Show all angles and any damage{'\n'}
                  • Include serial numbers if visible{'\n'}
                  • Up to 10 photos allowed
                </Text>
              </View>
            )}

            {/* Photo Count */}
            {photos.length > 0 && (
              <View style={{ marginBottom: 32 }}>
                <Text style={{ color: colors.secondaryTextColor, fontSize: 14, textAlign: 'center' }}>
                  {photos.length} {photos.length === 1 ? 'photo' : 'photos'} added
                  {photos.length < 10 && ` • ${10 - photos.length} more allowed`}
                </Text>
              </View>
            )}

          </View>
        </ScrollView>

        {/* Continue Button - Fixed to Bottom */}
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
          <Pressable
            onPress={handleNext}
            disabled={photos.length === 0 || isUploading}
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
                  opacity: (photos.length === 0 || isUploading) ? 0.5 : pressed ? 0.8 : 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'row',
                  gap: 8,
                }}
              >
                {isUploading ? (
                  <>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text className="text-white text-lg font-bold">
                      Uploading...
                    </Text>
                  </>
                ) : (
                  <Text className="text-white text-lg font-bold">
                    Continue
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
