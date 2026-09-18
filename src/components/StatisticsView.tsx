import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  Clock,
  Target,
  Flame,
  Zap,
  CheckCircle2,
  Calendar,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { Tracker } from '../lib/types';
import useApiClient from '../hooks/useApiClient';
import { useAuth } from '../contexts/AuthContext';

interface StatisticsViewProps {
  tasks: Tracker[];
}

interface TodayStats {
  date: string;
  hoursWorked: number;
  targetHours: number;
  progressPercentage: number;
  isWorkingDay: boolean;
  remainingHours: number;
  sessionCount: number;
  status: 'in_progress' | 'completed' | 'not_started';
}

export function StatisticsView({ tasks }: StatisticsViewProps) {
  const { user } = useAuth();
  const api = useApiClient(user?.id);

  const [todayStats, setTodayStats] = useState<TodayStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<string>('all');

  const fetchStats = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const endpoint = `/users/${user.id}/today${
        selectedTask !== 'all' ? `?trackerId=${selectedTask}` : ''
      }`;
      const res = await api<TodayStats>(endpoint);
      if (res.success && res.data) {
        setTodayStats(res.data);
      } else {
        // Fallback default calculation if endpoint returns empty
        const totalTarget = tasks.reduce((acc, t) => acc + (t.targetHours || 0) / 5, 0);
        setTodayStats({
          date: new Date().toISOString(),
          hoursWorked: 0,
          targetHours: totalTarget > 0 ? Number(totalTarget.toFixed(1)) : 4,
          progressPercentage: 0,
          isWorkingDay: true,
          remainingHours: totalTarget > 0 ? Number(totalTarget.toFixed(1)) : 4,
          sessionCount: 0,
          status: 'not_started',
        });
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user?.id, selectedTask]);

  const todayDateFormatted = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const progress = Math.min(Math.max(todayStats?.progressPercentage ?? 0, 0), 100);

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="pb-10">
      {/* Tracker Filter Chips */}
      {tasks.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row mb-4"
          contentContainerStyle={{ gap: 8 }}
        >
          <TouchableOpacity
            onPress={() => setSelectedTask('all')}
            activeOpacity={0.7}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: 12,
              backgroundColor:
                selectedTask === 'all'
                  ? '#3b82f6'
                  : 'rgba(31, 41, 55, 0.6)',
              borderWidth: 1,
              borderColor:
                selectedTask === 'all'
                  ? '#60a5fa'
                  : 'rgba(75, 85, 99, 0.4)',
            }}
          >
            <Text
              style={{
                color: selectedTask === 'all' ? '#ffffff' : '#9ca3af',
                fontSize: 12,
                fontWeight: '600',
              }}
            >
              All Trackers
            </Text>
          </TouchableOpacity>

          {tasks.map((task) => {
            const isSelected = selectedTask === task.id;
            return (
              <TouchableOpacity
                key={task.id}
                onPress={() => setSelectedTask(task.id)}
                activeOpacity={0.7}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 12,
                  backgroundColor: isSelected
                    ? '#3b82f6'
                    : 'rgba(31, 41, 55, 0.6)',
                  borderWidth: 1,
                  borderColor: isSelected
                    ? '#60a5fa'
                    : 'rgba(75, 85, 99, 0.4)',
                }}
              >
                <Text
                  style={{
                    color: isSelected ? '#ffffff' : '#9ca3af',
                    fontSize: 12,
                    fontWeight: '600',
                  }}
                  numberOfLines={1}
                >
                  {task.trackerName}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Today's Progress Card */}
      <View
        style={{
          backgroundColor: 'rgba(31, 41, 55, 0.7)',
          borderColor: 'rgba(75, 85, 99, 0.35)',
          borderWidth: 1,
          borderRadius: 20,
          padding: 20,
          marginBottom: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 12,
          elevation: 4,
        }}
      >
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-lg font-bold text-foreground">Today's Progress</Text>
            <Text className="text-xs text-muted-foreground mt-0.5">{todayDateFormatted}</Text>
          </View>
          <View className="w-8 h-8 rounded-lg bg-primary/15 items-center justify-center">
            <Flame size={16} color="#3b82f6" />
          </View>
        </View>

        {loading ? (
          <View className="py-10 items-center justify-center">
            <ActivityIndicator size="small" color="#3b82f6" />
          </View>
        ) : todayStats ? (
          <View>
            {/* Progress Bar Header */}
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-xs font-semibold text-muted-foreground">Daily Goal Completion</Text>
              <Text className="text-sm font-bold text-primary">{Math.round(progress)}%</Text>
            </View>

            {/* Gradient Progress Bar */}
            <View className="w-full h-3.5 bg-secondary rounded-full overflow-hidden mb-6">
              <LinearGradient
                colors={['#3b82f6', '#10b981']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ width: `${Math.max(progress, 3)}%`, height: '100%', borderRadius: 999 }}
              />
            </View>

            {/* 4 Stats Grid */}
            <View className="flex-row flex-wrap gap-2.5">
              {/* Hours Worked */}
              <View
                style={{
                  flex: 1,
                  minWidth: '45%',
                  backgroundColor: 'rgba(55, 65, 81, 0.4)',
                  borderColor: 'rgba(75, 85, 99, 0.3)',
                  borderWidth: 1,
                  borderRadius: 14,
                  padding: 12,
                }}
              >
                <View className="flex-row items-center mb-1">
                  <Clock size={13} color="#3b82f6" />
                  <Text className="text-[11px] text-muted-foreground ml-1.5 font-medium">Worked</Text>
                </View>
                <Text className="text-xl font-bold text-primary">
                  {todayStats.hoursWorked.toFixed(1)}h
                </Text>
              </View>

              {/* Target Hours */}
              <View
                style={{
                  flex: 1,
                  minWidth: '45%',
                  backgroundColor: 'rgba(55, 65, 81, 0.4)',
                  borderColor: 'rgba(75, 85, 99, 0.3)',
                  borderWidth: 1,
                  borderRadius: 14,
                  padding: 12,
                }}
              >
                <View className="flex-row items-center mb-1">
                  <Target size={13} color="#10b981" />
                  <Text className="text-[11px] text-muted-foreground ml-1.5 font-medium">Target</Text>
                </View>
                <Text className="text-xl font-bold text-foreground">
                  {todayStats.targetHours.toFixed(1)}h
                </Text>
              </View>

              {/* Remaining Hours */}
              <View
                style={{
                  flex: 1,
                  minWidth: '45%',
                  backgroundColor: 'rgba(55, 65, 81, 0.4)',
                  borderColor: 'rgba(75, 85, 99, 0.3)',
                  borderWidth: 1,
                  borderRadius: 14,
                  padding: 12,
                }}
              >
                <View className="flex-row items-center mb-1">
                  <Zap size={13} color="#f59e0b" />
                  <Text className="text-[11px] text-muted-foreground ml-1.5 font-medium">Remaining</Text>
                </View>
                <Text className="text-xl font-bold text-warning">
                  {Math.max(0, todayStats.remainingHours).toFixed(1)}h
                </Text>
              </View>

              {/* Session Count */}
              <View
                style={{
                  flex: 1,
                  minWidth: '45%',
                  backgroundColor: 'rgba(55, 65, 81, 0.4)',
                  borderColor: 'rgba(75, 85, 99, 0.3)',
                  borderWidth: 1,
                  borderRadius: 14,
                  padding: 12,
                }}
              >
                <View className="flex-row items-center mb-1">
                  <CheckCircle2 size={13} color="#60a5fa" />
                  <Text className="text-[11px] text-muted-foreground ml-1.5 font-medium">Sessions</Text>
                </View>
                <Text className="text-xl font-bold text-foreground">
                  {todayStats.sessionCount}
                </Text>
              </View>
            </View>
          </View>
        ) : null}
      </View>

      {/* Summary Tracker Targets Card */}
      <View
        style={{
          backgroundColor: 'rgba(31, 41, 55, 0.7)',
          borderColor: 'rgba(75, 85, 99, 0.35)',
          borderWidth: 1,
          borderRadius: 20,
          padding: 20,
        }}
      >
        <Text className="text-base font-bold text-foreground mb-3">Weekly Target Overview</Text>
        {tasks.length === 0 ? (
          <Text className="text-sm text-muted-foreground">No active trackers found.</Text>
        ) : (
          tasks.map((task) => (
            <View
              key={task.id}
              className="flex-row justify-between items-center py-2.5 border-b border-border/20 last:border-b-0"
            >
              <Text className="text-sm font-medium text-foreground flex-1 mr-2" numberOfLines={1}>
                {task.trackerName}
              </Text>
              <View className="flex-row items-center">
                <Text className="text-xs font-semibold text-primary">{task.targetHours}h</Text>
                <Text className="text-[11px] text-muted-foreground ml-1">/ week</Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

export default StatisticsView;
