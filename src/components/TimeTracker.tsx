import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Play, Square, MoreVertical } from 'lucide-react-native';
import type { Tracker } from '../lib/types';
import { formatTime } from '../lib/utils';

interface TimeTrackerProps {
  tracker: Tracker;
}

export function TimeTracker({ tracker }: TimeTrackerProps) {
  const [isActive, setIsActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0); // Mock elapsed

  return (
    <View className="bg-card rounded-xl p-4 border border-border shadow-sm">
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-foreground">{tracker.trackerName}</Text>
          <Text className="text-sm text-muted-foreground mt-1" numberOfLines={1}>
            {tracker.description || 'No description'}
          </Text>
        </View>
        <TouchableOpacity className="p-1">
          <MoreVertical size={20} className="text-muted-foreground" />
        </TouchableOpacity>
      </View>

      <View className="flex-row items-center justify-between mt-4">
        <View>
          <Text className="text-3xl font-bold text-foreground">
            {formatTime(elapsedTime)}
          </Text>
          <Text className="text-xs text-muted-foreground mt-1">
            Target: {tracker.targetHours}h / week
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setIsActive(!isActive)}
          className={`w-14 h-14 rounded-full items-center justify-center shadow-md ${
            isActive ? 'bg-destructive' : 'bg-primary'
          }`}
        >
          {isActive ? (
            <Square size={24} color="white" className="ml-0" />
          ) : (
            <Play size={24} color="white" className="ml-1" />
          )}
        </TouchableOpacity>
      </View>

      {/* Progress Bar Mock */}
      <View className="w-full h-2 bg-secondary rounded-full mt-6 overflow-hidden">
        <View className="h-full bg-primary" style={{ width: '45%' }} />
      </View>
    </View>
  );
}
