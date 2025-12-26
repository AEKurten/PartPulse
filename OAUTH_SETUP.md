# OAuth Setup Guide for Google and Apple

This guide will help you configure Google and Apple OAuth authentication in your Supabase project.

## Prerequisites

1. A Supabase project (already set up)
2. Google Cloud Console account (for Google OAuth)
3. Apple Developer account (for Apple OAuth - iOS only)

## Step 1: Configure OAuth in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Enable the providers you want to use (Google and/or Apple)

## Step 2: Google OAuth Setup

### 2.1 Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Configure the OAuth consent screen if prompted:
   - Choose **External** user type
   - Fill in app name, support email, and developer contact
   - Add scopes: `email`, `profile`, `openid`
6. Create OAuth client:
   - Application type: **Web application**
   - Name: PartPulse
   - Authorized redirect URIs: 
     ```
     https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback
     ```
     Replace `YOUR_SUPABASE_PROJECT_REF` with your actual Supabase project reference
     - Example: `https://dlgyupavoehwcpyxbyyx.supabase.co/auth/v1/callback`
7. Copy the **Client ID** and **Client Secret**

### 2.2 Add Google Credentials to Supabase

1. In Supabase Dashboard → **Authentication** → **Providers** → **Google**
2. Enable Google provider
3. Paste your **Client ID** and **Client Secret**
4. Click **Save**

### 2.3 Configure Redirect URLs in Supabase

**CRITICAL**: This step is essential for mobile apps! Without this, OAuth will try to use localhost which doesn't work on physical devices.

1. In Supabase Dashboard → **Authentication** → **URL Configuration**
2. Configure the following:
   - **Site URL**: 
     - For mobile apps, this is just a placeholder and **not actually used**
     - You can use any valid URL format - it doesn't need to be a real domain
     - Examples: 
       - `https://partpulse.app` (placeholder - doesn't need to exist)
       - `https://app.partpulse.com` (placeholder - doesn't need to exist)
       - `https://localhost` (also works as placeholder)
     - **Important**: This field is required but won't affect mobile OAuth flows
   
   - **Redirect URLs**: **MUST** include your Supabase callback URL:
     ```
     https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback
     ```
     Replace `YOUR_SUPABASE_PROJECT_REF` with your actual Supabase project reference
     - Example: `https://dlgyupavoehwcpyxbyyx.supabase.co/auth/v1/callback`
     - **This exact URL must be added to the Redirect URLs list**
     - Click the **+ Add URL** button and paste the callback URL
3. **DO NOT** add localhost URLs here - they won't work on physical devices
4. **DO NOT** add your app's deep link scheme (like `partpulse://`) - use the Supabase callback URL
5. Click **Save**

**Note**: The Site URL is only used for web apps. For mobile apps, only the Redirect URLs matter for OAuth flows.

**Why this matters**: 
- If the redirect URL isn't in the allowlist, Supabase may default to localhost
- The redirect URL in your code must exactly match what's configured here
- This URL is what Google will redirect to after authentication

**Note**: The redirect URL must match exactly what's in your Google Cloud Console OAuth client configuration.

## Step 3: Apple OAuth Setup (iOS only)

### 3.1 Create Apple Service ID

1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Go to **Identifiers** → Click **+** to create new
4. Select **Services IDs** → Continue
5. Register a new Services ID:
   - Description: PartPulse
   - Identifier: `com.yourcompany.partpulse` (use reverse domain notation)
6. Enable **Sign in with Apple**
7. Configure Sign in with Apple:
   - Primary App ID: Select your app's bundle ID
   - Website URLs:
     - Domains: `YOUR_SUPABASE_PROJECT_REF.supabase.co`
     - Return URLs: `https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback`
8. Save and continue

### 3.2 Create Apple Key

1. Go to **Keys** → Click **+** to create new
2. Name: PartPulse Sign In Key
3. Enable **Sign in with Apple**
4. Configure: Select your Primary App ID
5. Register and download the key file (`.p8`)
6. Note the **Key ID**

### 3.3 Add Apple Credentials to Supabase

1. In Supabase Dashboard → **Authentication** → **Providers** → **Apple**
2. Enable Apple provider
3. Fill in:
   - **Services ID**: The identifier you created (e.g., `com.yourcompany.partpulse`)
   - **Secret Key**: The contents of the `.p8` file you downloaded
   - **Key ID**: The Key ID from Apple Developer Portal
   - **Team ID**: Your Apple Team ID (found in Apple Developer Portal → Membership)
4. Click **Save**

## Step 4: Update Redirect URLs

Make sure your Supabase project has the correct redirect URLs configured:

1. In Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add your app's redirect URL:
   - For development: `exp://localhost:8081` or your Expo dev client URL
   - For production: Your app's deep link scheme (e.g., `partpulse://`)

## Step 5: Test OAuth Flow

1. Run your app: `npm start` or `expo start`
2. Try signing in with Google or Apple
3. The OAuth flow should open in a browser
4. After authentication, you should be redirected back to the app

## Troubleshooting

### OAuth flow opens but doesn't redirect back

- Check that your redirect URLs are correctly configured in Supabase
- Make sure your app's deep linking is set up correctly
- For Expo: Check `app.json` for proper deep link configuration

### "Invalid redirect URI" error

- Verify the redirect URI in Supabase matches exactly with what's configured in Google/Apple
- Check for trailing slashes or protocol mismatches

### Profile not created after OAuth sign in

- The `ensureProfileForOAuthUser` function should automatically create a profile
- Check Supabase logs for any errors
- Verify the `create_user_profile` RPC function is set up (run the migration)

## Notes

- **Google OAuth**: Works on both iOS and Android
- **Apple OAuth**: Only works on iOS devices (Apple requirement)
- OAuth users will have a profile automatically created with:
  - Username: Generated from email or user ID
  - Full name: From OAuth provider (if available)
  - Avatar: From OAuth provider (if available)

## Additional Resources

- [Supabase OAuth Documentation](https://supabase.com/docs/guides/auth/social-login)
- [Google OAuth Setup](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Apple OAuth Setup](https://supabase.com/docs/guides/auth/social-login/auth-apple)

