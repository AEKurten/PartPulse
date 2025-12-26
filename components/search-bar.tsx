import { TextSizes, PaddingSizes, getPadding } from '@/constants/platform-styles';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Platform, TextInput, View, Pressable } from 'react-native';
import { useThemeColors } from '@/hooks/use-theme-colors';

type SearchBarProps = {
  placeholder?: string;
  onSearchChange?: (query: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onSubmit?: (query: string) => void;
};

export function SearchBar({
  placeholder = 'Search for parts...',
  onSearchChange,
  onFocus,
  onBlur,
  onSubmit,
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

  const handleSubmit = () => {
    if (searchQuery.trim() && onSubmit) {
      onSubmit(searchQuery.trim());
    }
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.cardBackground,
        borderRadius: 999,
        height: 50,
        paddingHorizontal: getPadding(20),
      }}
    >
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={colors.secondaryTextColor}
        value={searchQuery}
        onChangeText={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onSubmitEditing={handleSubmit}
        returnKeyType="search"
        style={{
          flex: 1,
          fontSize: TextSizes.base,
          color: colors.textColor,
          paddingVertical: 0, // Remove default TextInput padding
          height: '100%',
        }}
      />
      <Pressable onPress={handleSubmit} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Ionicons name="search-outline" size={24} color="#D62F76" />
      </Pressable>
    </View>
  );
}

