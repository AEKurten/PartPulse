import { Pressable, Text, View } from 'react-native';
import { useThemeColors } from '@/hooks/use-theme-colors';

type SectionHeaderProps = {
  title: string;
  showAllText?: string;
  onShowAllPress?: () => void;
};

export function SectionHeader({
  title,
  showAllText = 'Show all',
  onShowAllPress,
}: SectionHeaderProps) {
  const colors = useThemeColors();
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
      }}
    >
      <Text style={{ color: colors.textColor, fontSize: 20, fontWeight: 'bold' }}>{title}</Text>
      {onShowAllPress && (
        <Pressable onPress={onShowAllPress}>
          <Text style={{ color: '#EC4899' }}>{showAllText}</Text>
        </Pressable>
      )}
    </View>
  );
}

