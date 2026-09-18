import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Modal } from 'react-native';
import { Clock, Trash2, Archive, RotateCcw } from 'lucide-react-native';
import type { Tracker } from '../lib/types';

interface ArchivedTrackerProps {
  task: Tracker;
  onDelete: (taskId: string) => void;
  onUnarchive: (taskId: string) => void;
}

export function ArchivedTracker({
  task,
  onDelete,
  onUnarchive,
}: ArchivedTrackerProps) {
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const confirmDelete = () => {
    setDeleteModalVisible(false);
    onDelete(task.id);
  };

  return (
    <>
      <View
        style={{
          backgroundColor: 'rgba(31, 41, 55, 0.6)',
          borderColor: 'rgba(75, 85, 99, 0.3)',
          borderWidth: 1,
          borderRadius: 20,
          overflow: 'hidden',
          marginBottom: 16,
        }}
      >
        {/* Card Header */}
        <View className="bg-muted/20 p-4 border-b border-border/30 flex-row justify-between items-start">
          <View className="flex-1 mr-2">
            <Text className="text-base font-semibold text-foreground/90">
              {task.trackerName}
            </Text>
            {task.description ? (
              <Text className="text-xs text-muted-foreground mt-0.5" numberOfLines={2}>
                {task.description}
              </Text>
            ) : null}
          </View>
          <View className="flex-row items-center px-2 py-0.5 rounded-md border border-muted-foreground/30 bg-muted/20">
            <Archive size={12} color="#9ca3af" className="mr-1" />
            <Text className="text-[11px] text-muted-foreground font-medium ml-1">
              Archived
            </Text>
          </View>
        </View>

        {/* Card Body */}
        <View className="p-4">
          <View
            style={{
              backgroundColor: 'rgba(55, 65, 81, 0.3)',
              borderColor: 'rgba(75, 85, 99, 0.2)',
              borderWidth: 1,
              borderRadius: 12,
              padding: 12,
              alignItems: 'center',
            }}
          >
            <View className="flex-row items-center">
              <Clock size={16} color="#9ca3af" />
              <Text className="text-sm text-muted-foreground ml-2">
                Weekly Target: <Text className="text-foreground font-semibold">{task.targetHours}h</Text>
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-2 mt-4">
            <TouchableOpacity
              onPress={() => onUnarchive(task.id)}
              activeOpacity={0.8}
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderColor: 'rgba(59, 130, 246, 0.3)',
                borderWidth: 1,
                borderRadius: 12,
                paddingVertical: 10,
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <RotateCcw size={16} color="#3b82f6" />
              <Text className="text-primary font-semibold text-xs ml-2">Unarchive</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setDeleteModalVisible(true)}
              activeOpacity={0.8}
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderColor: 'rgba(239, 68, 68, 0.3)',
                borderWidth: 1,
                borderRadius: 12,
                paddingVertical: 10,
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Trash2 size={16} color="#ef4444" />
              <Text className="text-destructive font-semibold text-xs ml-2">Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Delete Confirmation Modal */}
      <Modal
        transparent
        animationType="fade"
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View className="flex-1 bg-black/60 items-center justify-center p-5">
          <View
            style={{
              backgroundColor: 'rgba(31, 41, 55, 0.95)',
              borderColor: 'rgba(255, 255, 255, 0.12)',
              borderWidth: 1,
              borderRadius: 20,
              padding: 24,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.4,
              shadowRadius: 20,
              elevation: 8,
            }}
            className="w-full max-w-sm"
          >
            <Text className="text-lg font-bold text-foreground mb-2">Delete Tracker</Text>
            <Text className="text-sm text-muted-foreground mb-6 leading-5">
              Are you sure you want to permanently delete "{task.trackerName}"? This action cannot be undone and will delete all associated session history.
            </Text>

            <View className="flex-row justify-end gap-3">
              <TouchableOpacity
                onPress={() => setDeleteModalVisible(false)}
                className="px-4 py-2.5 rounded-xl border border-border"
              >
                <Text className="text-foreground font-medium text-sm">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmDelete}
                className="px-4 py-2.5 rounded-xl bg-destructive"
              >
                <Text className="text-white font-medium text-sm">Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

export default ArchivedTracker;
