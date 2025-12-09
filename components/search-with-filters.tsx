import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

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
      <Pressable
        onPress={onFiltersPress}
        style={{
          backgroundColor: '#2B2E36',
          borderRadius: 999,
          width: 50,
          height: 50,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {({ pressed }) => (
          <Ionicons
            name="options-outline"
            size={24}
            color="#D62F76"
            style={{ opacity: pressed ? 0.8 : 1 }}
          />
        )}
      </Pressable>
    </View>
  );
}

