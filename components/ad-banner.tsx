import { useThemeColors } from '@/hooks/use-theme-colors';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, Pressable } from 'react-native';
import { useSubscription } from '@/contexts/subscription-context';

interface AdBannerProps {
  style?: any;
  onUpgradePress?: () => void;
}

export function AdBanner({ style, onUpgradePress }: AdBannerProps) {
  const colors = useThemeColors();
  const { subscription } = useSubscription();

  // Don't show ads if user has premium
  if (!subscription.features.hasAds) {
    return null;
  }

  return (
    <Pressable
      onPress={onUpgradePress}
      style={[
        {
          backgroundColor: colors.cardBackground,
          borderRadius: 12,
          padding: 16,
          borderWidth: 1,
          borderColor: colors.borderColor,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        style,
      ]}
    >
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <Ionicons name="rocket" size={16} color="#EC4899" style={{ marginRight: 6 }} />
          <Text style={{ color: colors.textColor, fontSize: 14, fontWeight: '600' }}>
            Upgrade to Premium
          </Text>
        </View>
        <Text style={{ color: colors.secondaryTextColor, fontSize: 12 }}>
          Remove ads • Unlimited AI builds
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.secondaryTextColor} />
    </Pressable>
  );
}

