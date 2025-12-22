import { useTheme } from '@/contexts/theme-context';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import { Image } from 'expo-image';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, RefreshControl, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserData } from '../Helpers/UserDetailsHelper';
import { useAuthStore } from '../stores/useAuthStore';
import { useProfileStore } from '../stores/userProfileStore';


// Mock rig specs
const DEFAULT_RIG_SPECS = {
  cpu: '',
  gpu: '',
  motherboard: '',
  ram: '',
  storage: [] as Array<{ id?: string; type: string; capacity: string; model: string }>,
  psu: '',
  case: '',
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { actualTheme, setTheme } = useTheme();
  const [rigSpecs, setRigSpecs] = useState(DEFAULT_RIG_SPECS);
  const [isEditingRig, setIsEditingRig] = useState(false);
  const [rigId, setRigId] = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [editedUsername, setEditedUsername] = useState('');
  const [editedBio, setEditedBio] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [stats, setStats] = useState({
    activeListings: 0,
    itemsSold: 0,
    itemsBought: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  //userdata
  const USER_DATA = useUserData();
  const { profile, setUserDetails } = useProfileStore();
  const { user } = useAuthStore();

  // Load rig specs from database
  const loadRigSpecs = async () => {
      if (!user?.id) return;

      try {
        // Fetch primary rig for user
        const { data, error } = await supabase
          .from('user_rigs')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_primary', true)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('Error loading rig specs:', error);
          return;
        }

        if (data) {
          setRigId(data.id);
          setRigSpecs({
            cpu: data.cpu || '',
            gpu: data.gpu || '',
            motherboard: data.motherboard || '',
            ram: data.ram || '',
            storage: [],
            psu: data.psu || '',
            case: data.pc_case || '',
          });

          // Fetch storage entries for this rig
          const { data: storageData } = await supabase
            .from('user_rig_storage')
            .select('*')
            .eq('rig_id', data.id)
            .order('created_at', { ascending: true });

          if (storageData && storageData.length > 0) {
            setRigSpecs(prev => ({
              ...prev,
              storage: storageData.map(s => ({
                id: s.id,
                type: s.type,
                capacity: s.capacity || '',
                model: s.model || '',
              })),
            }));
          }
        }
      } catch (error) {
        console.error('Error loading rig specs:', error);
      }
    };

  useEffect(() => {
    loadRigSpecs();
  }, [user?.id]);

  // Initialize edit form when entering edit mode
  useEffect(() => {
    if (isEditingProfile && profile) {
      setEditedUsername(profile.username || '');
      setEditedBio(profile.bio || '');
      setAvatarPreview(null);
    }
  }, [isEditingProfile, profile]);

  // Fetch user stats
  const fetchStats = async () => {
      if (!user?.id) {
        setLoadingStats(false);
        return;
      }

      try {
        setLoadingStats(true);

        // Fetch active listings
        const { count: activeListingsCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('seller_id', user.id)
          .eq('status', 'active');

        // Fetch items sold (orders where user is seller and status is delivered)
        const { count: itemsSoldCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('seller_id', user.id)
          .in('status', ['delivered', 'confirmed', 'shipped']);

        // Fetch items bought (orders where user is buyer and status is delivered)
        const { count: itemsBoughtCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('buyer_id', user.id)
          .in('status', ['delivered', 'confirmed', 'shipped']);

        setStats({
          activeListings: activeListingsCount || 0,
          itemsSold: itemsSoldCount || 0,
          itemsBought: itemsBoughtCount || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };

  useEffect(() => {
    fetchStats();
  }, [user?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadRigSpecs(), fetchStats()]);
    setRefreshing(false);
  };

  const handleThemeToggle = async (value: boolean) => {
    await setTheme(value ? 'dark' : 'light');
  };

  const handleSaveRigSpecs = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    try {
      let currentRigId = rigId;

      // Check if user already has a primary rig
      if (!currentRigId) {
        const { data: existingRig } = await supabase
          .from('user_rigs')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_primary', true)
          .single();

        if (existingRig) {
          currentRigId = existingRig.id;
        }
      }

      if (currentRigId) {
        // Update existing rig
        const { error } = await supabase
          .from('user_rigs')
          .update({
            cpu: rigSpecs.cpu || null,
            gpu: rigSpecs.gpu || null,
            motherboard: rigSpecs.motherboard || null,
            ram: rigSpecs.ram || null,
            psu: rigSpecs.psu || null,
            pc_case: rigSpecs.case || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentRigId);

        if (error) throw error;
      } else {
        // Insert new rig
        const { data: newRig, error } = await supabase
          .from('user_rigs')
          .insert({
            user_id: user.id,
            cpu: rigSpecs.cpu || null,
            gpu: rigSpecs.gpu || null,
            motherboard: rigSpecs.motherboard || null,
            ram: rigSpecs.ram || null,
            psu: rigSpecs.psu || null,
            pc_case: rigSpecs.case || null,
            is_primary: true,
          })
          .select('id')
          .single();

        if (error) throw error;
        currentRigId = newRig.id;
        setRigId(currentRigId);
      }

      // Delete all existing storage entries for this rig
      await supabase
        .from('user_rig_storage')
        .delete()
        .eq('rig_id', currentRigId);

      // Insert new storage entries
      if (rigSpecs.storage.length > 0) {
        const storageToInsert = rigSpecs.storage
          .filter(s => s.type && (s.capacity || s.model))
          .map(s => ({
            rig_id: currentRigId,
            type: s.type,
            capacity: s.capacity || null,
            model: s.model || null,
          }));

        if (storageToInsert.length > 0) {
          const { error: storageError } = await supabase
            .from('user_rig_storage')
            .insert(storageToInsert);

          if (storageError) throw storageError;
        }
      }

      setIsEditingRig(false);
      Alert.alert('Success', 'Rig specs saved successfully');
    } catch (error) {
      console.error('Error saving rig specs:', error);
      Alert.alert('Error', 'Failed to save rig specs. Please try again.');
    }
  };

  const handleGetAISuggestions = () => {
    // Navigate to AI suggestions page with rig specs
    router.push({
      pathname: '/ai-tools',
      params: { rigSpecs: JSON.stringify(rigSpecs) },
    });
  };

  const handleLogoutPress = async () => {
    const setSession = useAuthStore.getState().setSession;
    const setUserDetails = useProfileStore.getState().setUserDetails;

    const { error } = await supabase.auth.signOut();

    if (!error) {
      setSession(null);
      setUserDetails(null);
      router.push('/auth/login');
    } else {
      console.error('Error signing out:', error.message);
    }
  }

  // Compress image for avatar
  const compressImage = async (uri: string): Promise<string> => {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) {
      throw new Error('File does not exist');
    }

    let currentUri = uri;
    let quality = 0.8;
    const targetSize = 2 * 1024 * 1024; // 2MB

    // Get initial size if available
    let currentSize = 'size' in fileInfo ? fileInfo.size : targetSize + 1;

    while (currentSize > targetSize && quality > 0.1) {
      const manipResult = await ImageManipulator.manipulateAsync(
        currentUri,
        [{ resize: { width: 800 } }], // Resize to max 800px for avatar
        { compress: quality, format: ImageManipulator.SaveFormat.JPEG, base64: false }
      );
      currentUri = manipResult.uri;
      const newFileInfo = await FileSystem.getInfoAsync(currentUri);
      currentSize = 'size' in newFileInfo ? newFileInfo.size : 0;
      quality -= 0.1;
    }
    return currentUri;
  };

  // Request permissions for image picker
  const requestImagePermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'We need access to your photos to upload an avatar.');
      return false;
    }
    return true;
  };

  // Pick avatar image
  const pickAvatar = async () => {
    const hasPermission = await requestImagePermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Square for avatar
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      try {
        const compressedUri = await compressImage(result.assets[0].uri);
        setAvatarPreview(compressedUri);
      } catch (error) {
        console.error('Error compressing image:', error);
        Alert.alert('Error', 'Failed to process image. Please try again.');
      }
    }
  };

  // Upload avatar to Supabase Storage
  const uploadAvatar = async (uri: string): Promise<string> => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    setIsUploadingAvatar(true);
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        throw new Error('File does not exist');
      }

      const fileExtension = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const contentType = fileExtension === 'png' ? 'image/png' : 'image/jpeg';
      // Use same filename pattern as product images to avoid RLS issues
      const filename = `avatar_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExtension}`;

      // Read as base64
      const base64Data = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      });

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

      // Upload to Product-images bucket (which we know has proper RLS policies)
      // Use upsert: false to match product image upload pattern
      const { error: uploadError } = await supabase.storage
        .from('Product-images')
        .upload(filename, arrayBuffer, {
          cacheControl: '3600',
          upsert: false,
          contentType,
        });

      if (uploadError) {
        throw uploadError;
      }

      const publicUrl = supabase.storage
        .from('Product-images')
        .getPublicUrl(filename);
      return publicUrl.data.publicUrl;
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    if (!editedUsername.trim()) {
      Alert.alert('Error', 'Username is required');
      return;
    }

    try {
      setIsUploadingAvatar(true);
      let avatarUrl = profile?.avatar_url || null;

      // Upload new avatar if preview exists
      if (avatarPreview) {
        avatarUrl = await uploadAvatar(avatarPreview);
      }

      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .update({
          username: editedUsername.trim(),
          bio: editedBio.trim() || null,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      // Update store
      setUserDetails({
        username: editedUsername.trim(),
        bio: editedBio.trim() || null,
        avatar_url: avatarUrl,
      });

      setIsEditingProfile(false);
      setAvatarPreview(null);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setAvatarPreview(null);
    setEditedUsername(profile?.username || '');
    setEditedBio(profile?.bio || '');
  };

  const colors = useThemeColors();
  const backgroundColor = colors.backgroundColor;
  const cardBackground = colors.cardBackground;
  const textColor = colors.textColor;
  const secondaryTextColor = colors.secondaryTextColor;
  const inputBackground = colors.inputBackground;
  const borderColor = colors.borderColor;
  const iconBackground = colors.iconBackground;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <StatusBar style={colors.statusBarStyle} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#EC4899"
            colors={["#EC4899"]}
          />
        }
        contentContainerStyle={{
          paddingLeft: Math.max(insets.left, 24),
          paddingRight: Math.max(insets.right, 24),
          paddingBottom: 24,
        }}
      >
        {/* Header */}
        <View style={{ paddingTop: 24, marginBottom: 32 }}>
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
              <Ionicons name="person" size={24} color="#EC4899" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: textColor, fontSize: 28, fontWeight: 'bold', marginBottom: 4 }}>
                Profile
              </Text>
              <Text style={{ color: secondaryTextColor, fontSize: 14 }}>
                Manage your account and preferences
              </Text>
            </View>
          </View>
        </View>

        {/* User Profile Card */}
        <View
          style={{
            backgroundColor: cardBackground,
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: borderColor,
          }}
        >
          {isEditingProfile ? (
            /* Edit Mode */
            <View>
              <View style={{ alignItems: 'center', marginBottom: 20 }}>
                <View style={{ position: 'relative' }}>
                  <Pressable
                    onPress={pickAvatar}
                    disabled={isUploadingAvatar}
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 40,
                      overflow: 'hidden',
                      backgroundColor: iconBackground,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderColor: borderColor,
                    }}
                  >
                    {isUploadingAvatar ? (
                      <ActivityIndicator size="small" color="#EC4899" />
                    ) : avatarPreview ? (
                      <Image
                        source={{ uri: avatarPreview }}
                        style={{ width: '100%', height: '100%' }}
                        contentFit="cover"
                      />
                    ) : profile?.avatar_url ? (
                      <Image
                        source={{ uri: profile.avatar_url }}
                        style={{ width: '100%', height: '100%' }}
                        contentFit="cover"
                      />
                    ) : (
                      <Ionicons name="person-circle" size={80} color={secondaryTextColor} />
                    )}
                  </Pressable>
                  <View
                    style={{
                      position: 'absolute',
                      bottom: -2,
                      right: -2,
                      backgroundColor: '#EC4899',
                      borderRadius: 12,
                      width: 28,
                      height: 28,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderWidth: 2,
                      borderColor: cardBackground,
                      zIndex: 10,
                    }}
                  >
                    <Ionicons name="camera" size={14} color="#FFFFFF" />
                  </View>
                </View>
                <Text style={{ color: secondaryTextColor, fontSize: 12, marginTop: 8 }}>
                  Tap avatar to change
                </Text>
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: textColor, fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
                  Username
                </Text>
                <TextInput
                  value={editedUsername}
                  onChangeText={setEditedUsername}
                  style={{
                    backgroundColor: inputBackground,
                    borderRadius: 12,
                    padding: 12,
                    color: textColor,
                    borderWidth: 1,
                    borderColor: borderColor,
                  }}
                  placeholder="Enter username"
                  placeholderTextColor={secondaryTextColor}
                />
              </View>

              <View style={{ marginBottom: 20 }}>
                <Text style={{ color: textColor, fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
                  Bio
                </Text>
                <TextInput
                  value={editedBio}
                  onChangeText={setEditedBio}
                  multiline
                  numberOfLines={4}
                  style={{
                    backgroundColor: inputBackground,
                    borderRadius: 12,
                    padding: 12,
                    color: textColor,
                    borderWidth: 1,
                    borderColor: borderColor,
                    minHeight: 100,
                    textAlignVertical: 'top',
                  }}
                  placeholder="Tell us about yourself..."
                  placeholderTextColor={secondaryTextColor}
                />
              </View>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Pressable
                  onPress={handleCancelEdit}
                  disabled={isUploadingAvatar}
                  style={{
                    flex: 1,
                    backgroundColor: iconBackground,
                    borderRadius: 12,
                    padding: 14,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: borderColor,
                    opacity: isUploadingAvatar ? 0.5 : 1,
                  }}
                >
                  <Text style={{ color: textColor, fontSize: 16, fontWeight: '600' }}>
                    Cancel
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleSaveProfile}
                  disabled={isUploadingAvatar}
                  style={{
                    flex: 1,
                    backgroundColor: '#EC4899',
                    borderRadius: 12,
                    padding: 14,
                    alignItems: 'center',
                    opacity: isUploadingAvatar ? 0.5 : 1,
                  }}
                >
                  {isUploadingAvatar ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
                      Save
                    </Text>
                  )}
                </Pressable>
              </View>
            </View>
          ) : (
            /* View Mode */
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  overflow: 'hidden',
                  marginRight: 16,
                  backgroundColor: iconBackground,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {USER_DATA?.avatar ? (
                  <Image
                    source={{ uri: USER_DATA.avatar }}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="cover"
                  />
                ) : (
                  <Ionicons name="person-circle" size={80} color={secondaryTextColor} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: textColor, fontSize: 20, fontWeight: 'bold' }}>
                  {USER_DATA?.name}
                </Text>
                <Text style={{ color: secondaryTextColor, fontSize: 14, marginTop: 4 }}>
                  {USER_DATA?.email}
                </Text>
                {profile?.bio && (
                  <Text style={{ color: secondaryTextColor, fontSize: 14, marginTop: 8 }}>
                    {profile.bio}
                  </Text>
                )}
                <Pressable
                  onPress={() => setIsEditingProfile(true)}
                  style={{ marginTop: 8 }}
                >
                  <Text style={{ color: '#EC4899', fontSize: 14, fontWeight: '600' }}>
                    Edit Profile
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        {/* Quick Overview Section */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: textColor, fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
            Overview
          </Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {/* Active Listings */}
            <Pressable
              onPress={() => {
                router.push('/my-listings');
              }}
              style={{
                flex: 1,
                backgroundColor: cardBackground,
                borderRadius: 16,
                padding: 16,
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: iconBackground,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <Ionicons name="list-outline" size={24} color="#EC4899" />
              </View>
              <Text style={{ color: textColor, fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}>
                {loadingStats ? '...' : stats.activeListings}
              </Text>
              <Text style={{ color: secondaryTextColor, fontSize: 14, marginTop: 4, textAlign: 'center' }}>
                Active Listings
              </Text>
            </Pressable>

            {/* Sold Items */}
            <Pressable
              onPress={() => {
                // Navigate to sold items
                console.log('View sold items');
              }}
              style={{
                flex: 1,
                backgroundColor: cardBackground,
                borderRadius: 16,
                padding: 16,
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: iconBackground,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <Ionicons name="checkmark-circle-outline" size={24} color="#10B981" />
              </View>
              <Text style={{ color: textColor, fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}>
                {loadingStats ? '...' : stats.itemsSold}
              </Text>
              <Text style={{ color: secondaryTextColor, fontSize: 14, marginTop: 4, textAlign: 'center' }}>
                Sold Items
              </Text>
            </Pressable>

            {/* Bought Items */}
            <Pressable
              onPress={() => {
                // Navigate to bought items
                console.log('View bought items');
              }}
              style={{
                flex: 1,
                backgroundColor: cardBackground,
                borderRadius: 16,
                padding: 16,
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: iconBackground,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <Ionicons name="bag-outline" size={24} color="#3B82F6" />
              </View>
              <Text style={{ color: textColor, fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}>
                {loadingStats ? '...' : stats.itemsBought}
              </Text>
              <Text style={{ color: secondaryTextColor, fontSize: 14, marginTop: 4, textAlign: 'center' }}>
                Bought Items
              </Text>
            </Pressable>
          </View>
        </View>

        {/* My Rig Specs Section */}
        <View style={{ marginBottom: 24 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <Text style={{ color: textColor, fontSize: 18, fontWeight: 'bold' }}>
              My Rig Specs
            </Text>
            {!isEditingRig ? (
              <Pressable
                onPress={() => setIsEditingRig(true)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingVertical: 8,
                  paddingHorizontal: 4,
                }}
              >
                <Ionicons name="create-outline" size={20} color="#EC4899" />
                <Text style={{ color: '#EC4899', fontSize: 16, fontWeight: '600' }}>
                  Edit
                </Text>
              </Pressable>
            ) : (
              <View style={{ flexDirection: 'row', gap: 20 }}>
                <Pressable
                  onPress={async () => {
                    // Reload rig specs from database on cancel
                    if (user?.id) {
                      const { data } = await supabase
                        .from('user_rigs')
                        .select('*')
                        .eq('user_id', user.id)
                        .eq('is_primary', true)
                        .single();

                      if (data) {
                        setRigId(data.id);
                        setRigSpecs({
                          cpu: data.cpu || '',
                          gpu: data.gpu || '',
                          motherboard: data.motherboard || '',
                          ram: data.ram || '',
                          storage: [],
                          psu: data.psu || '',
                          case: data.pc_case || '',
                        });

                        // Fetch storage entries
                        const { data: storageData } = await supabase
                          .from('user_rig_storage')
                          .select('*')
                          .eq('rig_id', data.id)
                          .order('created_at', { ascending: true });

                        if (storageData && storageData.length > 0) {
                          setRigSpecs(prev => ({
                            ...prev,
                            storage: storageData.map(s => ({
                              id: s.id,
                              type: s.type,
                              capacity: s.capacity || '',
                              model: s.model || '',
                            })),
                          }));
                        }
                      } else {
                        setRigId(null);
                        setRigSpecs(DEFAULT_RIG_SPECS);
                      }
                    } else {
                      setRigSpecs(DEFAULT_RIG_SPECS);
                    }
                    setIsEditingRig(false);
                  }}
                  style={{ paddingVertical: 8, paddingHorizontal: 4 }}
                >
                  <Text style={{ color: secondaryTextColor, fontSize: 16, fontWeight: '600' }}>
                    Cancel
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleSaveRigSpecs}
                  style={{ paddingVertical: 8, paddingHorizontal: 4 }}
                >
                  <Text style={{ color: '#EC4899', fontSize: 16, fontWeight: '600' }}>
                    Save
                  </Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* Rig Specs Grid */}
          <View style={{ gap: 12 }}>
            {/* Row 1: CPU & GPU */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {/* CPU Card */}
              <View style={{ flex: 1 }}>
                {isEditingRig ? (
                  <View
                    style={{
                      backgroundColor: cardBackground,
                      borderRadius: 16,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: borderColor,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          backgroundColor: '#3B82F6' + '20',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginRight: 12,
                        }}
                      >
                        <Ionicons name="hardware-chip-outline" size={20} color="#3B82F6" />
                      </View>
                      <Text style={{ color: textColor, fontSize: 14, fontWeight: '600' }}>CPU</Text>
                    </View>
                    <TextInput
                      placeholder="e.g., Intel i9-14900K"
                      placeholderTextColor={secondaryTextColor}
                      value={rigSpecs.cpu}
                      onChangeText={(text) => setRigSpecs({ ...rigSpecs, cpu: text })}
                      style={{
                        backgroundColor: inputBackground,
                        borderRadius: 12,
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        fontSize: 13,
                        color: textColor,
                        borderWidth: 1,
                        borderColor: borderColor,
                      }}
                    />
                  </View>
                ) : (
                  <Pressable
                    onPress={() => setIsEditingRig(true)}
                    style={{
                      backgroundColor: cardBackground,
                      borderRadius: 16,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: rigSpecs.cpu ? '#3B82F6' + '40' : borderColor,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          backgroundColor: '#3B82F6' + '20',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginRight: 12,
                        }}
                      >
                        <Ionicons name="hardware-chip-outline" size={20} color="#3B82F6" />
                      </View>
                      <Text style={{ color: secondaryTextColor, fontSize: 12, fontWeight: '500' }}>CPU</Text>
                    </View>
                    <Text
                      style={{
                        color: rigSpecs.cpu ? textColor : secondaryTextColor,
                        fontSize: 14,
                        fontWeight: rigSpecs.cpu ? '600' : '400',
                      }}
                      numberOfLines={2}
                    >
                      {rigSpecs.cpu || 'Not specified'}
                    </Text>
                  </Pressable>
                )}
              </View>

              {/* GPU Card */}
              <View style={{ flex: 1 }}>
                {isEditingRig ? (
                  <View
                    style={{
                      backgroundColor: cardBackground,
                      borderRadius: 16,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: borderColor,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          backgroundColor: '#EC4899' + '20',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginRight: 12,
                        }}
                      >
                        <Ionicons name="tv-outline" size={20} color="#EC4899" />
                      </View>
                      <Text style={{ color: textColor, fontSize: 14, fontWeight: '600' }}>GPU</Text>
                    </View>
                    <TextInput
                      placeholder="e.g., NVIDIA RTX 4090"
                      placeholderTextColor={secondaryTextColor}
                      value={rigSpecs.gpu}
                      onChangeText={(text) => setRigSpecs({ ...rigSpecs, gpu: text })}
                      style={{
                        backgroundColor: inputBackground,
                        borderRadius: 12,
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        fontSize: 13,
                        color: textColor,
                        borderWidth: 1,
                        borderColor: borderColor,
                      }}
                    />
                  </View>
                ) : (
                  <Pressable
                    onPress={() => setIsEditingRig(true)}
                    style={{
                      backgroundColor: cardBackground,
                      borderRadius: 16,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: rigSpecs.gpu ? '#EC4899' + '40' : borderColor,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          backgroundColor: '#EC4899' + '20',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginRight: 12,
                        }}
                      >
                        <Ionicons name="tv-outline" size={20} color="#EC4899" />
                      </View>
                      <Text style={{ color: secondaryTextColor, fontSize: 12, fontWeight: '500' }}>GPU</Text>
                    </View>
                    <Text
                      style={{
                        color: rigSpecs.gpu ? textColor : secondaryTextColor,
                        fontSize: 14,
                        fontWeight: rigSpecs.gpu ? '600' : '400',
                      }}
                      numberOfLines={2}
                    >
                      {rigSpecs.gpu || 'Not specified'}
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>

            {/* Row 2: Motherboard & RAM */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {/* Motherboard Card */}
              <View style={{ flex: 1 }}>
                {isEditingRig ? (
                  <View
                    style={{
                      backgroundColor: cardBackground,
                      borderRadius: 16,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: borderColor,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          backgroundColor: '#10B981' + '20',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginRight: 12,
                        }}
                      >
                        <Ionicons name="grid-outline" size={20} color="#10B981" />
                      </View>
                      <Text style={{ color: textColor, fontSize: 14, fontWeight: '600' }}>MB</Text>
                    </View>
                    <TextInput
                      placeholder="e.g., ASUS ROG Z790-E"
                      placeholderTextColor={secondaryTextColor}
                      value={rigSpecs.motherboard}
                      onChangeText={(text) => setRigSpecs({ ...rigSpecs, motherboard: text })}
                      style={{
                        backgroundColor: inputBackground,
                        borderRadius: 12,
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        fontSize: 13,
                        color: textColor,
                        borderWidth: 1,
                        borderColor: borderColor,
                      }}
                    />
                  </View>
                ) : (
                  <Pressable
                    onPress={() => setIsEditingRig(true)}
                    style={{
                      backgroundColor: cardBackground,
                      borderRadius: 16,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: rigSpecs.motherboard ? '#10B981' + '40' : borderColor,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          backgroundColor: '#10B981' + '20',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginRight: 12,
                        }}
                      >
                        <Ionicons name="grid-outline" size={20} color="#10B981" />
                      </View>
                      <Text style={{ color: secondaryTextColor, fontSize: 12, fontWeight: '500' }}>MB</Text>
                    </View>
                    <Text
                      style={{
                        color: rigSpecs.motherboard ? textColor : secondaryTextColor,
                        fontSize: 14,
                        fontWeight: rigSpecs.motherboard ? '600' : '400',
                      }}
                      numberOfLines={2}
                    >
                      {rigSpecs.motherboard || 'Not specified'}
                    </Text>
                  </Pressable>
                )}
              </View>

              {/* RAM Card */}
              <View style={{ flex: 1 }}>
                {isEditingRig ? (
                  <View
                    style={{
                      backgroundColor: cardBackground,
                      borderRadius: 16,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: borderColor,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          backgroundColor: '#F97316' + '20',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginRight: 12,
                        }}
                      >
                        <Ionicons name="layers-outline" size={20} color="#F97316" />
                      </View>
                      <Text style={{ color: textColor, fontSize: 14, fontWeight: '600' }}>RAM</Text>
                    </View>
                    <TextInput
                      placeholder="e.g., 32GB DDR5-6000"
                      placeholderTextColor={secondaryTextColor}
                      value={rigSpecs.ram}
                      onChangeText={(text) => setRigSpecs({ ...rigSpecs, ram: text })}
                      style={{
                        backgroundColor: inputBackground,
                        borderRadius: 12,
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        fontSize: 13,
                        color: textColor,
                        borderWidth: 1,
                        borderColor: borderColor,
                      }}
                    />
                  </View>
                ) : (
                  <Pressable
                    onPress={() => setIsEditingRig(true)}
                    style={{
                      backgroundColor: cardBackground,
                      borderRadius: 16,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: rigSpecs.ram ? '#F97316' + '40' : borderColor,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          backgroundColor: '#F97316' + '20',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginRight: 12,
                        }}
                      >
                        <Ionicons name="layers-outline" size={20} color="#F97316" />
                      </View>
                      <Text style={{ color: secondaryTextColor, fontSize: 12, fontWeight: '500' }}>RAM</Text>
                    </View>
                    <Text
                      style={{
                        color: rigSpecs.ram ? textColor : secondaryTextColor,
                        fontSize: 14,
                        fontWeight: rigSpecs.ram ? '600' : '400',
                      }}
                      numberOfLines={2}
                    >
                      {rigSpecs.ram || 'Not specified'}
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>

            {/* Row 3: Storage (Full Width), PSU & Case */}
            {/* Storage Section - Full Width */}
            <View>
              <View
                style={{
                  backgroundColor: cardBackground,
                  borderRadius: 16,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: rigSpecs.storage.length > 0 ? '#8B5CF6' + '40' : borderColor,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: isEditingRig ? 12 : 0 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12   }}>
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        backgroundColor: '#8B5CF6' + '20',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: 12,
                      }}
                    >
                      <Ionicons name="disc-outline" size={20} color="#8B5CF6" />
                    </View>
                    <Text style={{ color: textColor, fontSize: 14, fontWeight: '600' }}>Storage</Text>
                  </View>
                  {isEditingRig && (
                    <Pressable
                      onPress={() => {
                        setRigSpecs({
                          ...rigSpecs,
                          storage: [...rigSpecs.storage, { type: 'SSD', capacity: '', model: '' }],
                        });
                      }}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                        paddingVertical: 6,
                        paddingHorizontal: 12,
                        backgroundColor: '#8B5CF6' + '20',
                        borderRadius: 8,
                      }}
                    >
                      <Ionicons name="add" size={16} color="#8B5CF6" />
                      <Text style={{ color: '#8B5CF6', fontSize: 12, fontWeight: '600' }}>Add Drive</Text>
                    </Pressable>
                  )}
                </View>

                {isEditingRig ? (
                  <View style={{ gap: 12 }}>
                    {rigSpecs.storage.length === 0 ? (
                      <View
                        style={{
                          backgroundColor: inputBackground,
                          borderRadius: 12,
                          padding: 16,
                          borderWidth: 1,
                          borderColor: borderColor,
                          borderStyle: 'dashed',
                          alignItems: 'center',
                        }}
                      >
                        <Text style={{ color: secondaryTextColor, fontSize: 14 }}>
                          No storage drives added. Click "Add Drive" to add one.
                        </Text>
                      </View>
                    ) : (
                      rigSpecs.storage.map((storage, index) => (
                        <View
                          key={index}
                          style={{
                            backgroundColor: inputBackground,
                            borderRadius: 12,
                            padding: 16,
                            borderWidth: 1,
                            borderColor: borderColor,
                          }}
                        >
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <Text style={{ color: textColor, fontSize: 14, fontWeight: '600' }}>
                              Drive {index + 1}
                            </Text>
                            <Pressable
                              onPress={() => {
                                setRigSpecs({
                                  ...rigSpecs,
                                  storage: rigSpecs.storage.filter((_, i) => i !== index),
                                });
                              }}
                              style={{
                                padding: 4,
                              }}
                            >
                              <Ionicons name="trash-outline" size={20} color="#EF4444" />
                            </Pressable>
                          </View>
                          <View style={{ gap: 12 }}>
                            <View>
                              <Text style={{ color: secondaryTextColor, fontSize: 12, marginBottom: 6 }}>Type</Text>
                              <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                                {['SSD', 'HDD', 'NVMe', 'M.2', 'Other'].map((type) => (
                                  <Pressable
                                    key={type}
                                    onPress={() => {
                                      const newStorage = [...rigSpecs.storage];
                                      newStorage[index].type = type;
                                      setRigSpecs({ ...rigSpecs, storage: newStorage });
                                    }}
                                    style={{
                                      paddingVertical: 8,
                                      paddingHorizontal: 12,
                                      borderRadius: 8,
                                      backgroundColor: storage.type === type ? '#8B5CF6' : cardBackground,
                                      borderWidth: 1,
                                      borderColor: storage.type === type ? '#8B5CF6' : borderColor,
                                    }}
                                  >
                                    <Text
                                      style={{
                                        color: storage.type === type ? '#FFFFFF' : textColor,
                                        fontSize: 12,
                                        fontWeight: storage.type === type ? '600' : '400',
                                      }}
                                    >
                                      {type}
                                    </Text>
                                  </Pressable>
                                ))}
                              </View>
                            </View>
                            <View>
                              <Text style={{ color: secondaryTextColor, fontSize: 12, marginBottom: 6 }}>Capacity</Text>
                              <TextInput
                                placeholder="e.g., 2TB, 500GB"
                                placeholderTextColor={secondaryTextColor}
                                value={storage.capacity}
                                onChangeText={(text) => {
                                  const newStorage = [...rigSpecs.storage];
                                  newStorage[index].capacity = text;
                                  setRigSpecs({ ...rigSpecs, storage: newStorage });
                                }}
                                style={{
                                  backgroundColor: cardBackground,
                                  borderRadius: 12,
                                  paddingHorizontal: 12,
                                  paddingVertical: 10,
                                  fontSize: 13,
                                  color: textColor,
                                  borderWidth: 1,
                                  borderColor: borderColor,
                                }}
                              />
                            </View>
                            <View>
                              <Text style={{ color: secondaryTextColor, fontSize: 12, marginBottom: 6 }}>Model (Optional)</Text>
                              <TextInput
                                placeholder="e.g., Samsung 980 Pro"
                                placeholderTextColor={secondaryTextColor}
                                value={storage.model}
                                onChangeText={(text) => {
                                  const newStorage = [...rigSpecs.storage];
                                  newStorage[index].model = text;
                                  setRigSpecs({ ...rigSpecs, storage: newStorage });
                                }}
                                style={{
                                  backgroundColor: cardBackground,
                                  borderRadius: 12,
                                  paddingHorizontal: 12,
                                  paddingVertical: 10,
                                  fontSize: 13,
                                  color: textColor,
                                  borderWidth: 1,
                                  borderColor: borderColor,
                                }}
                              />
                            </View>
                          </View>
                        </View>
                      ))
                    )}
                  </View>
                ) : (
                  <Pressable
                    onPress={() => setIsEditingRig(true)}
                    style={{ width: '100%' }}
                  >
                    {rigSpecs.storage.length === 0 ? (
                      <Text
                        style={{
                          color: secondaryTextColor,
                          fontSize: 14,
                          fontWeight: '400',
                        }}
                      >
                        No storage drives specified
                      </Text>
                    ) : (
                      <View style={{ gap: 8 }}>
                        {rigSpecs.storage.map((storage, index) => (
                          <View key={index} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <View
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: '#8B5CF6',
                              }}
                            />
                            <Text
                              style={{
                                color: textColor,
                                fontSize: 14,
                                fontWeight: '600',
                              }}
                            >
                              {storage.type} {storage.capacity && `- ${storage.capacity}`} {storage.model && `(${storage.model})`}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </Pressable>
                )}
              </View>
            </View>

            {/* Row 4: PSU & Case */}
            <View style={{ flexDirection: 'row', gap: 12 }}>

              {/* PSU Card */}
              <View style={{ flex: 1 }}>
                {isEditingRig ? (
                  <View
                    style={{
                      backgroundColor: cardBackground,
                      borderRadius: 16,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: borderColor,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          backgroundColor: '#F59E0B' + '20',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginRight: 12,
                        }}
                      >
                        <Ionicons name="flash-outline" size={20} color="#F59E0B" />
                      </View>
                      <Text style={{ color: textColor, fontSize: 14, fontWeight: '600' }}>PSU</Text>
                    </View>
                    <TextInput
                      placeholder="e.g., 1000W 80+ Gold"
                      placeholderTextColor={secondaryTextColor}
                      value={rigSpecs.psu}
                      onChangeText={(text) => setRigSpecs({ ...rigSpecs, psu: text })}
                      style={{
                        backgroundColor: inputBackground,
                        borderRadius: 12,
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        fontSize: 13,
                        color: textColor,
                        borderWidth: 1,
                        borderColor: borderColor,
                      }}
                    />
                  </View>
                ) : (
                  <Pressable
                    onPress={() => setIsEditingRig(true)}
                    style={{
                      backgroundColor: cardBackground,
                      borderRadius: 16,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: rigSpecs.psu ? '#F59E0B' + '40' : borderColor,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          backgroundColor: '#F59E0B' + '20',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginRight: 12,
                        }}
                      >
                        <Ionicons name="flash-outline" size={20} color="#F59E0B" />
                      </View>
                      <Text style={{ color: secondaryTextColor, fontSize: 12, fontWeight: '500' }}>PSU</Text>
                    </View>
                    <Text
                      style={{
                        color: rigSpecs.psu ? textColor : secondaryTextColor,
                        fontSize: 14,
                        fontWeight: rigSpecs.psu ? '600' : '400',
                      }}
                      numberOfLines={2}
                    >
                      {rigSpecs.psu || 'Not specified'}
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>

            {/* Case Card - Full Width */}
            <View>
              {isEditingRig ? (
                <View
                  style={{
                    backgroundColor: cardBackground,
                    borderRadius: 16,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: borderColor,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        backgroundColor: '#06B6D4' + '20',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: 12,
                      }}
                    >
                      <Ionicons name="cube-outline" size={20} color="#06B6D4" />
                    </View>
                    <Text style={{ color: textColor, fontSize: 14, fontWeight: '600' }}>Case</Text>
                  </View>
                  <TextInput
                    placeholder="e.g., Lian Li O11 Dynamic"
                    placeholderTextColor={secondaryTextColor}
                    value={rigSpecs.case}
                    onChangeText={(text) => setRigSpecs({ ...rigSpecs, case: text })}
                    style={{
                      backgroundColor: inputBackground,
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      fontSize: 13,
                      color: textColor,
                      borderWidth: 1,
                      borderColor: borderColor,
                    }}
                  />
                </View>
              ) : (
                <Pressable
                  onPress={() => setIsEditingRig(true)}
                  style={{
                    backgroundColor: cardBackground,
                    borderRadius: 16,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: rigSpecs.case ? '#06B6D4' + '40' : borderColor,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        backgroundColor: '#06B6D4' + '20',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: 12,
                      }}
                    >
                      <Ionicons name="cube-outline" size={20} color="#06B6D4" />
                    </View>
                    <Text style={{ color: secondaryTextColor, fontSize: 12, fontWeight: '500' }}>Case</Text>
                  </View>
                  <Text
                    style={{
                      color: rigSpecs.case ? textColor : secondaryTextColor,
                      fontSize: 14,
                      fontWeight: rigSpecs.case ? '600' : '400',
                    }}
                    numberOfLines={2}
                  >
                    {rigSpecs.case || 'Not specified'}
                  </Text>
                </Pressable>
              )}
            </View>

            {/* AI Suggestions Button */}
            {!isEditingRig && (rigSpecs.cpu || rigSpecs.gpu) && (
              <Pressable
                onPress={handleGetAISuggestions}
                style={{
                  backgroundColor: '#EC4899',
                  borderRadius: 16,
                  paddingVertical: 16,
                  paddingHorizontal: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  marginTop: 4,
                }}
              >
                <Ionicons name="sparkles-outline" size={22} color="#FFFFFF" />
                <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
                  Get AI Upgrade Suggestions
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Settings Section */}
        <View>
          <Text style={{ color: textColor, fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
            Settings
          </Text>

          <View
            style={{
              backgroundColor: cardBackground,
              borderRadius: 16,
              padding: 20,
              gap: 20,
            }}
          >
            {/* Dark Mode Toggle */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                <Ionicons name="moon-outline" size={20} color={textColor} />
                <View>
                  <Text style={{ color: textColor, fontSize: 16, fontWeight: '600' }}>
                    Dark Mode
                  </Text>
                  <Text style={{ color: secondaryTextColor, fontSize: 14, marginTop: 4 }}>
                    Use dark theme
                  </Text>
                </View>
              </View>
              <Switch
                value={actualTheme === 'dark'}
                onValueChange={handleThemeToggle}
                trackColor={{ false: '#1F2937', true: '#EC4899' }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#1F2937"
              />
            </View>

            {/* Subscription */}
            <Pressable
              onPress={() => {
                router.push('/(tabs)/subscription');
              }}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                <Ionicons name="rocket-outline" size={20} color={textColor} />
                <View>
                  <Text style={{ color: textColor, fontSize: 16, fontWeight: '600' }}>
                    Subscription
                  </Text>
                  <Text style={{ color: secondaryTextColor, fontSize: 14, marginTop: 4 }}>
                    Manage your plan
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={secondaryTextColor} />
            </Pressable>

            {/* Notifications */}
            <Pressable
              onPress={() => {
                // Navigate to notifications settings
                console.log('Notifications settings');
              }}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                <Ionicons name="notifications-outline" size={20} color={textColor} />
                <View>
                  <Text style={{ color: textColor, fontSize: 16, fontWeight: '600' }}>
                    Notifications
                  </Text>
                  <Text style={{ color: secondaryTextColor, fontSize: 14, marginTop: 4 }}>
                    Manage notifications
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={secondaryTextColor} />
            </Pressable>

            {/* Privacy */}
            <Pressable
              onPress={() => {
                // Navigate to privacy settings
                console.log('Privacy settings');
              }}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                <Ionicons name="lock-closed-outline" size={20} color={textColor} />
                <View>
                  <Text style={{ color: textColor, fontSize: 16, fontWeight: '600' }}>
                    Privacy
                  </Text>
                  <Text style={{ color: secondaryTextColor, fontSize: 14, marginTop: 4 }}>
                    Privacy & security
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={secondaryTextColor} />
            </Pressable>

            {/* Feedback */}
            <Pressable
              onPress={() => {
                router.push('/feedback');
              }}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                <Ionicons name="chatbubble-ellipses-outline" size={20} color={textColor} />
                <View>
                  <Text style={{ color: textColor, fontSize: 16, fontWeight: '600' }}>
                    Send Feedback
                  </Text>
                  <Text style={{ color: secondaryTextColor, fontSize: 14, marginTop: 4 }}>
                    Help us improve
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={secondaryTextColor} />
            </Pressable>

            {/* About */}
            <Pressable
              onPress={() => {
                // Navigate to about page
                console.log('About');
              }}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                <Ionicons name="information-circle-outline" size={20} color={textColor} />
                <View>
                  <Text style={{ color: textColor, fontSize: 16, fontWeight: '600' }}>
                    About
                  </Text>
                  <Text style={{ color: secondaryTextColor, fontSize: 14, marginTop: 4 }}>
                    App version & info
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={secondaryTextColor} />
            </Pressable>

            {/* Logout */}
            <Pressable
              onPress={() => {
                // Handle logout
                Alert.alert('Logout', 'Are you sure you want to logout?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Logout', style: 'destructive', onPress: () => handleLogoutPress() },
                ]);
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                marginTop: 8,
                paddingTop: 20,
                borderTopWidth: 1,
                borderTopColor: '#1F2937',
              }}
            >
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
              <Text className="text-red-500 text-base font-medium">
                Logout
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
