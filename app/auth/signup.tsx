import { signUp, signInWithGoogle, signInWithApple } from '@/lib/auth';
import { getFontSize, getPadding, TextSizes, PaddingSizes } from '@/constants/platform-styles';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState<'google' | 'apple' | null>(null);

  const navigation = useRouter();

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.toLowerCase());
  };


  const handleEmailChange = (text: string) => {
    setEmail(text);

    if (!text) {
      setEmailError('');
    } else if (!isValidEmail(text)) {
      setEmailError('Enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handleSignUp = async () => {
    if (isLoading) return;
    setIsLoading(true);

    if (!username.trim()) {
      Alert.alert('Username required');
      return;
    }

    if (!email || emailError) {
      Alert.alert('Enter a valid email');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Password must be at least 6 characters');
      return;
    }

    try {
      const { error } = await signUp({
        email,
        password,
        username,
      });

      if (error) {
        Alert.alert('Sign up failed', error.message);
        return;
      }

      Alert.alert(
        'Check your email',
        'We sent you a confirmation link. Please verify your email before logging in.'
      );

      navigation.replace('/auth/login');
    } catch (error) {
      console.error('Sign up failed:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
    finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#0F0E11' }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View
          className="flex-1"
          style={{
            paddingTop: insets.top + getPadding(40),
            paddingBottom: insets.bottom + getPadding(32),
            paddingLeft: Math.max(insets.left, PaddingSizes.lg),
            paddingRight: Math.max(insets.right, PaddingSizes.lg),
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
          }}
        >
          {/* App Name */}
          <Text 
            className="font-bold text-white text-center mb-2"
            style={{ fontSize: TextSizes['4xl'] }}
          >
            PartPulse
          </Text>
          <Text 
            className="text-neutral-400 text-center mb-8"
            style={{ fontSize: TextSizes.lg }}
          >
            Let's create your account
          </Text>

          {/* Username Input */}
          <View style={{ marginBottom: PaddingSizes.md, width: '100%' }}>
            <TextInput
              placeholder="Username"
              placeholderTextColor="#9CA3AF"
              value={username}
              onChangeText={setUsername}
              onFocus={() => setUsernameFocused(true)}
              onBlur={() => setUsernameFocused(false)}
              autoCapitalize="none"
              autoComplete="username"
              style={{
                backgroundColor: '#2B2E36',
                borderRadius: 12,
                paddingHorizontal: PaddingSizes.md,
                paddingVertical: PaddingSizes.md,
                fontSize: TextSizes.base,
                color: '#FFFFFF',
                borderWidth: usernameFocused ? 2 : 0,
                borderColor: usernameFocused ? '#EC4899' : 'transparent',
              }}
            />
          </View>

          {/* Email Input */}
          <View style={{ marginBottom: PaddingSizes.md, width: '100%' }}>
            <TextInput
              placeholder="Email"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={handleEmailChange}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              style={{
                backgroundColor: '#2B2E36',
                borderRadius: 12,
                paddingHorizontal: PaddingSizes.md,
                paddingVertical: PaddingSizes.md,
                fontSize: TextSizes.base,
                color: '#FFFFFF',
                borderWidth: emailFocused ? 2 : 0,
                borderColor: emailFocused ? '#EC4899' : 'transparent',
              }}
            />
            {emailError ? (
              <Text 
                className='mt-2 text-red-400'
                style={{ fontSize: TextSizes.sm }}
              >
                {emailError}
              </Text>
            ) : null}
          </View>

          {/* Password Input */}
          <View style={{ marginBottom: PaddingSizes.lg, width: '100%' }}>
            <View style={{ position: 'relative' }}>
              <TextInput
                placeholder="Password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password-new"
                style={{
                  backgroundColor: '#2B2E36',
                  borderRadius: 12,
                  paddingHorizontal: PaddingSizes.md,
                  paddingVertical: PaddingSizes.md,
                  fontSize: TextSizes.base,
                  color: '#FFFFFF',
                  paddingRight: 50,
                  borderWidth: passwordFocused ? 2 : 0,
                  borderColor: passwordFocused ? '#EC4899' : 'transparent',
                }}
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: PaddingSizes.md,
                  top: PaddingSizes.md,
                  padding: PaddingSizes.xs,
                }}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#9CA3AF"
                />
              </Pressable>
            </View>
          </View>

          {/* Sign Up Button */}
          <Pressable style={{ width: '100%', marginBottom: 24 }} onPress={handleSignUp}>
            {({ pressed }) => (
              <LinearGradient
                colors={["#EC4899", "#F97316"]}
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
                {!isLoading ? (
                  <Text 
                    className="text-white font-bold"
                    style={{ fontSize: TextSizes.lg }}
                  >
                    Create Account
                  </Text>
                ) : (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                )}
              </LinearGradient>
            )}
          </Pressable>

          {/* Divider */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: PaddingSizes.lg }}>
            <View style={{ flex: 1, height: 1, backgroundColor: '#2B2E36' }} />
            <Text 
              className="text-white/50 mx-4"
              style={{ fontSize: TextSizes.sm }}
            >
              or
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: '#2B2E36' }} />
          </View>

          {/* Google Sign Up */}
          <Pressable 
            style={{ marginBottom: PaddingSizes.base, width: '100%' }}
            onPress={async () => {
              if (isOAuthLoading) return;
              setIsOAuthLoading('google');
              try {
                const { user, error } = await signInWithGoogle();
                if (error) {
                  Alert.alert('Sign up failed', error);
                } else if (user) {
                  navigation.replace('/(tabs)');
                }
              } catch (error: any) {
                Alert.alert('Error', error.message || 'Failed to sign up with Google');
              } finally {
                setIsOAuthLoading(null);
              }
            }}
            disabled={isOAuthLoading !== null}
          >
            {({ pressed }) => (
              <View
                style={{
                  backgroundColor: '#2B2E36',
                  borderRadius: 12,
                  height: 56,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: pressed ? 2 : 0,
                  borderColor: pressed ? '#EC4899' : 'transparent',
                  opacity: (pressed || isOAuthLoading !== null) ? 0.8 : 1,
                }}
              >
                {isOAuthLoading === 'google' ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="logo-google" size={20} color="#FFFFFF" style={{ marginRight: PaddingSizes.base }} />
                    <Text 
                      className="text-white font-semibold"
                      style={{ fontSize: TextSizes.lg }}
                    >
                      Sign up with Google
                    </Text>
                  </>
                )}
              </View>
            )}
          </Pressable>

          {/* Apple Sign Up */}
          <Pressable 
            style={{ marginBottom: PaddingSizes.lg, width: '100%' }}
            onPress={async () => {
              if (isOAuthLoading) return;
              setIsOAuthLoading('apple');
              try {
                const { user, error } = await signInWithApple();
                if (error) {
                  Alert.alert('Sign up failed', error);
                } else if (user) {
                  navigation.replace('/(tabs)');
                }
              } catch (error: any) {
                Alert.alert('Error', error.message || 'Failed to sign up with Apple');
              } finally {
                setIsOAuthLoading(null);
              }
            }}
            disabled={isOAuthLoading !== null}
          >
            {({ pressed }) => (
              <View
                style={{
                  backgroundColor: '#2B2E36',
                  borderRadius: 12,
                  height: 56,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: pressed ? 2 : 0,
                  borderColor: pressed ? '#EC4899' : 'transparent',
                  opacity: (pressed || isOAuthLoading !== null) ? 0.8 : 1,
                }}
              >
                {isOAuthLoading === 'apple' ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="logo-apple" size={20} color="#FFFFFF" style={{ marginRight: PaddingSizes.base }} />
                    <Text 
                      className="text-white font-semibold"
                      style={{ fontSize: TextSizes.lg }}
                    >
                      Sign up with Apple
                    </Text>
                  </>
                )}
              </View>
            )}
          </Pressable>

          {/* Login Link */}
          <View style={{ justifyContent: 'center' }}>
            <Text className="text-white/70">Already have an account?</Text>
            <Link href="/auth/login">
              <Text className="text-[#EC4899] font-semibold text-center">Log In</Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
