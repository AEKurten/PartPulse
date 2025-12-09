import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
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
            paddingTop: insets.top + 40,
            paddingBottom: insets.bottom + 32,
            paddingLeft: Math.max(insets.left, 24),
            paddingRight: Math.max(insets.right, 24),
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
          }}
        >
          {/* App Name */}
          <Text className="text-4xl font-bold text-white text-center mb-2">
            PartPulse
          </Text>
          <Text className="text-lg text-neutral-400 text-center mb-8">
            Let's create your account
          </Text>

          {/* Username Input */}
          <View style={{ marginBottom: 16, width: '100%' }}>
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
                paddingHorizontal: 16,
                paddingVertical: 16,
                fontSize: 16,
                color: '#FFFFFF',
                borderWidth: usernameFocused ? 2 : 0,
                borderColor: usernameFocused ? '#EC4899' : 'transparent',
              }}
            />
          </View>

          {/* Email Input */}
          <View style={{ marginBottom: 16, width: '100%' }}>
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
                paddingHorizontal: 16,
                paddingVertical: 16,
                fontSize: 16,
                color: '#FFFFFF',
                borderWidth: emailFocused ? 2 : 0,
                borderColor: emailFocused ? '#EC4899' : 'transparent',
              }}
            />
          </View>

          {/* Password Input */}
          <View style={{ marginBottom: 24, width: '100%' }}>
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
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  fontSize: 16,
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
                  right: 16,
                  top: 16,
                  padding: 4,
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
          <Link href="/(tabs)" asChild>
            <Pressable style={{ width: '100%', marginBottom: 24 }}>
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
                  <Text className="text-white text-lg font-bold">
                    Create Account
                  </Text>
                </LinearGradient>
              )}
            </Pressable>
          </Link>

          {/* Divider */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: '#2B2E36' }} />
            <Text className="text-white/50 mx-4 text-sm">or</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: '#2B2E36' }} />
          </View>

          {/* Google Sign Up */}
          <Pressable style={{ marginBottom: 12, width: '100%' }}>
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
                  opacity: pressed ? 0.8 : 1,
                }}
              >
                <Ionicons name="logo-google" size={20} color="#FFFFFF" style={{ marginRight: 12 }} />
                <Text className="text-white text-lg font-semibold">
                  Sign up with Google
                </Text>
              </View>
            )}
          </Pressable>

          {/* Apple Sign Up */}
          <Pressable style={{ marginBottom: 24, width: '100%' }}>
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
                  opacity: pressed ? 0.8 : 1,
                }}
              >
                <Ionicons name="logo-apple" size={20} color="#FFFFFF" style={{ marginRight: 12 }} />
                <Text className="text-white text-lg font-semibold">
                  Sign up with Apple
                </Text>
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
