import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
} from 'react-native';
import {
  Play,
  Square,
  Clock,
  Archive,
  Disc,
  Target,
  TrendingUp,
  TrendingDown,
  Edit2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { Tracker, ActiveSession, WorkStats } from '../lib/types';
import { formatTime } from '../lib/utils';
import useApiClient from '../hooks/useApiClient';
import { useAuth } from '../contexts/AuthContext';

interface TimeTrackerProps {
  task: Tracker;
  session?: ActiveSession;
  onStart: (taskId: string) => void;
  onStop: (taskId: string, elapsedTime: number) => void;
  onArchive: (taskId: string) => void;
  onEdit: (taskId: string) => void;
}

export function TimeTracker({
  task,
  session,
  onStart,
  onStop,
  onArchive,
  onEdit,
}: TimeTrackerProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [archiveModalVisible, setArchiveModalVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!!session);
  const [workStats, setWorkStats] = useState<WorkStats>({
    workAdvance: 0,
    workDebt: 0,
  });

  // Expand when running
  useEffect(() => {
    if (isRunning) {
      setIsExpanded(true);
    }
  }, [isRunning]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { user } = useAuth();
  const api = useApiClient(user?.id);

  // Sync with active session from backend
  useEffect(() => {
    if (session) {
      const startTimestamp = typeof session.startTime === 'number'
        ? session.startTime
        : new Date(session.startTime).getTime();
      setElapsedTime(Math.max(0, Date.now() - startTimestamp));
      setIsRunning(true);
    } else {
      setIsRunning(false);
      setElapsedTime(0);
    }
  }, [session]);

  // Fetch tracker financial work stats
  const fetchWorkStats = async () => {
    const res = await api<WorkStats>(`/trackers/${task.id}/stats`);
    if (res.success && res.data) {
      setWorkStats(res.data);
    }
  };

  useEffect(() => {
    fetchWorkStats();
    const interval = setInterval(fetchWorkStats, 60000);
    return () => clearInterval(interval);
  }, [task.id]);

  // Local timer ticker
  useEffect(() => {
    if (isRunning) {
      const startTime = Date.now() - elapsedTime;
      intervalRef.current = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 500);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const handleStart = () => {
    setIsRunning(true);
    onStart(task.id);
  };

  const handleStop = () => {
    setIsRunning(false);
    onStop(task.id, elapsedTime);
    setElapsedTime(0);
  };

  const confirmArchive = () => {
    setArchiveModalVisible(false);
    onArchive(task.id);
  };

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const workDaysArray = task.workDays ? task.workDays.split(',').map(Number) : [1, 2, 3, 4, 5];

  return (
    <>
      <View
        style={{
          backgroundColor: 'rgba(31, 41, 55, 0.7)',
          borderColor: isRunning ? 'rgba(59, 130, 246, 0.4)' : 'rgba(75, 85, 99, 0.35)',
          borderWidth: 1,
          borderRadius: 20,
          overflow: 'hidden',
          marginBottom: 16,
          shadowColor: isRunning ? '#3b82f6' : '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isRunning ? 0.25 : 0.15,
          shadowRadius: 12,
          elevation: 4,
        }}
      >
        {/* Card Header */}
        <TouchableOpacity
          onPress={() => setIsExpanded(!isExpanded)}
          activeOpacity={0.7}
          style={{
            backgroundColor: 'rgba(55, 65, 81, 0.25)',
            borderBottomWidth: isExpanded ? 1 : 0,
            borderColor: 'rgba(75, 85, 99, 0.3)',
            padding: 14,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <View className="flex-1 mr-2">
            <Text className="text-base font-bold text-foreground" numberOfLines={1}>
              {task.trackerName}
            </Text>
            {task.description ? (
              <Text className="text-xs text-muted-foreground mt-0.5" numberOfLines={1}>
                {task.description}
              </Text>
            ) : null}
          </View>

          {/* Status Badge & Chevron */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {isRunning ? (
              <View
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  borderColor: '#10b981',
                  borderWidth: 1,
                  borderRadius: 12,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Disc size={12} color="#10b981" />
                <Text className="text-[11px] font-semibold text-success ml-1">Active</Text>
              </View>
            ) : (
              <View
                style={{
                  borderColor: 'rgba(156, 163, 175, 0.3)',
                  borderWidth: 1,
                  borderRadius: 12,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                }}
              >
                <Text className="text-[11px] font-medium text-muted-foreground">Inactive</Text>
              </View>
            )}
            
            {isExpanded ? (
              <ChevronUp size={20} color="#9ca3af" />
            ) : (
              <ChevronDown size={20} color="#9ca3af" />
            )}
          </View>
        </TouchableOpacity>

        {/* Card Body */}
        {isExpanded && (
          <View className="p-4">
          {/* Timer Display */}
          <View className="items-center mb-3">
            <View className="flex-row items-center justify-center">
              <Clock
                size={20}
                color={isRunning ? '#3b82f6' : '#9ca3af'}
                style={{ marginRight: 6 }}
              />
              <Text
                style={{
                  fontSize: 28,
                  fontFamily: 'monospace',
                  fontWeight: '700',
                  color: isRunning ? '#60a5fa' : '#f9fafb',
                  letterSpacing: 1,
                }}
              >
                {formatTime(elapsedTime)}
              </Text>
            </View>

            <View className="flex-row items-center mt-1">
              <Target size={13} color="#9ca3af" />
              <Text className="text-xs text-muted-foreground ml-1">
                Goal: <Text className="font-semibold text-foreground">{task.targetHours}h</Text>
              </Text>
            </View>
          </View>

          {/* Work Days Pills */}
          <View className="flex-row justify-center gap-1 mb-3.5">
            {daysOfWeek.map((day, index) => {
              const isActive = workDaysArray.includes(index);
              return (
                <View
                  key={index}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 7,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isActive
                      ? '#3b82f6'
                      : 'rgba(55, 65, 81, 0.4)',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: isActive ? '700' : '500',
                      color: isActive ? '#ffffff' : '#9ca3af',
                    }}
                  >
                    {day}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Debt & Advance Stats Badges */}
          <View className="flex-row gap-2 mb-4">
            <View
              style={{
                flex: 1,
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                borderColor: 'rgba(239, 68, 68, 0.25)',
                borderWidth: 1,
                borderRadius: 10,
                paddingVertical: 6,
                alignItems: 'center',
              }}
            >
              <View className="flex-row items-center">
                <TrendingDown size={13} color="#ef4444" />
                <Text className="text-[11px] text-destructive font-medium ml-1">Debt</Text>
              </View>
              <Text className="text-sm font-bold text-destructive mt-0.5">
                {workStats.workDebt}h
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                borderColor: 'rgba(16, 185, 129, 0.25)',
                borderWidth: 1,
                borderRadius: 10,
                paddingVertical: 6,
                alignItems: 'center',
              }}
            >
              <View className="flex-row items-center">
                <TrendingUp size={13} color="#10b981" />
                <Text className="text-[11px] text-success font-medium ml-1">Advance</Text>
              </View>
              <Text className="text-sm font-bold text-success mt-0.5">
                {workStats.workAdvance}h
              </Text>
            </View>
          </View>

          {/* Action Buttons Row */}
          <View className="flex-row gap-2 items-center">
            <TouchableOpacity
              onPress={isRunning ? handleStop : handleStart}
              activeOpacity={0.85}
              style={{
                flex: 1,
                height: 38,
                borderRadius: 10,
                overflow: 'hidden',
                backgroundColor: isRunning ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                borderColor: isRunning ? 'rgba(239, 68, 68, 0.4)' : 'transparent',
                borderWidth: isRunning ? 1 : 0,
              }}
            >
              {isRunning ? (
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  <Square size={15} color="#ef4444" />
                  <Text className="text-destructive font-semibold text-xs ml-1.5">Stop</Text>
                </View>
              ) : (
                <LinearGradient
                  colors={['#3b82f6', '#10b981']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    width: '100%',
                    height: '100%',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Play size={15} color="#ffffff" />
                  <Text className="text-white font-semibold text-xs ml-1.5">Start</Text>
                </LinearGradient>
              )}
            </TouchableOpacity>

            {/* Edit Button */}
            <TouchableOpacity
              onPress={() => onEdit(task.id)}
              className="w-9 h-9 rounded-lg bg-secondary/80 items-center justify-center"
            >
              <Edit2 size={15} color="#9ca3af" />
            </TouchableOpacity>

            {/* Archive Button */}
            <TouchableOpacity
              onPress={() => setArchiveModalVisible(true)}
              className="w-9 h-9 rounded-lg bg-secondary/80 items-center justify-center"
            >
              <Archive size={15} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </View>
        )}
      </View>

      {/* Archive Confirmation Dialog */}
      <Modal
        transparent
        animationType="fade"
        visible={archiveModalVisible}
        onRequestClose={() => setArchiveModalVisible(false)}
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
            <Text className="text-lg font-bold text-foreground mb-2">Archive Tracker</Text>
            <Text className="text-sm text-muted-foreground mb-6 leading-5">
              {isRunning
                ? 'This tracker is currently running. Are you sure you want to archive it?'
                : `Are you sure you want to archive "${task.trackerName}"? You can restore it from the Archives tab at any time.`}
            </Text>

            <View className="flex-row justify-end gap-3">
              <TouchableOpacity
                onPress={() => setArchiveModalVisible(false)}
                className="px-4 py-2.5 rounded-xl border border-border"
              >
                <Text className="text-foreground font-medium text-sm">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmArchive}
                className="px-4 py-2.5 rounded-xl bg-destructive"
              >
                <Text className="text-white font-medium text-sm">Archive</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

export default TimeTracker;
