import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Clock, Sparkles } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Line } from 'react-native-svg';

function ChromeIcon({ size = 20, color = 'white' }: { size?: number; color?: string }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Circle cx="12" cy="12" r="10" />
      <Circle cx="12" cy="12" r="4" />
      <Line x1="21.17" y1="8" x2="12" y2="8" />
      <Line x1="3.95" y1="6.06" x2="8.54" y2="14" />
      <Line x1="10.88" y1="21.94" x2="15.46" y2="14" />
    </Svg>
  );
}

export function SignInScreen() {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    await signInWithGoogle();
    setLoading(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#111827" />

      {/* Screen Background Gradient & Animated-style Glowing Orbs */}
      <View className="absolute inset-0 overflow-hidden pointer-events-none">
        <LinearGradient
          colors={['#111827', '#111827', '#0f172a']}
          style={{ position: 'absolute', inset: 0 }}
        />
        {/* Top-Right Orb */}
        <View
          style={{
            position: 'absolute',
            top: -90,
            right: -90,
            width: 260,
            height: 260,
            borderRadius: 130,
            backgroundColor: 'rgba(59, 130, 246, 0.12)',
          }}
        />
        {/* Bottom-Left Orb */}
        <View
          style={{
            position: 'absolute',
            bottom: -90,
            left: -90,
            width: 260,
            height: 260,
            borderRadius: 130,
            backgroundColor: 'rgba(16, 185, 129, 0.10)',
          }}
        />
        {/* Center Orb */}
        <View
          style={{
            position: 'absolute',
            top: '38%',
            alignSelf: 'center',
            width: 200,
            height: 200,
            borderRadius: 100,
            backgroundColor: 'rgba(59, 130, 246, 0.05)',
          }}
        />
      </View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        className="px-6 py-8"
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center w-full max-w-md mx-auto">
          {/* Header */}
          <View className="items-center mb-8">
            <View className="flex-row items-center justify-center mb-6">
              <LinearGradient
                colors={['#3b82f6', '#10b981']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 14,
                  shadowColor: '#6366f1',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.4,
                  shadowRadius: 16,
                  elevation: 8,
                }}
              >
                <Clock size={32} color="#ffffff" />
              </LinearGradient>
              <View>
                <Text className="text-3xl font-bold text-foreground">
                  Focus Forge
                </Text>
                <View className="flex-row items-center mt-1">
                  <Sparkles size={16} color="#3b82f6" />
                  <Text className="text-sm text-muted-foreground ml-1">
                    Forge better focus
                  </Text>
                </View>
              </View>
            </View>

            <View className="items-center px-4">
              <Text className="text-2xl font-semibold text-foreground text-center mb-2">
                Welcome back!
              </Text>
              <Text className="text-sm text-muted-foreground text-center leading-5">
                Sign in to continue forging your focus and boost your productivity.
              </Text>
            </View>
          </View>

          {/* Sign In Glass Card */}
          <View
            style={{
              backgroundColor: 'rgba(31, 41, 55, 0.55)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              borderWidth: 1,
              borderRadius: 20,
              padding: 24,
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 6,
            }}
            className="w-full mb-8"
          >
            <Text className="text-lg font-semibold text-center text-foreground mb-6">
              Choose your sign-in method
            </Text>

            {/* Google Sign In Button */}
            <TouchableOpacity
              onPress={handleSignIn}
              disabled={loading}
              activeOpacity={0.85}
              style={{
                borderRadius: 12,
                overflow: 'hidden',
                shadowColor: '#1d4ed8',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.35,
                shadowRadius: 12,
                elevation: 4,
              }}
            >
              <LinearGradient
                colors={['#2563eb', '#1d4ed8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  height: 48,
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: 16,
                }}
              >
                {loading ? (
                  <ActivityIndicator color="white" style={{ marginRight: 10 }} />
                ) : (
                  <View style={{ marginRight: 10 }}>
                    <ChromeIcon size={20} color="white" />
                  </View>
                )}
                <Text className="text-white font-medium text-base">
                  Continue with Google
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Terms & Privacy */}
            <View className="pt-4 mt-6 border-t border-border/20">
              <Text className="text-xs text-center text-muted-foreground leading-4">
                By signing in, you agree to our Terms of Service and Privacy Policy.
                {'\n'}
                Your data is secure and encrypted.
              </Text>
            </View>
          </View>

          {/* Features Row */}
          <View className="flex-row justify-between w-full px-1">
            <View className="flex-1 items-center px-1">
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: 'rgba(59, 130, 246, 0.12)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8,
                }}
              >
                <Clock size={20} color="#3b82f6" />
              </View>
              <Text className="font-medium text-xs text-foreground text-center">
                Time Tracking
              </Text>
              <Text className="text-[11px] text-muted-foreground text-center mt-0.5">
                Track time across projects
              </Text>
            </View>

            <View className="flex-1 items-center px-1">
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8,
                }}
              >
                <Sparkles size={20} color="#10b981" />
              </View>
              <Text className="font-medium text-xs text-foreground text-center">
                Analytics
              </Text>
              <Text className="text-[11px] text-muted-foreground text-center mt-0.5">
                Detailed insights
              </Text>
            </View>

            <View className="flex-1 items-center px-1">
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8,
                }}
              >
                <ChromeIcon size={20} color="#10b981" />
              </View>
              <Text className="font-medium text-xs text-foreground text-center">
                Sync
              </Text>
              <Text className="text-[11px] text-muted-foreground text-center mt-0.5">
                Access anywhere
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
