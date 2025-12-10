import { Pressable, Text, View } from 'react-native';
import { useThemeColors } from '@/hooks/use-theme-colors';

type FilterChipProps = {
  label: string;
  isActive?: boolean;
  onPress?: () => void;
};

export function FilterChip({ label, isActive = false, onPress }: FilterChipProps) {
  const colors = useThemeColors();
  
  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <View
          style={{
            backgroundColor: isActive ? '#EC4899' + '20' : colors.inputBackground,
            borderRadius: 20,
            paddingHorizontal: 16,
            paddingVertical: 8,
            marginRight: 8,
            borderWidth: isActive ? 2 : 0,
            borderColor: isActive ? '#EC4899' : 'transparent',
            opacity: pressed ? 0.8 : 1,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: isActive ? '#EC4899' : colors.textColor,
            }}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

