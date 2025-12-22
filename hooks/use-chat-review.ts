import { useEffect, useState } from 'react';
import { getChatMessageCount, getChatOtherUserId, reviewExistsForChat } from '@/lib/reviews';
import { useAuthStore } from '@/app/stores/useAuthStore';

/**
 * Hook to check if a review should be prompted for a chat
 * Prompts after 10 messages if no review exists
 */
export function useChatReviewPrompt(chatId: string | null) {
  const { user } = useAuthStore();
  const [shouldShowReview, setShouldShowReview] = useState(false);
  const [otherUserId, setOtherUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkReviewPrompt = async () => {
      if (!chatId || !user?.id) {
        setShouldShowReview(false);
        return;
      }

      try {
        // Get message count
        const messageCount = await getChatMessageCount(chatId);
        
        // Get other user ID
        const otherId = await getChatOtherUserId(chatId, user.id);
        setOtherUserId(otherId);

        // Check if review already exists
        if (otherId) {
          const reviewExists = await reviewExistsForChat(chatId, user.id);
          
          // Show review prompt if 10+ messages and no review exists
          if (messageCount >= 10 && !reviewExists) {
            setShouldShowReview(true);
          } else {
            setShouldShowReview(false);
          }
        }
      } catch (error) {
        console.error('Error checking chat review prompt:', error);
        setShouldShowReview(false);
      }
    };

    checkReviewPrompt();
  }, [chatId, user?.id]);

  return { shouldShowReview, otherUserId };
}

