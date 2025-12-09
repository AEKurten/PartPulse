import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

type PrivateChatProps = {
  onSend?: (message: string) => void;
  initialMessage?: string;
};

export function PrivateChat({ onSend, initialMessage = '' }: PrivateChatProps) {
  const [message, setMessage] = useState(initialMessage);

  const handleSend = () => {
    if (message.trim()) {
      onSend?.(message);
      setMessage('');
    }
  };

  return (
    <View
      style={{
        backgroundColor: '#2B2E36',
        borderRadius: 16,
        padding: 20,
      }}
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Ionicons name="chatbubble-ellipses-outline" size={16} color="#9CA3AF" />
        <Text className="text-neutral-400 text-sm font-semibold">
          Chat to seller
        </Text>
      </View>

      {/* Chat Input Container */}
      <View
        style={{
          flexDirection: 'row',
          gap: 12,
          alignItems: 'flex-end',
        }}
      >
        {/* Chat Box */}
        <View style={{ flex: 1 }}>
          <TextInput
            placeholder="Type your message..."
            placeholderTextColor="#9CA3AF"
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={500}
            style={{
              backgroundColor: '#1F2937',
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              fontSize: 14,
              color: '#FFFFFF',
              minHeight: 48,
              maxHeight: 120,
              textAlignVertical: 'top',
            }}
          />
        </View>

        {/* Send Button */}
        <Pressable onPress={handleSend} disabled={!message.trim()}>
          {({ pressed }) => (
            <LinearGradient
              colors={['#EC4899', '#F97316']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                borderRadius: 12,
                height: 48,
                width: 80,
                opacity: !message.trim() ? 0.5 : pressed ? 0.8 : 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text className="text-white text-base font-semibold">
                Send
              </Text>
            </LinearGradient>
          )}
        </Pressable>
      </View>
    </View>
  );
}

