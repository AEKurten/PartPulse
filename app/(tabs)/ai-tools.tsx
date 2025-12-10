import { useThemeColors } from '@/hooks/use-theme-colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSubscription } from '@/contexts/subscription-context';
import SubscriptionPaywall from '@/app/subscription-paywall';

const buildTypes = [
  { id: 'gaming', label: 'Gaming', icon: 'game-controller-outline', description: 'High-performance gaming rig' },
  { id: 'office', label: 'Office', icon: 'briefcase-outline', description: 'Productivity and work tasks' },
  { id: 'creative', label: 'Creative', icon: 'color-palette-outline', description: 'Video editing, 3D rendering' },
  { id: 'streaming', label: 'Streaming', icon: 'videocam-outline', description: 'Content creation & streaming' },
  { id: 'budget', label: 'Budget', icon: 'wallet-outline', description: 'Affordable performance' },
  { id: 'enthusiast', label: 'Enthusiast', icon: 'rocket-outline', description: 'Maximum performance' },
];

const resolutions = [
  { id: '1080p', label: '1080p (Full HD)', value: '1920x1080' },
  { id: '1440p', label: '1440p (QHD)', value: '2560x1440' },
  { id: '4k', label: '4K (UHD)', value: '3840x2160' },
  { id: 'ultrawide', label: 'Ultrawide 1440p', value: '3440x1440' },
  { id: 'custom', label: 'Custom Resolution', value: 'custom' },
];

export default function AIToolsScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const { subscription, canUseAIBuild, useAIBuild, getUsagePercentage } = useSubscription();
  const [buildMode, setBuildMode] = useState<'new' | 'upgrade'>('new');
  const [budget, setBudget] = useState('');
  const [selectedBuildType, setSelectedBuildType] = useState<string | null>(null);
  const [selectedResolution, setSelectedResolution] = useState<string | null>(null);
  const [customResolution, setCustomResolution] = useState('');
  const [radius, setRadius] = useState('50');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isFirstUse, setIsFirstUse] = useState(false);

  const proceedWithGeneration = async () => {
    setIsGenerating(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const resolutionValue = selectedResolution === 'custom' ? customResolution : resolutions.find(r => r.id === selectedResolution)?.value || '';
      
      router.push({
        pathname: '/ai-builder-results',
        params: {
          buildMode,
          budget,
          buildType: selectedBuildType,
          resolution: resolutionValue,
          radius,
        },
      });
      
      setIsGenerating(false);
    }, 1500);
  };

  const handleGenerate = async () => {
    if (!budget || !selectedBuildType || !selectedResolution || !radius) {
      return;
    }

    // Check if this is first use (free plan with 0 usage)
    const isFirstTime = subscription.plan === 'free' && used === 0;
    
    // Check if user can use AI feature
    if (!canUseAIBuild(buildMode)) {
      setIsFirstUse(false);
      setShowPaywall(true);
      return;
    }

    // Show paywall on first use for free users (soft paywall - can dismiss)
    if (isFirstTime) {
      setIsFirstUse(true);
      setShowPaywall(true);
      return; // Wait for user to dismiss or subscribe
    }

    // Record usage
    const success = await useAIBuild(buildMode);
    if (!success) {
      setIsFirstUse(false);
      setShowPaywall(true);
      return;
    }

    await proceedWithGeneration();
  };

  const handleContinueWithFree = async () => {
    // Record usage when continuing with free plan
    await useAIBuild(buildMode);
    await proceedWithGeneration();
  };

  const usagePercentage = getUsagePercentage(buildMode);
  const limit = buildMode === 'new' ? subscription.features.aiBuildsPerMonth : subscription.features.aiUpgradesPerMonth;
  const used = buildMode === 'new' ? subscription.usage.aiBuildsUsed : subscription.usage.aiUpgradesUsed;

  const canGenerate = budget && selectedBuildType && selectedResolution && radius && 
    (selectedResolution !== 'custom' || customResolution);

  const usagePercentage = getUsagePercentage(buildMode);
  const limit = buildMode === 'new' ? subscription.features.aiBuildsPerMonth : subscription.features.aiUpgradesPerMonth;
  const used = buildMode === 'new' ? subscription.usage.aiBuildsUsed : subscription.usage.aiUpgradesUsed;
  const [showPaywall, setShowPaywall] = useState(false);
  const [isFirstUse, setIsFirstUse] = useState(false);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: colors.backgroundColor }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
    >
      <StatusBar style={colors.statusBarStyle} />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 24,
          paddingBottom: Math.max(insets.bottom, 24) + 100,
          paddingLeft: Math.max(insets.left, 24),
          paddingRight: Math.max(insets.right, 24),
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={{ marginBottom: 32 }}>
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
              <Ionicons name="sparkles" size={24} color="#EC4899" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textColor, fontSize: 28, fontWeight: 'bold', marginBottom: 4 }}>
                AI Build Planner
              </Text>
              <Text style={{ color: colors.secondaryTextColor, fontSize: 14 }}>
                Let AI create the perfect PC build for you
              </Text>
            </View>
          </View>

          {/* Usage Indicator */}
          {limit !== -1 && (
            <View
              style={{
                backgroundColor: colors.cardBackground,
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.borderColor,
                marginTop: 16,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ color: colors.textColor, fontSize: 14, fontWeight: '600' }}>
                  {buildMode === 'new' ? 'AI Builds' : 'AI Upgrades'} remaining this month
                </Text>
                <Text style={{ color: colors.textColor, fontSize: 14, fontWeight: 'bold' }}>
                  {limit - used} / {limit}
                </Text>
              </View>
              <View
                style={{
                  height: 8,
                  backgroundColor: colors.iconBackground,
                  borderRadius: 4,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    height: '100%',
                    width: `${usagePercentage}%`,
                    backgroundColor: usagePercentage >= 80 ? '#EF4444' : usagePercentage >= 60 ? '#F59E0B' : '#10B981',
                    borderRadius: 4,
                  }}
                />
              </View>
              {!canUseAIBuild(buildMode) && (
                <Pressable
                  onPress={() => setShowPaywall(true)}
                  style={{ marginTop: 12 }}
                >
                  <View
                    style={{
                      backgroundColor: '#EC4899' + '20',
                      borderRadius: 8,
                      padding: 12,
                      borderWidth: 1,
                      borderColor: '#EC4899',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name="rocket" size={18} color="#EC4899" style={{ marginRight: 8 }} />
                    <Text style={{ color: '#EC4899', fontSize: 14, fontWeight: '600' }}>
                      Upgrade to unlock more
                    </Text>
                  </View>
                </Pressable>
              )}
            </View>
          )}
        </View>

        {/* Build Mode Selection */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ color: colors.textColor, fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
            Build Mode
          </Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Pressable
              onPress={() => setBuildMode('new')}
              style={{
                flex: 1,
                backgroundColor: buildMode === 'new' ? '#EC4899' + '20' : colors.cardBackground,
                borderRadius: 16,
                padding: 16,
                borderWidth: 2,
                borderColor: buildMode === 'new' ? '#EC4899' : colors.borderColor,
                alignItems: 'center',
              }}
            >
              <Ionicons
                name="add-circle-outline"
                size={32}
                color={buildMode === 'new' ? '#EC4899' : colors.secondaryTextColor}
                style={{ marginBottom: 8 }}
              />
              <Text
                style={{
                  color: buildMode === 'new' ? '#EC4899' : colors.textColor,
                  fontSize: 16,
                  fontWeight: buildMode === 'new' ? '600' : '400',
                  marginBottom: 4,
                }}
              >
                New Build
              </Text>
              <Text
                style={{
                  color: colors.secondaryTextColor,
                  fontSize: 12,
                  textAlign: 'center',
                }}
              >
                Create a complete new PC build
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setBuildMode('upgrade')}
              style={{
                flex: 1,
                backgroundColor: buildMode === 'upgrade' ? '#EC4899' + '20' : colors.cardBackground,
                borderRadius: 16,
                padding: 16,
                borderWidth: 2,
                borderColor: buildMode === 'upgrade' ? '#EC4899' : colors.borderColor,
                alignItems: 'center',
              }}
            >
              <Ionicons
                name="arrow-up-circle-outline"
                size={32}
                color={buildMode === 'upgrade' ? '#EC4899' : colors.secondaryTextColor}
                style={{ marginBottom: 8 }}
              />
              <Text
                style={{
                  color: buildMode === 'upgrade' ? '#EC4899' : colors.textColor,
                  fontSize: 16,
                  fontWeight: buildMode === 'upgrade' ? '600' : '400',
                  marginBottom: 4,
                }}
              >
                Upgrade Build
              </Text>
              <Text
                style={{
                  color: colors.secondaryTextColor,
                  fontSize: 12,
                  textAlign: 'center',
                }}
              >
                Upgrade your current PC
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Budget Input */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ color: colors.textColor, fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
            {buildMode === 'upgrade' ? 'Upgrade Budget' : 'Budget'}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.cardBackground,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.borderColor,
              paddingHorizontal: 16,
              paddingVertical: 4,
            }}
          >
            <Text style={{ color: colors.secondaryTextColor, fontSize: 18, marginRight: 8 }}>$</Text>
            <TextInput
              value={budget}
              onChangeText={setBudget}
              placeholder={buildMode === 'upgrade' ? 'Enter upgrade budget' : 'Enter your budget'}
              placeholderTextColor={colors.secondaryTextColor}
              keyboardType="numeric"
              style={{
                flex: 1,
                color: colors.textColor,
                fontSize: 18,
                paddingVertical: 16,
              }}
            />
          </View>
        </View>

        {/* Build Type Selection */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ color: colors.textColor, fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
            {buildMode === 'upgrade' ? 'Upgrade Focus' : 'Build Type'}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {buildTypes.map((type) => (
              <Pressable
                key={type.id}
                onPress={() => setSelectedBuildType(type.id)}
                style={{
                  flex: 1,
                  minWidth: '45%',
                  backgroundColor: selectedBuildType === type.id ? '#EC4899' + '20' : colors.cardBackground,
                  borderRadius: 16,
                  padding: 16,
                  borderWidth: 2,
                  borderColor: selectedBuildType === type.id ? '#EC4899' : colors.borderColor,
                }}
              >
                <View style={{ alignItems: 'center' }}>
                  <Ionicons
                    name={type.icon as any}
                    size={32}
                    color={selectedBuildType === type.id ? '#EC4899' : colors.secondaryTextColor}
                    style={{ marginBottom: 8 }}
                  />
                  <Text
                    style={{
                      color: selectedBuildType === type.id ? '#EC4899' : colors.textColor,
                      fontSize: 14,
                      fontWeight: selectedBuildType === type.id ? '600' : '400',
                      marginBottom: 4,
                      textAlign: 'center',
                    }}
                  >
                    {type.label}
                  </Text>
                  <Text
                    style={{
                      color: colors.secondaryTextColor,
                      fontSize: 11,
                      textAlign: 'center',
                    }}
                  >
                    {type.description}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Target Resolution */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ color: colors.textColor, fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
            Target Resolution
          </Text>
          <View style={{ gap: 12 }}>
            {resolutions.map((res) => (
              <Pressable
                key={res.id}
                onPress={() => setSelectedResolution(res.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: selectedResolution === res.id ? '#EC4899' + '20' : colors.cardBackground,
                  borderRadius: 12,
                  padding: 16,
                  borderWidth: 2,
                  borderColor: selectedResolution === res.id ? '#EC4899' : colors.borderColor,
                }}
              >
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: selectedResolution === res.id ? '#EC4899' : colors.borderColor,
                    backgroundColor: selectedResolution === res.id ? '#EC4899' : 'transparent',
                    marginRight: 12,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  {selectedResolution === res.id && (
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  )}
                </View>
                <Text
                  style={{
                    color: selectedResolution === res.id ? '#EC4899' : colors.textColor,
                    fontSize: 16,
                    fontWeight: selectedResolution === res.id ? '600' : '400',
                    flex: 1,
                  }}
                >
                  {res.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Custom Resolution Input */}
          {selectedResolution === 'custom' && (
            <View style={{ marginTop: 16 }}>
              <TextInput
                value={customResolution}
                onChangeText={setCustomResolution}
                placeholder="e.g., 3840x2160"
                placeholderTextColor={colors.secondaryTextColor}
                style={{
                  backgroundColor: colors.cardBackground,
                  borderRadius: 12,
                  padding: 16,
                  color: colors.textColor,
                  fontSize: 16,
                  borderWidth: 1,
                  borderColor: colors.borderColor,
                }}
              />
            </View>
          )}
        </View>

        {/* Search Radius */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ color: colors.textColor, fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
            Search Radius (miles)
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.cardBackground,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.borderColor,
              paddingHorizontal: 16,
            }}
          >
            <Ionicons name="location-outline" size={20} color={colors.secondaryTextColor} style={{ marginRight: 12 }} />
            <TextInput
              value={radius}
              onChangeText={setRadius}
              placeholder="50"
              placeholderTextColor={colors.secondaryTextColor}
              keyboardType="numeric"
              style={{
                flex: 1,
                color: colors.textColor,
                fontSize: 18,
                paddingVertical: 16,
              }}
            />
            <Text style={{ color: colors.secondaryTextColor, fontSize: 14 }}>miles</Text>
          </View>
          <Text style={{ color: colors.secondaryTextColor, fontSize: 12, marginTop: 8 }}>
            AI will search for parts within this radius
          </Text>
        </View>

        {/* AI Features Info Card */}
        <View
          style={{
            backgroundColor: colors.cardBackground,
            borderRadius: 16,
            padding: 20,
            marginBottom: 32,
            borderWidth: 1,
            borderColor: colors.borderColor,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Ionicons name="sparkles" size={20} color="#EC4899" style={{ marginRight: 8 }} />
            <Text style={{ color: colors.textColor, fontSize: 16, fontWeight: '600' }}>
              AI-Powered Features
            </Text>
          </View>
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" style={{ marginRight: 8, marginTop: 2 }} />
              <Text style={{ color: colors.secondaryTextColor, fontSize: 14, flex: 1 }}>
                Smart part compatibility checking
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" style={{ marginRight: 8, marginTop: 2 }} />
              <Text style={{ color: colors.secondaryTextColor, fontSize: 14, flex: 1 }}>
                Price optimization within budget
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" style={{ marginRight: 8, marginTop: 2 }} />
              <Text style={{ color: colors.secondaryTextColor, fontSize: 14, flex: 1 }}>
                Local seller recommendations
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" style={{ marginRight: 8, marginTop: 2 }} />
              <Text style={{ color: colors.secondaryTextColor, fontSize: 14, flex: 1 }}>
                Performance predictions for your use case
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Generate Button - Fixed at Bottom */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingBottom: Math.max(insets.bottom, 24),
          paddingTop: 16,
          paddingHorizontal: Math.max(insets.left, 24),
          paddingRight: Math.max(insets.right, 24),
          backgroundColor: colors.backgroundColor,
          borderTopWidth: 1,
          borderTopColor: colors.borderColor,
        }}
      >
        <Pressable
          onPress={handleGenerate}
          disabled={!canGenerate || isGenerating}
          style={{ opacity: canGenerate && !isGenerating ? 1 : 0.5 }}
        >
          {({ pressed }) => (
            <LinearGradient
              colors={['#EC4899', '#F97316']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                borderRadius: 16,
                height: 56,
                width: '100%',
                opacity: pressed ? 0.8 : 1,
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
              }}
            >
              {isGenerating ? (
                <>
                  <Ionicons name="hourglass-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' }}>
                    {buildMode === 'upgrade' ? 'Generating Upgrades...' : 'Generating Build...'}
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="sparkles" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' }}>
                    {buildMode === 'upgrade' ? 'Generate AI Upgrades' : 'Generate AI Build'}
                  </Text>
                </>
              )}
            </LinearGradient>
          )}
        </Pressable>
      </View>

      {/* Paywall Modal */}
      <SubscriptionPaywall
        visible={showPaywall}
        onClose={() => {
          if (isFirstUse) {
            // If first use, proceed with free plan when dismissed
            handleContinueWithFree();
          }
          setShowPaywall(false);
          setIsFirstUse(false);
        }}
        onSubscribe={async () => {
          // After subscribing, proceed with generation
          await proceedWithGeneration();
        }}
        buildMode={buildMode}
        trigger={isFirstUse ? 'first-use' : canUseAIBuild(buildMode) ? 'upgrade-prompt' : 'limit-reached'}
      />
    </KeyboardAvoidingView>
  );
}
