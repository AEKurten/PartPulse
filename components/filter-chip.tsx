import { Pressable, Text, View } from 'react-native';

type FilterChipProps = {
  label: string;
  isActive?: boolean;
  onPress?: () => void;
};

export function FilterChip({ label, isActive = false, onPress }: FilterChipProps) {
  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <View
          style={{
            backgroundColor: isActive ? '#EC4899' : '#2B2E36',
            borderRadius: 20,
            paddingHorizontal: 16,
            paddingVertical: 8,
            marginRight: 8,
            opacity: pressed ? 0.8 : 1,
          }}
        >
          <Text
            className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-neutral-400'}`}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

