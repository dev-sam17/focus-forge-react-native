import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Target, Sparkles, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { NewTracker } from '../lib/types';

interface AddTaskDialogProps {
  visible: boolean;
  onClose: () => void;
  onAddTask: (task: {
    trackerName: string;
    description: string;
    targetHours: number;
    workDays: string;
  }) => Promise<boolean | string> | void;
}

export function AddTaskDialog({ visible, onClose, onAddTask }: AddTaskDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetHours, setTargetHours] = useState('20');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [saving, setSaving] = useState(false);

  const daysOfWeek = [
    { value: 0, label: 'S' },
    { value: 1, label: 'M' },
    { value: 2, label: 'T' },
    { value: 3, label: 'W' },
    { value: 4, label: 'T' },
    { value: 5, label: 'F' },
    { value: 6, label: 'S' },
  ];

  const toggleDay = (dayValue: number) => {
    if (selectedDays.includes(dayValue)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter((d) => d !== dayValue));
      }
    } else {
      setSelectedDays([...selectedDays, dayValue].sort());
    }
  };

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!name.trim() || saving) return;

    setErrorMsg(null);
    setSaving(true);
    const result = await onAddTask({
      trackerName: name.trim(),
      description: description.trim(),
      targetHours: parseFloat(targetHours) || 0,
      workDays: selectedDays.join(','),
    });
    setSaving(false);

    if (result === true) {
      setName('');
      setDescription('');
      setTargetHours('20');
      setSelectedDays([1, 2, 3, 4, 5]);
      onClose();
    } else if (typeof result === 'string') {
      setErrorMsg(result);
    } else if (result === false) {
      setErrorMsg('Failed to create tracker. Please try again.');
    }
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/60 items-center justify-center p-4">
        <View
          style={{
            backgroundColor: 'rgba(31, 41, 55, 0.96)',
            borderColor: 'rgba(255, 255, 255, 0.12)',
            borderWidth: 1,
            borderRadius: 24,
            overflow: 'hidden',
            width: '100%',
            maxWidth: 380,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.4,
            shadowRadius: 24,
            elevation: 10,
          }}
        >
          {/* Header */}
          <LinearGradient
            colors={['rgba(59, 130, 246, 0.2)', 'rgba(16, 185, 129, 0.2)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              paddingHorizontal: 20,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.08)',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary to-accent items-center justify-center mr-2.5">
                <Target size={16} color="white" />
              </View>
              <Text className="text-lg font-bold text-foreground">
                Create New Tracker
              </Text>
              <Sparkles size={16} color="#3b82f6" className="ml-1.5" />
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 rounded-full bg-secondary items-center justify-center"
            >
              <X size={16} color="#9ca3af" />
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView className="p-5 max-h-[500px]" showsVerticalScrollIndicator={false}>
            {errorMsg && (
              <View className="mb-4 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                <Text className="text-red-400 text-sm">{errorMsg}</Text>
              </View>
            )}

            {/* Task Name Input */}
            <View className="mb-4">
              <Text className="text-xs font-semibold text-foreground/80 mb-2">
                Tracker Name *
              </Text>
              <TextInput
                style={{
                  backgroundColor: 'rgba(17, 24, 39, 0.8)',
                  borderColor: 'rgba(75, 85, 99, 0.5)',
                  borderWidth: 1,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  color: '#f9fafb',
                  fontSize: 14,
                }}
                placeholder="E.g., Deep Work"
                placeholderTextColor="#9ca3af"
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Description Input */}
            <View className="mb-4">
              <Text className="text-xs font-semibold text-foreground/80 mb-2">
                Description (Optional)
              </Text>
              <TextInput
                style={{
                  backgroundColor: 'rgba(17, 24, 39, 0.8)',
                  borderColor: 'rgba(75, 85, 99, 0.5)',
                  borderWidth: 1,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  color: '#f9fafb',
                  fontSize: 14,
                }}
                placeholder="What will you focus on?"
                placeholderTextColor="#9ca3af"
                value={description}
                onChangeText={setDescription}
              />
            </View>

            {/* Target Hours */}
            <View className="mb-4">
              <Text className="text-xs font-semibold text-foreground/80 mb-2">
                Weekly Target (Hours)
              </Text>
              <TextInput
                style={{
                  backgroundColor: 'rgba(17, 24, 39, 0.8)',
                  borderColor: 'rgba(75, 85, 99, 0.5)',
                  borderWidth: 1,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  color: '#f9fafb',
                  fontSize: 14,
                }}
                placeholder="E.g., 20"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                value={targetHours}
                onChangeText={setTargetHours}
              />
            </View>

            {/* Working Days */}
            <View className="mb-6">
              <Text className="text-xs font-semibold text-foreground/80 mb-2">
                Working Days
              </Text>
              <View className="flex-row justify-between gap-1">
                {daysOfWeek.map((day) => {
                  const isActive = selectedDays.includes(day.value);
                  return (
                    <TouchableOpacity
                      key={day.value}
                      onPress={() => toggleDay(day.value)}
                      activeOpacity={0.7}
                      style={{
                        flex: 1,
                        aspectRatio: 1,
                        borderRadius: 10,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isActive
                          ? '#3b82f6'
                          : 'rgba(55, 65, 81, 0.5)',
                        borderWidth: 1,
                        borderColor: isActive
                          ? '#60a5fa'
                          : 'rgba(75, 85, 99, 0.4)',
                      }}
                    >
                      <Text
                        style={{
                          color: isActive ? '#ffffff' : '#9ca3af',
                          fontWeight: isActive ? '700' : '500',
                          fontSize: 13,
                        }}
                      >
                        {day.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Actions */}
            <View className="flex-row justify-end gap-3 pb-2">
              <TouchableOpacity
                onPress={onClose}
                className="px-4 py-2.5 rounded-xl border border-border"
              >
                <Text className="text-foreground font-medium text-sm">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreate}
                disabled={!name.trim() || saving}
                activeOpacity={0.85}
                style={{
                  borderRadius: 12,
                  overflow: 'hidden',
                  opacity: !name.trim() || saving ? 0.5 : 1,
                }}
              >
                <LinearGradient
                  colors={['#3b82f6', '#10b981']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  {saving && (
                    <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />
                  )}
                  <Text className="text-white font-semibold text-sm">Create Tracker</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export default AddTaskDialog;

