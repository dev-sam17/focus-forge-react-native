import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal } from 'react-native';

interface AddTaskDialogProps {
  onClose: () => void;
}

export function AddTaskDialog({ onClose }: AddTaskDialogProps) {
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');

  return (
    <Modal transparent animationType="fade" visible>
      <View className="flex-1 bg-black/50 items-center justify-center p-4">
        <View className="bg-card w-full max-w-sm rounded-2xl p-6 border border-border shadow-lg">
          <Text className="text-xl font-bold text-foreground mb-4">Create Tracker</Text>
          
          <View className="space-y-4 mb-6">
            <View className="mb-4">
              <Text className="text-sm font-medium text-foreground mb-2">Tracker Name</Text>
              <TextInput 
                className="w-full bg-secondary text-foreground p-3 rounded-lg border border-border"
                placeholder="E.g., Deep Work"
                placeholderTextColor="#9ca3af"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-foreground mb-2">Weekly Target (Hours)</Text>
              <TextInput 
                className="w-full bg-secondary text-foreground p-3 rounded-lg border border-border"
                placeholder="E.g., 20"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                value={target}
                onChangeText={setTarget}
              />
            </View>
          </View>

          <View className="flex-row justify-end space-x-3 mt-2">
            <TouchableOpacity 
              onPress={onClose}
              className="px-4 py-2 rounded-lg border border-border mr-3"
            >
              <Text className="text-foreground font-medium">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={onClose}
              className="px-4 py-2 bg-primary rounded-lg"
            >
              <Text className="text-white font-medium">Create</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
