/**
 * Authentication utility functions
 */

import { supabase } from './supabase';
import { createProfile } from './database';

export interface SignUpData {
  email: string;
  password: string;
  username: string;
  full_name?: string;
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
      full_name: data.full_name || null,
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
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
}

