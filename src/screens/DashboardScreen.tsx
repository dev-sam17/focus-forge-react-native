import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TimeTrackingDashboard } from '../components/TimeTrackingDashboard';
import { LogOut } from 'lucide-react-native';

export function DashboardScreen() {
  const { signOut } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 p-6">
        <View className="flex-row justify-end mb-2">
          <TouchableOpacity 
            className="flex-row items-center p-2 rounded-lg bg-card border border-border"
            onPress={signOut}
          >
            <LogOut size={16} className="text-destructive mr-2" />
            <Text className="text-destructive font-medium text-sm">Sign Out</Text>
          </TouchableOpacity>
        </View>
        <TimeTrackingDashboard />
      </View>
    </SafeAreaView>
  );
}
