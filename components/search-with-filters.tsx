import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { useThemeColors } from '@/hooks/use-theme-colors';

type SearchWithFiltersProps = {
  placeholder?: string;
  onSearchChange?: (query: string) => void;
  onFiltersPress?: () => void;
};

export function SearchWithFilters({
  placeholder = 'Search for parts...',
  onSearchChange,
  onFiltersPress,
}: SearchWithFiltersProps) {
  const colors = useThemeColors();
  const [searchQuery, setSearchQuery] = useState('');

  const handleChange = (text: string) => {
    setSearchQuery(text);
    onSearchChange?.(text);
  };

  return (
    <View style={{ flexDirection: 'row', gap: 12 }}>
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.cardBackground,
          borderRadius: 999,
          paddingHorizontal: 20,
          paddingVertical: 14,
          borderWidth: 1,
          borderColor: colors.borderColor,
        }}
      >
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={colors.secondaryTextColor}
          value={searchQuery}
          onChangeText={handleChange}
          style={{
            flex: 1,
            fontSize: 16,
            color: colors.textColor,
          }}
        />
        <Ionicons name="search-outline" size={24} color="#EC4899" />
      </View>
      <Pressable
        onPress={onFiltersPress}
        style={{
          backgroundColor: colors.cardBackground,
          borderRadius: 999,
          width: 50,
          height: 50,
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: colors.borderColor,
        }}
      >
        {({ pressed }) => (
          <Ionicons
            name="options-outline"
            size={24}
            color="#EC4899"
            style={{ opacity: pressed ? 0.8 : 1 }}
          />
        )}
      </Pressable>
    </View>
  );
}

