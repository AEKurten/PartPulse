import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { TextInput, View } from 'react-native';

type SearchBarProps = {
  placeholder?: string;
  onSearchChange?: (query: string) => void;
};

export function SearchBar({
  placeholder = 'Search for parts...',
  onSearchChange,
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleChange = (text: string) => {
    setSearchQuery(text);
    onSearchChange?.(text);
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2B2E36',
        borderRadius: 999,
        paddingHorizontal: 20,
        paddingVertical: 14,
      }}
    >
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        value={searchQuery}
        onChangeText={handleChange}
        style={{
          flex: 1,
          fontSize: 16,
          color: '#FFFFFF',
        }}
      />
      <Ionicons name="search" size={24} color="#D62F76" />
    </View>
  );
}

