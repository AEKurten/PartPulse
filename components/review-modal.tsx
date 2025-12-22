import { useThemeColors } from '@/hooks/use-theme-colors';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ReviewModalProps = {
  visible: boolean;
  onClose: () => void;
  orderId?: string;
  chatId?: string;
  reviewerId: string;
  revieweeId: string;
  revieweeName?: string;
  onReviewSubmitted?: () => void;
};

export function ReviewModal({
  visible,
  onClose,
  orderId,
  chatId,
  reviewerId,
  revieweeId,
  revieweeName,
  onReviewSubmitted,
}: ReviewModalProps) {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) {
      // Reset form when modal closes
      setRating(0);
      setComment('');
    }
  }, [visible]);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a rating');
      return;
    }

    if (!orderId && !chatId) {
      Alert.alert('Error', 'Review must be associated with an order or chat');
      return;
    }

    try {
      setSubmitting(true);

      const reviewData: any = {
        reviewer_id: reviewerId,
        reviewee_id: revieweeId,
        rating,
        comment: comment.trim() || null,
      };

      if (orderId) {
        reviewData.order_id = orderId;
      }

      if (chatId) {
        reviewData.chat_id = chatId;
      }

      const { error } = await supabase.from('reviews').insert(reviewData);

      if (error) {
        if (error.code === '23505') {
          Alert.alert('Already Reviewed', 'You have already submitted a review for this order/chat');
        } else {
          throw error;
        }
      } else {
        Alert.alert('Thank You!', 'Your review has been submitted successfully');
        onReviewSubmitted?.();
        onClose();
      }
    } catch (error: any) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', `Failed to submit review: ${error.message || 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        }}
      >
        <View
          style={{
            backgroundColor: colors.cardBackground,
            borderRadius: 24,
            width: '100%',
            maxWidth: 500,
            maxHeight: '80%',
            padding: 24,
          }}
        >
          {/* Header */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ color: colors.textColor, fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>
              Leave a Review
            </Text>
            {revieweeName && (
              <Text style={{ color: colors.secondaryTextColor, fontSize: 16 }}>
                Rate your experience with {revieweeName}
              </Text>
            )}
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Rating Selection */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ color: colors.textColor, fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
                Rating *
              </Text>
              <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Pressable
                    key={star}
                    onPress={() => setRating(star)}
                    style={{ padding: 4 }}
                  >
                    <Ionicons
                      name={star <= rating ? 'star' : 'star-outline'}
                      size={40}
                      color={star <= rating ? '#F59E0B' : colors.secondaryTextColor}
                    />
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Comment Input */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ color: colors.textColor, fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
                Comment (Optional)
              </Text>
              <TextInput
                placeholder="Share your experience..."
                placeholderTextColor={colors.secondaryTextColor}
                value={comment}
                onChangeText={setComment}
                multiline
                numberOfLines={4}
                maxLength={500}
                style={{
                  backgroundColor: colors.iconBackground,
                  borderRadius: 12,
                  padding: 16,
                  fontSize: 16,
                  color: colors.textColor,
                  minHeight: 100,
                  textAlignVertical: 'top',
                  borderWidth: 1,
                  borderColor: colors.borderColor,
                }}
              />
              <Text style={{ color: colors.secondaryTextColor, fontSize: 12, marginTop: 4, textAlign: 'right' }}>
                {comment.length}/500
              </Text>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
            <Pressable
              onPress={onClose}
              disabled={submitting}
              style={{
                flex: 1,
                backgroundColor: colors.iconBackground,
                borderRadius: 12,
                paddingVertical: 14,
                alignItems: 'center',
                opacity: submitting ? 0.5 : 1,
              }}
            >
              <Text style={{ color: colors.textColor, fontSize: 16, fontWeight: '600' }}>
                Cancel
              </Text>
            </Pressable>
            <Pressable
              onPress={handleSubmit}
              disabled={submitting || rating === 0}
              style={{ flex: 1 }}
            >
              {({ pressed }) => (
                <LinearGradient
                  colors={['#EC4899', '#F97316']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    borderRadius: 12,
                    paddingVertical: 14,
                    alignItems: 'center',
                    opacity: submitting || rating === 0 ? 0.5 : pressed ? 0.8 : 1,
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </Text>
                </LinearGradient>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

