# Database Library

This directory contains all database-related utilities for PartPulse.

## Files

- **`supabase.ts`**: Supabase client configuration
- **`database.types.ts`**: TypeScript types matching the database schema
- **`database.ts`**: Database utility functions for CRUD operations
- **`auth.ts`**: Authentication helper functions

## Quick Start

### 1. Set up environment variables

Create a `.env` file in the project root:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Use in your components

```typescript
import { useProducts, useCurrentUser } from '@/hooks/use-database';
import { signIn, signUp } from '@/lib/auth';
import { createProduct, addToWishlist } from '@/lib/database';

// In your component
function MyComponent() {
  const { products, loading } = useProducts({ category: 'GPU' });
  const { user } = useCurrentUser();
  
  // ... use the data
}
```

## Available Functions

### Authentication (`lib/auth.ts`)

- `signUp(data)` - Create a new user account
- `signIn(data)` - Sign in existing user
- `signOut()` - Sign out current user
- `getCurrentUser()` - Get current authenticated user
- `getCurrentSession()` - Get current session
- `onAuthStateChange(callback)` - Listen to auth state changes

### Products (`lib/database.ts`)

- `getProducts(filters?)` - Get products with optional filters
- `getProduct(id)` - Get a single product
- `createProduct(product)` - Create a new product
- `updateProduct(id, updates)` - Update a product
- `deleteProduct(id)` - Delete a product

### Orders (`lib/database.ts`)

- `getOrders(userId, role)` - Get orders for a user (buyer or seller)
- `getOrder(id)` - Get a single order
- `createOrder(order)` - Create a new order
- `updateOrder(id, updates)` - Update an order

### Wishlist (`lib/database.ts`)

- `getWishlist(userId)` - Get user's wishlist
- `addToWishlist(userId, productId)` - Add product to wishlist
- `removeFromWishlist(userId, productId)` - Remove product from wishlist
- `isInWishlist(userId, productId)` - Check if product is in wishlist

### Chats & Messages (`lib/database.ts`)

- `getChats(userId)` - Get user's chats
- `getChat(id)` - Get a single chat
- `createChat(chat)` - Create a new chat
- `getMessages(chatId)` - Get messages in a chat
- `sendMessage(message)` - Send a message
- `markMessagesAsRead(chatId, userId)` - Mark messages as read

### Profiles (`lib/database.ts`)

- `getProfile(userId)` - Get user profile
- `createProfile(profile)` - Create a profile
- `updateProfile(userId, updates)` - Update a profile

## React Hooks (`hooks/use-database.ts`)

For easier use in React components:

- `useProducts(filters?)` - Hook for fetching products
- `useProduct(id)` - Hook for fetching a single product
- `useOrders(userId, role)` - Hook for fetching orders
- `useWishlist(userId)` - Hook for fetching wishlist
- `useChats(userId)` - Hook for fetching chats
- `useMessages(chatId)` - Hook for fetching messages with real-time updates
- `useCurrentUser()` - Hook for current authenticated user

## Example Usage

### Sign Up Flow

```typescript
import { signUp } from '@/lib/auth';

const handleSignUp = async () => {
  const { user, profile, error } = await signUp({
    email: 'user@example.com',
    password: 'password123',
    username: 'johndoe',
    full_name: 'John Doe'
  });
  
  if (error) {
    console.error('Sign up failed:', error);
    return;
  }
  
  console.log('User created:', user);
  console.log('Profile created:', profile);
};
```

### Product Listing

```typescript
import { useProducts } from '@/hooks/use-database';

function ProductsScreen() {
  const { products, loading, error } = useProducts({ 
    category: 'GPU',
    status: 'active'
  });
  
  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error}</Text>;
  
  return (
    <FlatList
      data={products}
      renderItem={({ item }) => <ProductCard product={item} />}
    />
  );
}
```

### Real-time Chat

```typescript
import { useMessages, sendMessage } from '@/hooks/use-database';
import { sendMessage as sendMessageFn } from '@/lib/database';

function ChatScreen({ chatId, userId }: { chatId: string; userId: string }) {
  const { messages, loading } = useMessages(chatId);
  
  const handleSend = async (content: string) => {
    await sendMessageFn({
      chat_id: chatId,
      sender_id: userId,
      content
    });
  };
  
  return (
    <FlatList
      data={messages}
      renderItem={({ item }) => <MessageBubble message={item} />}
    />
  );
}
```

## Type Safety

All database operations are fully typed. Import types from `database.types.ts`:

```typescript
import type { Product, Order, Profile } from '@/lib/database.types';

function ProductCard({ product }: { product: Product }) {
  // product is fully typed
  return <Text>{product.name}</Text>;
}
```

