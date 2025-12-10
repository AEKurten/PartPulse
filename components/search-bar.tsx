import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { useThemeColors } from '@/hooks/use-theme-colors';

type SearchBarProps = {
  placeholder?: string;
  onSearchChange?: (query: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
};

export function SearchBar({
  placeholder = 'Search for parts...',
  onSearchChange,
  onFocus,
  onBlur,
}: SearchBarProps) {
  const colors = useThemeColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (text: string) => {
    setSearchQuery(text);
    onSearchChange?.(text);
  };

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.cardBackground,
        borderRadius: 999,
        paddingHorizontal: 20,
        paddingVertical: 14,
      }}
    >
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={colors.secondaryTextColor}
        value={searchQuery}
        onChangeText={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={{
          flex: 1,
          fontSize: 16,
          color: colors.textColor,
        }}
      />
      <Ionicons name="search-outline" size={24} color="#D62F76" />
    </View>
  );
}

