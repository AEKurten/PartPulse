import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SellStep2Screen() {
  const insets = useSafeAreaInsets();
  const [photos, setPhotos] = useState<string[]>([]);

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

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotos([...photos, result.assets[0].uri]);
    }
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotos([...photos, result.assets[0].uri]);
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

  const handleNext = () => {
    if (photos.length === 0) {
      Alert.alert('Photos Required', 'Please add at least one photo of your item.');
      return;
    }
    router.push('/sell/step3');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#0F0E11' }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
    >
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
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </Pressable>
            <Text className="text-3xl font-bold text-white mb-2">
              Add Photos
            </Text>
            <Text className="text-base text-neutral-400">
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
                borderColor: '#3B3E46',
                borderStyle: 'dashed',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
              }}
            >
              <Ionicons name="cloud-upload-outline" size={24} color="#9CA3AF" style={{ marginRight: 8 }} />
              <Text className="text-neutral-400 text-base font-semibold">
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
                backgroundColor: '#2B2E36',
                borderRadius: 12,
                padding: 16,
                marginBottom: 32,
              }}
            >
              <Text className="text-white text-sm font-semibold mb-2">
                📸 Photo Tips
              </Text>
              <Text className="text-neutral-400 text-xs leading-5">
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
              <Text className="text-neutral-400 text-sm text-center">
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
            backgroundColor: '#0F0E11',
          }}
        >
          <Pressable
            onPress={handleNext}
            disabled={photos.length === 0}
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
                  opacity: photos.length === 0 ? 0.5 : pressed ? 0.8 : 1,
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
      </View>
    </KeyboardAvoidingView>
  );
}
