/**
 * Authentication utility functions
 */

import * as WebBrowser from 'expo-web-browser';
import { createProfile } from './database';
import { supabase } from './supabase';

// Complete OAuth flow in browser
WebBrowser.maybeCompleteAuthSession();

export interface SignUpData {
  email: string;
  password: string;
  username: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export async function signUp(data: SignUpData) {
  try {
    // Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      throw authError;
    }

    if (!authData.user) {
      throw new Error('Failed to create user');
    }

    // Create profile
    const profile = await createProfile({
      id: authData.user.id,
      username: data.username,
    });

    return { user: authData.user, profile, error: null };
  } catch (error: any) {
    console.error('Sign up error:', error);
    return { user: null, profile: null, error: error.message || 'Failed to sign up' };
  }
}

export async function signIn(data: SignInData) {
  try {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      throw error;
    }

    return { user: authData.user, session: authData.session, error: null };
  } catch (error: any) {
    console.error('Sign in error:', error);
    return { user: null, session: null, error: error.message || 'Failed to sign in' };
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    return { error: null };
  } catch (error: any) {
    console.error('Sign out error:', error);
    return { error: error.message || 'Failed to sign out' };
  }
}

export async function getCurrentUser() {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      throw error;
    }

    return { user, error: null };
  } catch (error: any) {
    console.error('Get current user error:', error);
    return { user: null, error: error.message || 'Failed to get current user' };
  }
}

export async function getCurrentSession() {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      throw error;
    }

    return { session, error: null };
  } catch (error: any) {
    console.error('Get session error:', error);
    return { session: null, error: error.message || 'Failed to get session' };
  }
}

// Listen to auth state changes
export function onAuthStateChange(callback: (user: any) => void) {
  return supabase.auth.onAuthStateChange((_event : any, session : any) => {
    callback(session?.user ?? null);
  });
}

/**
 * Sign in with Google OAuth
 * Based on Supabase official guide: https://supabase.com/docs/guides/auth/quickstarts/with-expo-react-native-social-auth
 */
export async function signInWithGoogle() {
  try {
    // Use the Supabase callback URL - this is what Google will redirect to
    // This MUST match what's configured in:
    // 1. Supabase Dashboard → Authentication → URL Configuration → Redirect URLs
    // 2. Google Cloud Console → OAuth 2.0 Client IDs → Authorized redirect URIs
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    
    if (!supabaseUrl) {
      throw new Error('EXPO_PUBLIC_SUPABASE_URL is not set in environment variables');
    }
    
    const redirectUrl = `${supabaseUrl}/auth/v1/callback`;
    
    console.log('Starting Google OAuth with redirect URL:', redirectUrl);
    
    // Start OAuth flow with Supabase
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl, // Supabase callback URL (not localhost!)
        skipBrowserRedirect: true, // We'll handle the redirect manually with WebBrowser
      },
    });

    if (error) {
      throw error;
    }

    if (!data.url) {
      throw new Error('No OAuth URL returned from Supabase');
    }

    console.log('Opening OAuth URL in browser:', data.url);

    // Set up auth state listener as a backup (in case browser doesn't return)
    let authStateSubscription: { data: { subscription: any } } | null = null;
    let sessionResolved = false;
    
    const sessionPromise = new Promise<{ user: any; session: any } | null>((resolve) => {
      authStateSubscription = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        if (event === 'SIGNED_IN' && session && !sessionResolved) {
          sessionResolved = true;
          if (authStateSubscription) {
            authStateSubscription.data.subscription.unsubscribe();
          }
          // Ensure profile exists
          if (session.user) {
            await ensureProfileForOAuthUser(session.user);
          }
          resolve({ user: session.user, session: session });
        }
      });
    });

    // Open the OAuth URL in in-app browser
    const browserPromise = WebBrowser.openAuthSessionAsync(
      data.url,
      redirectUrl
    ).then((result) => {
      console.log('OAuth browser result:', result.type, result.url);
      WebBrowser.maybeCompleteAuthSession();
      return result;
    });

    // Race: wait for either browser to return OR session to be set OR timeout
    const timeoutId = setTimeout(() => {
      if (!sessionResolved && authStateSubscription) {
        authStateSubscription.data.subscription.unsubscribe();
      }
    }, 60000);

    // Try browser first (with timeout)
    const browserResult = await Promise.race([
      browserPromise,
      new Promise<{ type: 'timeout' }>((resolve) => 
        setTimeout(() => resolve({ type: 'timeout' }), 45000)
      )
    ]);

    clearTimeout(timeoutId);
    if (authStateSubscription && !sessionResolved) {
      authStateSubscription.data.subscription.unsubscribe();
    }

    if (browserResult && 'type' in browserResult && browserResult.type === 'timeout') {
      // Browser timed out, check if session was set via auth state
      console.log('Browser timed out, checking for session...');
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        if (session.user) {
          await ensureProfileForOAuthUser(session.user);
        }
        return { user: session.user, session: session, error: null };
      }
      return { user: null, session: null, error: 'OAuth flow timed out. Please try again.' };
    }

    const result = browserResult as any;

    if (result.type === 'success' && result.url) {
      // The callback URL contains the tokens
      // Parse the URL to extract tokens
      let url: URL;
      try {
        url = new URL(result.url);
      } catch (urlError) {
        console.error('Failed to parse callback URL:', result.url);
        throw new Error('Invalid callback URL received');
      }
      
      console.log('Parsed callback URL - hash:', url.hash, 'search:', url.search);
      
      // Extract tokens from hash fragment (format: #access_token=...&refresh_token=...)
      let accessToken: string | null = null;
      let refreshToken: string | null = null;

      if (url.hash) {
        const hashParams = new URLSearchParams(url.hash.substring(1));
        accessToken = hashParams.get('access_token');
        refreshToken = hashParams.get('refresh_token');
        console.log('Tokens from hash:', { hasAccessToken: !!accessToken, hasRefreshToken: !!refreshToken });
      }

      // If not in hash, try query params
      if (!accessToken || !refreshToken) {
        accessToken = url.searchParams.get('access_token');
        refreshToken = url.searchParams.get('refresh_token');
        console.log('Tokens from query:', { hasAccessToken: !!accessToken, hasRefreshToken: !!refreshToken });
      }

      // If still no tokens, check if Supabase already set the session via deep link
      if (!accessToken || !refreshToken) {
        console.log('No tokens in URL, checking if session was set automatically...');
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log('Session found, ensuring profile...');
          if (session.user) {
            await ensureProfileForOAuthUser(session.user);
          }
          return { user: session.user, session: session, error: null };
        }
      }

      if (accessToken && refreshToken) {
        console.log('Tokens extracted, setting session...');
        
        // Set the session with the tokens
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) {
          console.error('Error setting session:', sessionError);
          throw sessionError;
        }

        // Ensure profile exists for OAuth user
        if (sessionData.user) {
          await ensureProfileForOAuthUser(sessionData.user);
        }

        return { user: sessionData.user, session: sessionData.session, error: null };
      } else {
        console.error('No tokens found in callback URL:', result.url);
        return { user: null, session: null, error: 'No authentication tokens found in callback' };
      }
    }

    if (result.type === 'cancel') {
      return { user: null, session: null, error: 'OAuth flow was cancelled' };
    }

    if (result.type === 'dismiss') {
      return { user: null, session: null, error: 'OAuth flow was dismissed' };
    }

    return { user: null, session: null, error: 'OAuth flow failed - unknown result type' };
  } catch (error: any) {
    console.error('Google sign in error:', error);
    return { user: null, session: null, error: error.message || 'Failed to sign in with Google' };
  }
}

/**
 * Sign in with Apple OAuth
 */
export async function signInWithApple() {
  try {
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    
    if (!supabaseUrl) {
      throw new Error('EXPO_PUBLIC_SUPABASE_URL is not set in environment variables');
    }
    
    const redirectUrl = `${supabaseUrl}/auth/v1/callback`;
    
    console.log('Starting Apple OAuth with redirect URL:', redirectUrl);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true, // We'll handle the redirect manually
      },
    });

    if (error) {
      throw error;
    }

    if (!data.url) {
      throw new Error('No OAuth URL returned');
    }

    console.log('Opening OAuth URL in browser:', data.url);

    // Open the OAuth URL in in-app browser
    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      redirectUrl
    );

    console.log('OAuth browser result:', result.type, result.url);

    // Complete the auth session (important for expo-web-browser)
    WebBrowser.maybeCompleteAuthSession();

    if (result.type === 'success' && result.url) {
      // Parse the callback URL
      let url: URL;
      try {
        url = new URL(result.url);
      } catch (urlError) {
        console.error('Failed to parse callback URL:', result.url);
        throw new Error('Invalid callback URL received');
      }
      
      console.log('Parsed callback URL - hash:', url.hash, 'search:', url.search);
      
      // Extract tokens from hash fragment or query params
      let accessToken: string | null = null;
      let refreshToken: string | null = null;

      if (url.hash) {
        const hashParams = new URLSearchParams(url.hash.substring(1));
        accessToken = hashParams.get('access_token');
        refreshToken = hashParams.get('refresh_token');
        console.log('Tokens from hash:', { hasAccessToken: !!accessToken, hasRefreshToken: !!refreshToken });
      }

      if (!accessToken || !refreshToken) {
        accessToken = url.searchParams.get('access_token');
        refreshToken = url.searchParams.get('refresh_token');
        console.log('Tokens from query:', { hasAccessToken: !!accessToken, hasRefreshToken: !!refreshToken });
      }

      // If still no tokens, check if Supabase already set the session via deep link
      if (!accessToken || !refreshToken) {
        console.log('No tokens in URL, checking if session was set automatically...');
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log('Session found, ensuring profile...');
          if (session.user) {
            await ensureProfileForOAuthUser(session.user);
          }
          return { user: session.user, session: session, error: null };
        }
      }

      if (accessToken && refreshToken) {
        console.log('Tokens extracted, setting session...');
        
        // Set the session
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) {
          console.error('Error setting session:', sessionError);
          throw sessionError;
        }

        // Ensure profile exists for OAuth user
        if (sessionData.user) {
          await ensureProfileForOAuthUser(sessionData.user);
        }

        return { user: sessionData.user, session: sessionData.session, error: null };
      } else {
        console.error('No tokens found in callback URL:', result.url);
        return { user: null, session: null, error: 'No authentication tokens found in callback' };
      }
    }

    if (result.type === 'cancel') {
      return { user: null, session: null, error: 'OAuth flow was cancelled' };
    }

    if (result.type === 'dismiss') {
      return { user: null, session: null, error: 'OAuth flow was dismissed' };
    }

    return { user: null, session: null, error: 'OAuth flow was cancelled or failed' };
  } catch (error: any) {
    console.error('Apple sign in error:', error);
    return { user: null, session: null, error: error.message || 'Failed to sign in with Apple' };
  }
}

/**
 * Ensure profile exists for OAuth users
 * Creates a profile if it doesn't exist, using email or provider data
 */
async function ensureProfileForOAuthUser(user: any) {
  try {
    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (existingProfile) {
      return existingProfile;
    }

    // Generate username from email or use provider name
    let username = user.email?.split('@')[0] || `user_${user.id.slice(0, 8)}`;
    
    // Try to get name from user metadata
    const fullName = user.user_metadata?.full_name || 
                     user.user_metadata?.name ||
                     user.user_metadata?.display_name ||
                     null;

    // Get avatar from metadata
    const avatarUrl = user.user_metadata?.avatar_url || 
                     user.user_metadata?.picture ||
                     null;

    // Create profile using RPC function (bypasses RLS)
    const profile = await createProfile({
      id: user.id,
      username: username,
      full_name: fullName,
      avatar_url: avatarUrl,
    });

    return profile;
  } catch (error: any) {
    console.error('Error ensuring profile for OAuth user:', error);
    return null;
  }
}


