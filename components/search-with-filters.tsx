import { TextSizes, PaddingSizes, getPadding } from '@/constants/platform-styles';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { Platform, Pressable, TextInput, View } from 'react-native';
import { useThemeColors } from '@/hooks/use-theme-colors';

type SearchWithFiltersProps = {
  placeholder?: string;
  value?: string;
  onSearchChange?: (query: string) => void;
  onFiltersPress?: () => void;
};

export function SearchWithFilters({
  placeholder = 'Search for parts...',
  value,
  onSearchChange,
  onFiltersPress,
}: SearchWithFiltersProps) {
  const colors = useThemeColors();
  const [searchQuery, setSearchQuery] = useState(value || '');

  // Update internal state when value prop changes
  useEffect(() => {
    if (value !== undefined) {
      setSearchQuery(value);
    }
  }, [value]);

  const handleChange = (text: string) => {
    setSearchQuery(text);
    onSearchChange?.(text);
  };

  return (
    <View style={{ flexDirection: 'row', gap: PaddingSizes.base, alignItems: 'center' }}>
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.cardBackground,
          borderRadius: 999,
          height: 50,
          paddingHorizontal: getPadding(20),
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
            fontSize: TextSizes.base,
            color: colors.textColor,
            paddingVertical: 0, // Remove default TextInput padding
            height: '100%',
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

