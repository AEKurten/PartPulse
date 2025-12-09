import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/contexts/theme-context';
import { LinearGradient } from 'expo-linear-gradient';

export default function FeedbackScreen() {
  const insets = useSafeAreaInsets();
  const { actualTheme } = useTheme();
  const [feedback, setFeedback] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState<number | null>(null);

  const backgroundColor = actualTheme === 'dark' ? '#0F0E11' : '#FFFFFF';
  const cardBackground = actualTheme === 'dark' ? '#2B2E36' : '#F3F4F6';
  const textColor = actualTheme === 'dark' ? '#FFFFFF' : '#111827';
  const secondaryTextColor = actualTheme === 'dark' ? '#D1D5DB' : '#6B7280';
  const inputBackground = actualTheme === 'dark' ? '#1F2937' : '#FFFFFF';
  const borderColor = actualTheme === 'dark' ? '#374151' : '#E5E7EB';

  const handleSubmit = () => {
    if (!feedback.trim()) {
      Alert.alert('Required', 'Please provide your feedback');
      return;
    }

    // In a real app, this would send to your backend
    console.log('Feedback submitted:', {
      feedback,
      email: email.trim() || 'Not provided',
      rating,
    });

    Alert.alert(
      'Thank You!',
      'Your feedback has been submitted. We appreciate your input!',
      [
        {
          text: 'OK',
          onPress: () => {
            router.back();
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View
        style={{
          flex: 1,
          backgroundColor,
          paddingTop: insets.top,
        }}
      >
        <StatusBar style={actualTheme === 'dark' ? 'light' : 'dark'} />
        
        {/* Header */}
        <View
          style={{
            paddingHorizontal: Math.max(insets.left, 24),
            paddingRight: Math.max(insets.right, 24),
            paddingTop: 24,
            paddingBottom: 24,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <Pressable
              onPress={() => router.back()}
              style={{ marginRight: 16 }}
            >
              <Ionicons name="arrow-back" size={24} color={textColor} />
            </Pressable>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: '#EC4899' + '20',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 12,
                }}
              >
                <Ionicons name="chatbubble-ellipses" size={24} color="#EC4899" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: textColor, fontSize: 28, fontWeight: 'bold', marginBottom: 4 }}>
                  Send Feedback
                </Text>
                <Text style={{ color: secondaryTextColor, fontSize: 14 }}>
                  Help us improve PartPulse
                </Text>
              </View>
            </View>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: Math.max(insets.left, 24),
            paddingRight: Math.max(insets.right, 24),
            paddingTop: 24,
            paddingBottom: Math.max(insets.bottom, 24) + 100,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Rating Section */}
          <View style={{ marginBottom: 32 }}>
            <Text style={{ color: textColor, fontSize: 16, fontWeight: '600', marginBottom: 16 }}>
              How would you rate your experience?
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable
                  key={star}
                  onPress={() => setRating(star)}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: cardBackground,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 2,
                    borderColor: rating && star <= rating ? '#EC4899' : borderColor,
                  }}
                >
                  <Ionicons
                    name={rating && star <= rating ? 'star' : 'star-outline'}
                    size={28}
                    color={rating && star <= rating ? '#EC4899' : secondaryTextColor}
                  />
                </Pressable>
              ))}
            </View>
          </View>

          {/* Feedback Form */}
          <View
            style={{
              backgroundColor: cardBackground,
              borderRadius: 16,
              padding: 20,
              gap: 20,
            }}
          >
            {/* Feedback Text */}
            <View>
              <Text style={{ color: textColor, fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
                Your Feedback <Text style={{ color: '#EF4444' }}>*</Text>
              </Text>
              <TextInput
                placeholder="Tell us what you think... What can we improve? What do you love?"
                placeholderTextColor={secondaryTextColor}
                value={feedback}
                onChangeText={setFeedback}
                multiline
                numberOfLines={8}
                maxLength={1000}
                style={{
                  backgroundColor: inputBackground,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  fontSize: 16,
                  color: textColor,
                  borderWidth: 1,
                  borderColor: borderColor,
                  minHeight: 160,
                  textAlignVertical: 'top',
                }}
              />
              <Text style={{ color: secondaryTextColor, fontSize: 12, marginTop: 8, textAlign: 'right' }}>
                {feedback.length}/1000
              </Text>
            </View>

            {/* Email (Optional) */}
            <View>
              <Text style={{ color: textColor, fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
                Email (Optional)
              </Text>
              <Text style={{ color: secondaryTextColor, fontSize: 12, marginBottom: 8 }}>
                We may contact you for follow-up questions
              </Text>
              <TextInput
                placeholder="your.email@example.com"
                placeholderTextColor={secondaryTextColor}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={{
                  backgroundColor: inputBackground,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 16,
                  color: textColor,
                  borderWidth: 1,
                  borderColor: borderColor,
                }}
              />
            </View>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor,
            paddingHorizontal: Math.max(insets.left, 24),
            paddingRight: Math.max(insets.right, 24),
            paddingTop: 16,
            paddingBottom: Math.max(insets.bottom, 16),
            borderTopWidth: 1,
            borderTopColor: borderColor,
          }}
        >
          <Pressable onPress={handleSubmit} disabled={!feedback.trim()}>
            {({ pressed }) => (
              <LinearGradient
                colors={['#EC4899', '#F97316']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  borderRadius: 12,
                  paddingVertical: 16,
                  alignItems: 'center',
                  opacity: !feedback.trim() ? 0.5 : pressed ? 0.8 : 1,
                }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
                  Submit Feedback
                </Text>
              </LinearGradient>
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

