import { signIn } from '@/lib/auth';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
            paddingTop: insets.top + 40,
            paddingBottom: insets.bottom + 32,
            paddingLeft: Math.max(insets.left, 24),
            paddingRight: Math.max(insets.right, 24),
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
            <Text className="text-4xl font-bold text-white text-center mb-2">
              PartPulse
            </Text>
            <Text className="text-lg text-white/70 text-center mb-8">
              Welcome back
            </Text>

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
                  autoComplete="password"
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
                  <Text className="text-white text-lg font-bold">
                    Login
                  </Text>
                </LinearGradient>
              )}
            </Pressable>

          </View>


          {/* Divider */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24, flex: 1 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: '#2B2E36' }} />
            <Text className="text-white/50 mx-4 text-sm">or</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: '#2B2E36' }} />
          </View>

          <View style={{ width: '100%' }}>
            {/* Google Login */}
            <Pressable style={{ marginBottom: 12 }}>
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
                    Continue with Google
                  </Text>
                </View>
              )}
            </Pressable>

            {/* Apple Login */}
            <Pressable style={{ marginBottom: 24 }}>
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
                    Continue with Apple
                  </Text>
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
