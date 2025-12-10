# PartPulse Database Setup Guide

This guide will help you set up the Supabase database for your PartPulse marketplace app.

## Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. Node.js and npm installed
3. Your PartPulse project set up

## Step 1: Create a Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in your project details:
   - **Name**: PartPulse (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest region to your users
4. Click "Create new project"
5. Wait for the project to be created (takes 1-2 minutes)

## Step 2: Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. You'll find:
   - **Project URL**: Copy this value
   - **anon/public key**: Copy this value
3. Keep these values handy for the next step

## Step 3: Set Up Environment Variables

1. Create a `.env` file in your project root (if it doesn't exist)
2. Add your Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=your_project_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**Example:**
```env
EXPO_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.abcdefghijklmnopqrstuvwxyz1234567890
```

## Step 4: Create the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the entire contents of `database/schema.sql`
4. Paste it into the SQL Editor
5. Click "Run" (or press Ctrl/Cmd + Enter)
6. You should see "Success. No rows returned"

This will create all the necessary tables, indexes, and security policies for your marketplace.

## Step 5: Install Dependencies

Run the following command in your project root:

```bash
npm install
```

This will install the `@supabase/supabase-js` package that was added to your `package.json`.

## Step 6: Verify the Setup

1. In Supabase dashboard, go to **Table Editor**
2. You should see the following tables:
   - `profiles`
   - `products`
   - `orders`
   - `wishlist`
   - `chats`
   - `messages`
   - `reviews`

## Step 7: Test the Connection

You can test the database connection by using the utility functions in your app:

```typescript
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

// Test connection
const { user, error } = await getCurrentUser();
console.log('Current user:', user);
```

## Database Schema Overview

### Tables

- **profiles**: User profiles (extends Supabase auth)
- **products**: Marketplace products/items for sale
- **orders**: Purchase orders
- **wishlist**: User wishlist items
- **chats**: Chat conversations between buyers and sellers
- **messages**: Individual chat messages
- **reviews**: Product/seller reviews

### Security

All tables have Row Level Security (RLS) enabled, which means:
- Users can only see/modify their own data
- Products are visible to everyone when active
- Orders are only visible to the buyer and seller
- Chats are only accessible by participants

## Using the Database in Your App

### Authentication

```typescript
import { signUp, signIn, signOut } from '@/lib/auth';

// Sign up
const { user, profile, error } = await signUp({
  email: 'user@example.com',
  password: 'password123',
  username: 'johndoe',
  full_name: 'John Doe'
});

// Sign in
const { user, session, error } = await signIn({
  email: 'user@example.com',
  password: 'password123'
});
```

### Products

```typescript
import { getProducts, createProduct } from '@/lib/database';

// Get all active products
const products = await getProducts();

// Get products by category
const gpus = await getProducts({ category: 'GPU' });

// Create a product
const product = await createProduct({
  seller_id: userId,
  name: 'RTX 4090',
  price: 1599.99,
  condition: 'A+',
  category: 'GPU',
  images: ['https://example.com/image.jpg']
});
```

### Orders

```typescript
import { createOrder, getOrders } from '@/lib/database';

// Create an order
const order = await createOrder({
  buyer_id: userId,
  seller_id: sellerId,
  product_id: productId,
  total_amount: 1599.99,
  shipping_address: {
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    zip: '10001'
  }
});

// Get user's orders
const myOrders = await getOrders(userId, 'buyer');
```

## Next Steps

1. Set up authentication screens to use the `signUp` and `signIn` functions
2. Replace mock data in your components with real database queries
3. Implement real-time features using Supabase subscriptions
4. Add image upload functionality for product images

## Troubleshooting

### "Missing Supabase environment variables" warning

- Make sure your `.env` file exists in the project root
- Verify the variable names are exactly: `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Restart your Expo development server after adding environment variables

### "relation does not exist" error

- Make sure you ran the SQL schema in Step 4
- Check that all tables were created in the Table Editor

### Authentication not working

- Verify your Supabase project is active
- Check that email authentication is enabled in Supabase Dashboard → Authentication → Providers
- Make sure you're using the correct credentials

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase React Native Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)

