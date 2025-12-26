import { useThemeColors } from '@/hooks/use-theme-colors';
import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ShareModalProps = {
  visible: boolean;
  onClose: () => void;
  onShare: (method: 'link' | 'social' | 'message' | 'other', platform?: string) => void;
  productName?: string;
};

const SHARE_OPTIONS = [
  { method: 'link' as const, platform: 'copy_link', label: 'Copy Link', icon: 'link-outline' },
  { method: 'social' as const, platform: 'whatsapp', label: 'WhatsApp', icon: 'logo-whatsapp' },
  { method: 'social' as const, platform: 'facebook', label: 'Facebook', icon: 'logo-facebook' },
  { method: 'social' as const, platform: 'twitter', label: 'Twitter', icon: 'logo-twitter' },
  { method: 'message' as const, platform: 'sms', label: 'Message', icon: 'chatbubble-outline' },
  { method: 'social' as const, platform: 'other', label: 'More', icon: 'share-social-outline' },
];

export function ShareModal({ visible, onClose, onShare, productName }: ShareModalProps) {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end',
        }}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        <View
          style={{
            backgroundColor: colors.cardBackground,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingTop: 24,
            paddingBottom: Math.max(insets.bottom, 24),
            paddingHorizontal: Math.max(insets.left, 24),
            paddingRight: Math.max(insets.right, 24),
          }}
        >
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <Text style={{ color: colors.textColor, fontSize: 22, fontWeight: 'bold' }}>
              Share {productName || 'Product'}
            </Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.secondaryTextColor} />
            </Pressable>
          </View>

          {/* Share Options */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'flex-start' }}>
            {SHARE_OPTIONS.map((option) => (
              <Pressable
                key={`${option.method}-${option.platform}`}
                onPress={() => {
                  onShare(option.method, option.platform);
                }}
                style={{
                  width: '30%',
                  alignItems: 'center',
                  paddingVertical: 16,
                  paddingHorizontal: 8,
                }}
              >
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: colors.iconBackground,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 8,
                  }}
                >
                  <Ionicons name={option.icon as any} size={28} color={colors.textColor} />
                </View>
                <Text style={{ color: colors.textColor, fontSize: 12, textAlign: 'center' }}>
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

