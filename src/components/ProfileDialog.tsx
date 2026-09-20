import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Wifi, WifiOff, X, RefreshCcw } from 'lucide-react-native';
import { API_URL } from '../lib/env';
import * as Updates from 'expo-updates';

interface ProfileDialogProps {
  visible: boolean;
  onClose: () => void;
}

export function ProfileDialog({ visible, onClose }: ProfileDialogProps) {
  const { user, signOut } = useAuth();
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;

    const checkServerHealth = async () => {
      try {
        const res = await fetch(`${API_URL.replace(/\/+$/, '')}/ping`);
        setIsOnline(res.ok);
      } catch {
        setIsOnline(false);
      }
    };

    checkServerHealth();
  }, [visible]);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    setSigningOut(false);
    onClose();
  };

  const handleCheckForUpdate = async () => {
    try {
      setCheckingUpdate(true);
      setUpdateMessage('Checking for updates...');
      const update = await Updates.checkForUpdateAsync();
      
      if (update.isAvailable) {
        setUpdateMessage('Downloading update...');
        await Updates.fetchUpdateAsync();
        setUpdateMessage('Restarting app...');
        await Updates.reloadAsync();
      } else {
        setUpdateMessage('App is up to date.');
        setTimeout(() => setUpdateMessage(null), 3000);
      }
    } catch (error) {
      setUpdateMessage('Error checking for updates.');
      console.error(error);
      setTimeout(() => setUpdateMessage(null), 3000);
    } finally {
      if (!updateMessage?.includes('Restarting')) {
        setCheckingUpdate(false);
      }
    }
  };

  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const email = user?.email || 'Logged in user';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/60 items-center justify-center p-5">
        <View
          style={{
            backgroundColor: 'rgba(31, 41, 55, 0.95)',
            borderColor: 'rgba(255, 255, 255, 0.12)',
            borderWidth: 1,
            borderRadius: 24,
            padding: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.4,
            shadowRadius: 24,
            elevation: 10,
          }}
          className="w-full max-w-sm"
        >
          {/* Header with Close button */}
          <View className="flex-row items-center justify-between mb-5">
            <Text className="text-xl font-bold text-foreground">Account Profile</Text>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 rounded-full bg-secondary items-center justify-center"
            >
              <X size={18} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          {/* User Info */}
          <View className="flex-row items-center space-x-4 mb-6">
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={{ width: 56, height: 56, borderRadius: 28 }}
                className="mr-3 border border-border/50"
              />
            ) : (
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: '#3b82f6',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <Text className="text-white font-bold text-2xl">{initial}</Text>
              </View>
            )}

            <View className="flex-1">
              <Text className="text-lg font-semibold text-foreground truncate">
                {displayName}
              </Text>
              <Text className="text-xs text-muted-foreground truncate mt-0.5">
                {email}
              </Text>
            </View>
          </View>

          {/* Connection Status Indicator */}
          <View
            style={{
              backgroundColor: 'rgba(55, 65, 81, 0.5)',
              borderColor: 'rgba(75, 85, 99, 0.3)',
              borderWidth: 1,
              borderRadius: 14,
              padding: 12,
              marginBottom: 20,
            }}
            className="flex-row items-center justify-between"
          >
            <View className="flex-row items-center">
              {isOnline === null ? (
                <ActivityIndicator size="small" color="#9ca3af" style={{ marginRight: 8 }} />
              ) : isOnline ? (
                <View className="w-6 h-6 rounded-full bg-success/20 items-center justify-center mr-2.5">
                  <Wifi size={14} color="#10b981" />
                </View>
              ) : (
                <View className="w-6 h-6 rounded-full bg-destructive/20 items-center justify-center mr-2.5">
                  <WifiOff size={14} color="#ef4444" />
                </View>
              )}
              <Text className="text-xs text-foreground font-medium">Server Sync</Text>
            </View>

            <View
              className={`px-2.5 py-1 rounded-full ${
                isOnline ? 'bg-success/15' : 'bg-destructive/15'
              }`}
            >
              <Text
                className={`text-[11px] font-semibold ${
                  isOnline ? 'text-success' : 'text-destructive'
                }`}
              >
                {isOnline === null ? 'Checking...' : isOnline ? 'Online' : 'Disconnected'}
              </Text>
            </View>
          </View>

          {/* Actions */}
          <TouchableOpacity
            onPress={handleCheckForUpdate}
            disabled={checkingUpdate}
            activeOpacity={0.8}
            style={{
              backgroundColor: 'rgba(59, 130, 246, 0.12)',
              borderColor: 'rgba(59, 130, 246, 0.3)',
              borderWidth: 1,
              borderRadius: 14,
              paddingVertical: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}
          >
            {checkingUpdate ? (
              <ActivityIndicator size="small" color="#3b82f6" style={{ marginRight: 8 }} />
            ) : (
              <RefreshCcw size={18} color="#3b82f6" style={{ marginRight: 8 }} />
            )}
            <Text className="text-primary font-semibold text-sm">
              {updateMessage || 'Check for Updates'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSignOut}
            disabled={signingOut}
            activeOpacity={0.8}
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              borderColor: 'rgba(239, 68, 68, 0.3)',
              borderWidth: 1,
              borderRadius: 14,
              paddingVertical: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {signingOut ? (
              <ActivityIndicator size="small" color="#ef4444" style={{ marginRight: 8 }} />
            ) : (
              <LogOut size={18} color="#ef4444" style={{ marginRight: 8 }} />
            )}
            <Text className="text-destructive font-semibold text-sm">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
