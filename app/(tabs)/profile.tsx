import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { Alert, Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/contexts/theme-context';
import { StatusBar } from 'expo-status-bar';

// Mock user data
const USER_DATA = {
  name: 'Alex',
  email: 'alex@example.com',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&q=80',
};

// Mock rig specs
const DEFAULT_RIG_SPECS = {
  cpu: '',
  gpu: '',
  motherboard: '',
  ram: '',
  storage: '',
  psu: '',
  case: '',
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { theme, actualTheme, setTheme } = useTheme();
  const [rigSpecs, setRigSpecs] = useState(DEFAULT_RIG_SPECS);
  const [isEditingRig, setIsEditingRig] = useState(false);

  useEffect(() => {
    // Load saved rig specs
    const loadPreferences = async () => {
      try {
        const savedRigSpecs = await AsyncStorage.getItem('rigSpecs');
        if (savedRigSpecs) {
          setRigSpecs(JSON.parse(savedRigSpecs));
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    };
    loadPreferences();
  }, []);

  const handleThemeToggle = async (value: boolean) => {
    await setTheme(value ? 'dark' : 'light');
  };

  const handleSaveRigSpecs = async () => {
    // Save rig specs to storage
    await AsyncStorage.setItem('rigSpecs', JSON.stringify(rigSpecs));
    setIsEditingRig(false);
    // In a real app, this would trigger AI analysis
  };

  const handleGetAISuggestions = () => {
    // Navigate to AI suggestions page with rig specs
    router.push({
      pathname: '/ai-tools',
      params: { rigSpecs: JSON.stringify(rigSpecs) },
    });
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
        contentContainerStyle={{
          paddingLeft: Math.max(insets.left, 24),
          paddingRight: Math.max(insets.right, 24),
          paddingBottom: 24,
        }}
      >
        {/* Header */}
        <View style={{ paddingTop: 24, marginBottom: 32 }}>
          <Text style={{ color: textColor, fontSize: 24, fontWeight: 'bold' }}>
            Profile
          </Text>
        </View>

        {/* User Profile Card */}
        <View
          style={{
            backgroundColor: cardBackground,
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              overflow: 'hidden',
              marginRight: 16,
              backgroundColor: iconBackground,
            }}
          >
            <Image
              source={{ uri: USER_DATA.avatar }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: textColor, fontSize: 20, fontWeight: 'bold' }}>
              {USER_DATA.name}
            </Text>
            <Text style={{ color: secondaryTextColor, fontSize: 14, marginTop: 4 }}>
              {USER_DATA.email}
            </Text>
            <Pressable
              onPress={() => {
                // Navigate to edit profile
                console.log('Edit profile');
              }}
              style={{ marginTop: 8 }}
            >
              <Text className="text-pink-500 text-sm font-medium">
                Edit Profile
              </Text>
            </Pressable>
          </View>
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
                // Navigate to listings
                console.log('View listings');
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
              <Text style={{ color: textColor, fontSize: 20, fontWeight: 'bold' }}>
                3
              </Text>
              <Text style={{ color: secondaryTextColor, fontSize: 14, marginTop: 4 }}>
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
              <Text style={{ color: textColor, fontSize: 20, fontWeight: 'bold' }}>
                12
              </Text>
              <Text style={{ color: secondaryTextColor, fontSize: 14, marginTop: 4 }}>
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
              <Text style={{ color: textColor, fontSize: 20, fontWeight: 'bold' }}>
                8
              </Text>
              <Text style={{ color: secondaryTextColor, fontSize: 14, marginTop: 4 }}>
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
                <Text className="text-pink-500 text-base font-medium">
                  Edit
                </Text>
              </Pressable>
            ) : (
              <View style={{ flexDirection: 'row', gap: 20 }}>
                <Pressable
                  onPress={() => {
                    setIsEditingRig(false);
                    setRigSpecs(DEFAULT_RIG_SPECS);
                  }}
                  style={{ paddingVertical: 8, paddingHorizontal: 4 }}
                >
                  <Text className="text-neutral-300 text-base font-medium">
                    Cancel
                  </Text>
                </Pressable>
                <Pressable 
                  onPress={handleSaveRigSpecs}
                  style={{ paddingVertical: 8, paddingHorizontal: 4 }}
                >
                  <Text className="text-pink-500 text-base font-medium">
                    Save
                  </Text>
                </Pressable>
              </View>
            )}
          </View>

          <View
            style={{
              backgroundColor: cardBackground,
              borderRadius: 16,
              padding: 20,
              gap: 16,
            }}
          >
            {/* CPU */}
            <View>
              <Text style={{ color: secondaryTextColor, fontSize: 16, fontWeight: '500', marginBottom: 8 }}>CPU</Text>
              {isEditingRig ? (
                <TextInput
                  placeholder="e.g., Intel i9-14900K"
                  placeholderTextColor={secondaryTextColor}
                  value={rigSpecs.cpu}
                  onChangeText={(text) => setRigSpecs({ ...rigSpecs, cpu: text })}
                  style={{
                    backgroundColor: inputBackground,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 14,
                    color: textColor,
                    borderWidth: 1,
                    borderColor: borderColor,
                  }}
                />
              ) : (
                <Text style={{ color: textColor, fontSize: 18, fontWeight: '500' }}>
                  {rigSpecs.cpu || 'Not specified'}
                </Text>
              )}
            </View>

            {/* GPU */}
            <View>
              <Text style={{ color: secondaryTextColor, fontSize: 16, fontWeight: '500', marginBottom: 8 }}>GPU</Text>
              {isEditingRig ? (
                <TextInput
                  placeholder="e.g., NVIDIA RTX 4090"
                  placeholderTextColor={secondaryTextColor}
                  value={rigSpecs.gpu}
                  onChangeText={(text) => setRigSpecs({ ...rigSpecs, gpu: text })}
                  style={{
                    backgroundColor: inputBackground,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 14,
                    color: textColor,
                    borderWidth: 1,
                    borderColor: borderColor,
                  }}
                />
              ) : (
                <Text style={{ color: textColor, fontSize: 18, fontWeight: '500' }}>
                  {rigSpecs.gpu || 'Not specified'}
                </Text>
              )}
            </View>

            {/* Motherboard */}
            <View>
              <Text style={{ color: secondaryTextColor, fontSize: 16, fontWeight: '500', marginBottom: 8 }}>Motherboard</Text>
              {isEditingRig ? (
                <TextInput
                  placeholder="e.g., ASUS ROG Strix Z790-E"
                  placeholderTextColor={secondaryTextColor}
                  value={rigSpecs.motherboard}
                  onChangeText={(text) => setRigSpecs({ ...rigSpecs, motherboard: text })}
                  style={{
                    backgroundColor: inputBackground,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 14,
                    color: textColor,
                    borderWidth: 1,
                    borderColor: borderColor,
                  }}
                />
              ) : (
                <Text style={{ color: textColor, fontSize: 18, fontWeight: '500' }}>
                  {rigSpecs.motherboard || 'Not specified'}
                </Text>
              )}
            </View>

            {/* RAM */}
            <View>
              <Text style={{ color: secondaryTextColor, fontSize: 16, fontWeight: '500', marginBottom: 8 }}>RAM</Text>
              {isEditingRig ? (
                <TextInput
                  placeholder="e.g., 32GB DDR5-6000"
                  placeholderTextColor={secondaryTextColor}
                  value={rigSpecs.ram}
                  onChangeText={(text) => setRigSpecs({ ...rigSpecs, ram: text })}
                  style={{
                    backgroundColor: inputBackground,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 14,
                    color: textColor,
                    borderWidth: 1,
                    borderColor: borderColor,
                  }}
                />
              ) : (
                <Text style={{ color: textColor, fontSize: 18, fontWeight: '500' }}>
                  {rigSpecs.ram || 'Not specified'}
                </Text>
              )}
            </View>

            {/* Storage */}
            <View>
              <Text style={{ color: secondaryTextColor, fontSize: 16, fontWeight: '500', marginBottom: 8 }}>Storage</Text>
              {isEditingRig ? (
                <TextInput
                  placeholder="e.g., 2TB NVMe SSD"
                  placeholderTextColor={secondaryTextColor}
                  value={rigSpecs.storage}
                  onChangeText={(text) => setRigSpecs({ ...rigSpecs, storage: text })}
                  style={{
                    backgroundColor: inputBackground,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 14,
                    color: textColor,
                    borderWidth: 1,
                    borderColor: borderColor,
                  }}
                />
              ) : (
                <Text style={{ color: textColor, fontSize: 18, fontWeight: '500' }}>
                  {rigSpecs.storage || 'Not specified'}
                </Text>
              )}
            </View>

            {/* PSU */}
            <View>
              <Text style={{ color: secondaryTextColor, fontSize: 16, fontWeight: '500', marginBottom: 8 }}>Power Supply</Text>
              {isEditingRig ? (
                <TextInput
                  placeholder="e.g., 1000W 80+ Gold"
                  placeholderTextColor={secondaryTextColor}
                  value={rigSpecs.psu}
                  onChangeText={(text) => setRigSpecs({ ...rigSpecs, psu: text })}
                  style={{
                    backgroundColor: inputBackground,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 14,
                    color: textColor,
                    borderWidth: 1,
                    borderColor: borderColor,
                  }}
                />
              ) : (
                <Text style={{ color: textColor, fontSize: 18, fontWeight: '500' }}>
                  {rigSpecs.psu || 'Not specified'}
                </Text>
              )}
            </View>

            {/* Case */}
            <View>
              <Text style={{ color: secondaryTextColor, fontSize: 16, fontWeight: '500', marginBottom: 8 }}>Case</Text>
              {isEditingRig ? (
                <TextInput
                  placeholder="e.g., Lian Li O11 Dynamic"
                  placeholderTextColor={secondaryTextColor}
                  value={rigSpecs.case}
                  onChangeText={(text) => setRigSpecs({ ...rigSpecs, case: text })}
                  style={{
                    backgroundColor: inputBackground,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 14,
                    color: textColor,
                    borderWidth: 1,
                    borderColor: borderColor,
                  }}
                />
              ) : (
                <Text style={{ color: textColor, fontSize: 18, fontWeight: '500' }}>
                  {rigSpecs.case || 'Not specified'}
                </Text>
              )}
            </View>

            {/* AI Suggestions Button */}
            {!isEditingRig && (rigSpecs.cpu || rigSpecs.gpu) && (
              <Pressable
                onPress={handleGetAISuggestions}
                style={{
                  backgroundColor: '#EC4899',
                  borderRadius: 12,
                  paddingVertical: 14,
                  paddingHorizontal: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  marginTop: 8,
                }}
              >
                <Ionicons name="sparkles-outline" size={20} color="#FFFFFF" />
                <Text className="text-white text-base font-semibold">
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
                  { text: 'Logout', style: 'destructive', onPress: () => router.push('/auth/login') },
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
