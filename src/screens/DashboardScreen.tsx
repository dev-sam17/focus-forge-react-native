import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StatusBar, Image } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TimeTrackingDashboard } from '../components/TimeTrackingDashboard';
import { Clock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ProfileDialog } from '../components/ProfileDialog';

export function DashboardScreen() {
  const { user } = useAuth();
  const [profileVisible, setProfileVisible] = useState(false);

  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const initial = (user?.user_metadata?.full_name || user?.email || 'U').charAt(0).toUpperCase();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#111827" />

      {/* Screen Background Ambient Glowing Orbs */}
      <View className="absolute inset-0 overflow-hidden pointer-events-none">
        <LinearGradient
          colors={['#111827', '#111827', '#0f172a']}
          style={{ position: 'absolute', inset: 0 }}
        />
        <View
          style={{
            position: 'absolute',
            top: -90,
            right: -90,
            width: 260,
            height: 260,
            borderRadius: 130,
            backgroundColor: 'rgba(59, 130, 246, 0.08)',
          }}
        />
        <View
          style={{
            position: 'absolute',
            bottom: -90,
            left: -90,
            width: 260,
            height: 260,
            borderRadius: 130,
            backgroundColor: 'rgba(16, 185, 129, 0.07)',
          }}
        />
      </View>

      <View className="flex-1 px-4 pt-2">
        {/* Minimal Navbar Header matching Electron */}
        <View
          style={{
            backgroundColor: 'rgba(31, 41, 55, 0.65)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            borderRadius: 18,
            paddingHorizontal: 16,
            paddingVertical: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 10,
            elevation: 4,
          }}
          className="flex-row items-center justify-between mb-4"
        >
          {/* Logo & Brand */}
          <View className="flex-row items-center">
            <LinearGradient
              colors={['#3b82f6', '#10b981']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 10,
              }}
            >
              <Clock size={18} color="#ffffff" />
            </LinearGradient>
            <Text className="text-xl font-bold text-foreground tracking-tight">
              Focus Forge
            </Text>
          </View>

          {/* User Profile Trigger */}
          <TouchableOpacity
            onPress={() => setProfileVisible(true)}
            activeOpacity={0.8}
            className="flex-row items-center"
          >
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={{ width: 34, height: 34, borderRadius: 17 }}
                className="border border-primary/50"
              />
            ) : (
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: '#3b82f6',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text className="text-white font-bold text-sm">{initial}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Dashboard Core Tabs & Content */}
        <TimeTrackingDashboard />
      </View>

      <ProfileDialog
        visible={profileVisible}
        onClose={() => setProfileVisible(false)}
      />
    </SafeAreaView>
  );
}
