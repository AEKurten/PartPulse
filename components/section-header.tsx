import { Pressable, Text, View } from 'react-native';

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
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
      }}
    >
      <Text className="text-xl font-bold text-white">{title}</Text>
      {onShowAllPress && (
        <Pressable onPress={onShowAllPress}>
          <Text className="text-[#EC4899]">{showAllText}</Text>
        </Pressable>
      )}
    </View>
  );
}

