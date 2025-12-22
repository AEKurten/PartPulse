# Chat Review Integration Guide

## Overview
The review system prompts users to leave reviews in two scenarios:
1. **After order delivery** - Automatically prompts when an order status changes to 'delivered'
2. **After 10 messages in a chat** - Prompts when a chat reaches 10 messages

## Usage in Chat Screen

When implementing the real chat functionality, use the `useChatReviewPrompt` hook:

```typescript
import { ReviewModal } from '@/components/review-modal';
import { useChatReviewPrompt } from '@/hooks/use-chat-review';
import { useMessages } from '@/hooks/use-database';
import { supabase } from '@/lib/supabase';

export default function ChatScreen() {
  const { chatId } = useLocalSearchParams();
  const { user } = useAuthStore();
  const { messages } = useMessages(chatId);
  const { shouldShowReview, otherUserId } = useChatReviewPrompt(chatId);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [otherUserName, setOtherUserName] = useState('');

  // Fetch other user's name
  useEffect(() => {
    if (otherUserId) {
      supabase
        .from('profiles')
        .select('username, full_name')
        .eq('id', otherUserId)
        .single()
        .then(({ data }) => {
          if (data) {
            setOtherUserName(data.full_name || data.username || 'User');
          }
        });
    }
  }, [otherUserId]);

  // Show review modal when prompt is triggered
  useEffect(() => {
    if (shouldShowReview && otherUserId && user) {
      setShowReviewModal(true);
    }
  }, [shouldShowReview, otherUserId, user]);

  return (
    <View>
      {/* Your chat UI */}
      
      {/* Review Modal */}
      {chatId && user && otherUserId && (
        <ReviewModal
          visible={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          chatId={chatId}
          reviewerId={user.id}
          revieweeId={otherUserId}
          revieweeName={otherUserName}
          onReviewSubmitted={() => {
            setShowReviewModal(false);
          }}
        />
      )}
    </View>
  );
}
```

## Database Migration

Before using chat reviews, run the migration:
```sql
-- Run database/migration_add_chat_reviews.sql in Supabase SQL Editor
```

This migration:
- Makes `order_id` nullable in reviews table
- Adds `chat_id` column to reviews table
- Creates unique constraints for order-based and chat-based reviews

