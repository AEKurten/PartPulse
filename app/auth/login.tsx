import { signIn, signInWithGoogle, signInWithApple } from '@/lib/auth';
import { getFontSize, getPadding, TextSizes, PaddingSizes } from '@/constants/platform-styles';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState<'google' | 'apple' | null>(null);
  const navigation = useRouter();

  const handleSignIn = async () => {
    try {
      const { error } = await signIn({ email, password });

      if (error) {
        Alert.alert('Login Failed', error);
        return;
      }

      navigation.replace('/(tabs)');
    }
    catch (error) {
      console.error('Login failed:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
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
        <View className="flex-1"
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
          }}>
          <View
            style={{ width: '100%' }}
            className=" flex-1 justify-center"
          >
            {/* App Name */}
            <Text 
              className="font-bold text-white text-center mb-2"
              style={{ fontSize: TextSizes['4xl'] }}
            >
              PartPulse
            </Text>
            <Text 
              className="text-white/70 text-center mb-8"
              style={{ fontSize: TextSizes.lg }}
            >
              Welcome back
            </Text>

            {/* Email Input */}
            <View style={{ marginBottom: PaddingSizes.md, width: '100%' }}>
              <TextInput
                placeholder="Email"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
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
                  autoComplete="password"
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

            {/* Login Button */}
            <Pressable style={{ width: '100%' }} onPress={handleSignIn}>
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
                  <Text 
                    className="text-white font-bold"
                    style={{ fontSize: TextSizes.lg }}
                  >
                    Login
                  </Text>
                </LinearGradient>
              )}
            </Pressable>

          </View>


          {/* Divider */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: PaddingSizes.lg, flex: 1 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: '#2B2E36' }} />
            <Text 
              className="text-white/50 mx-4"
              style={{ fontSize: TextSizes.sm }}
            >
              or
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: '#2B2E36' }} />
          </View>

          <View style={{ width: '100%' }}>
            {/* Google Login */}
            <Pressable 
              style={{ marginBottom: PaddingSizes.base, width: '100%' }}
              onPress={async () => {
                if (isOAuthLoading) return;
                setIsOAuthLoading('google');
                try {
                  const { user, error } = await signInWithGoogle();
                  if (error) {
                    Alert.alert('Login failed', error);
                  } else if (user) {
                    navigation.replace('/(tabs)');
                  }
                } catch (error: any) {
                  Alert.alert('Error', error.message || 'Failed to sign in with Google');
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
                        Continue with Google
                      </Text>
                    </>
                  )}
                </View>
              )}
            </Pressable>

            {/* Apple Login */}
            <Pressable 
              style={{ marginBottom: PaddingSizes.lg, width: '100%' }}
              onPress={async () => {
                if (isOAuthLoading) return;
                setIsOAuthLoading('apple');
                try {
                  const { user, error } = await signInWithApple();
                  if (error) {
                    Alert.alert('Login failed', error);
                  } else if (user) {
                    navigation.replace('/(tabs)');
                  }
                } catch (error: any) {
                  Alert.alert('Error', error.message || 'Failed to sign in with Apple');
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
                        Continue with Apple
                      </Text>
                    </>
                  )}
                </View>
              )}
            </Pressable>

            {/* Sign Up Link */}
            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
              <Text className="text-white/70">No account? </Text>
              <Link href="/auth/signup">
                <Text className="text-[#EC4899] font-semibold">Let's create your account</Text>
              </Link>
            </View>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
