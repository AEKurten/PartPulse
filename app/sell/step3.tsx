import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Mock AI analysis data
const aiAnalysis = {
  grade: 'A+',
  score: 92,
  recommendedPrice: '$1,549',
  condition: 'Excellent',
  details: [
    { label: 'Physical Condition', value: 'Like New', score: 95 },
    { label: 'Performance', value: 'Optimal', score: 90 },
    { label: 'Cosmetic State', value: 'Minimal Wear', score: 88 },
    { label: 'Functionality', value: 'Fully Operational', score: 94 },
  ],
  notes: [
    'Item shows minimal signs of use',
    'All components functioning properly',
    'Original packaging included',
    'No visible damage detected',
  ],
};

export default function SellStep3Screen() {
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);

  const handleAccept = () => {
    // Accept AI recommendations and continue
    router.push('/sell/step4');
  };

  const handleDecline = () => {
    Alert.alert(
      'AI Review Recommended',
      'Items with AI certification sell 3x faster and get better prices. Are you sure you want to continue without AI review?',
      [
        {
          text: 'Go Back',
          style: 'cancel',
        },
        {
          text: 'Continue Without AI',
          style: 'destructive',
          onPress: () => router.push('/sell/step4'),
        },
      ]
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#10B981'; // Green
    if (score >= 75) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  const getGradeColor = (grade: string) => {
    if (grade === 'A+') return '#10B981';
    if (grade === 'A') return '#3B82F6';
    if (grade === 'B') return '#F59E0B';
    return '#EF4444';
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#0F0E11' }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
    >
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 140 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View
            style={{
              paddingTop: insets.top + 24,
              paddingBottom: 32,
              paddingLeft: Math.max(insets.left, 24),
              paddingRight: Math.max(insets.right, 24),
            }}
          >
            {/* Header */}
            <View style={{ marginBottom: 32 }}>
              <Pressable
                onPress={() => router.back()}
                style={{ marginBottom: 24, alignSelf: 'flex-start' }}
              >
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              </Pressable>
              <Text className="text-3xl font-bold text-white mb-2">
                AI Analysis Complete
              </Text>
              <Text className="text-base text-neutral-400">
                Review the AI's assessment of your item
              </Text>
            </View>

            {/* AI Grade Card */}
            <View
              style={{
                backgroundColor: '#2B2E36',
                borderRadius: 16,
                padding: 24,
                marginBottom: 24,
              }}
            >
              {/* Score Badge */}
              <View style={{ alignItems: 'center', marginBottom: 24 }}>
                <View
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 60,
                    backgroundColor: '#1F2937',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 4,
                    borderColor: getScoreColor(aiAnalysis.score),
                  }}
                >
                  <Text
                    style={{
                      fontSize: 48,
                      fontWeight: 'bold',
                      color: getScoreColor(aiAnalysis.score),
                    }}
                  >
                    {aiAnalysis.score}
                  </Text>
                  <Text className="text-neutral-400 text-xs mt-1">Score</Text>
                </View>
                <View
                  style={{
                    marginTop: 16,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: getGradeColor(aiAnalysis.grade) + '20',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: 'bold',
                      color: getGradeColor(aiAnalysis.grade),
                    }}
                  >
                    Grade {aiAnalysis.grade}
                  </Text>
                </View>
              </View>

              {/* Recommended Price */}
              <View
                style={{
                  backgroundColor: '#1F2937',
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 24,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <View>
                  <Text className="text-neutral-400 text-sm mb-1">
                    AI Recommended Price
                  </Text>
                  <Text className="text-white text-2xl font-bold">
                    {aiAnalysis.recommendedPrice}
                  </Text>
                </View>
                <Ionicons name="sparkles" size={32} color="#EC4899" />
              </View>

              {/* Condition Assessment */}
              <View style={{ marginBottom: 24 }}>
                <Text className="text-white text-lg font-semibold mb-3">
                  Condition Assessment
                </Text>
                {aiAnalysis.details.map((detail, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingVertical: 12,
                      borderBottomWidth: index < aiAnalysis.details.length - 1 ? 1 : 0,
                      borderBottomColor: '#1F2937',
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text className="text-neutral-400 text-sm">
                        {detail.label}
                      </Text>
                      <Text className="text-white text-base font-medium mt-1">
                        {detail.value}
                      </Text>
                    </View>
                    <View
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 4,
                        borderRadius: 12,
                        backgroundColor: getScoreColor(detail.score) + '20',
                      }}
                    >
                      <Text
                        style={{
                          color: getScoreColor(detail.score),
                          fontWeight: '600',
                          fontSize: 14,
                        }}
                      >
                        {detail.score}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Notes */}
              <View style={{ marginBottom: 16 }}>
                <Text className="text-white text-lg font-semibold mb-3">
                  AI Notes
                </Text>
                {aiAnalysis.notes.map((note, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      marginBottom: 8,
                    }}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#10B981"
                      style={{ marginRight: 8, marginTop: 2 }}
                    />
                    <Text className="text-neutral-300 text-sm flex-1">
                      {note}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Disclaimer */}
              <View
                style={{
                  backgroundColor: '#1F2937',
                  borderRadius: 12,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                }}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color="#9CA3AF"
                  style={{ marginRight: 12, marginTop: 2 }}
                />
                <Text className="text-neutral-400 text-xs leading-5 flex-1">
                  <Text className="font-semibold">Note:</Text> AI analysis is based on
                  image recognition and may not catch all details. Please verify the
                  assessment matches your item's actual condition.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons - Fixed to Bottom */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            paddingLeft: Math.max(insets.left, 24),
            paddingRight: Math.max(insets.right, 24),
            paddingBottom: insets.bottom + 16,
            paddingTop: 16,
            backgroundColor: '#0F0E11',
            gap: 12,
          }}
        >
          {/* Accept AI Recommendations */}
          <Pressable onPress={handleAccept} style={{ width: '100%' }}>
            {({ pressed }) => (
              <LinearGradient
                colors={['#EC4899', '#F97316']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  borderRadius: 16,
                  height: 56,
                  width: '100%',
                  opacity: pressed ? 0.8 : 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text className="text-white text-lg font-bold">
                  Accept AI Recommendations
                </Text>
              </LinearGradient>
            )}
          </Pressable>

          {/* Continue Without AI */}
          <Pressable onPress={handleDecline} style={{ width: '100%' }}>
            {({ pressed }) => (
              <View
                style={{
                  borderRadius: 16,
                  height: 56,
                  width: '100%',
                  backgroundColor: '#2B2E36',
                  opacity: pressed ? 0.8 : 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: '#3B3E46',
                }}
              >
                <Text className="text-white text-lg font-semibold">
                  Continue Without AI
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
