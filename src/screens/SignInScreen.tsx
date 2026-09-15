import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Clock, Sparkles } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function SignInScreen() {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    await signInWithGoogle();
    setLoading(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center p-6">
        <View className="items-center mb-8">
          <View className="w-16 h-16 bg-primary rounded-2xl items-center justify-center shadow-lg mb-6">
            <Clock size={32} color="white" />
          </View>
          <Text className="text-3xl font-bold text-primary mb-2">Focus Forge</Text>
          <View className="flex-row items-center justify-center">
            <Sparkles size={16} className="text-primary mr-1" />
            <Text className="text-sm text-muted-foreground">Forge better focus</Text>
          </View>
        </View>

        <View className="w-full max-w-sm bg-card p-8 rounded-2xl shadow-sm border border-border">
          <Text className="text-lg font-semibold text-center text-foreground mb-6">
            Choose your sign-in method
          </Text>

          <TouchableOpacity 
            className="w-full h-12 bg-primary rounded-lg items-center justify-center flex-row"
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" className="mr-2" />
            ) : null}
            <Text className="text-white font-medium text-base">Continue with Google</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
