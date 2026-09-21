import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { TimeTracker } from './TimeTracker';
import { ArchivedTracker } from './ArchivedTracker';
import { StatisticsView } from './StatisticsView';
import { AddTaskDialog } from './AddTaskDialog';
import { EditTrackerDialog } from './EditTrackerDialog';
import { Plus, Archive, BarChart3, TrendingUp, RefreshCw } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { Tracker, ActiveSession, NewTracker } from '../lib/types';
import useApiClient from '../hooks/useApiClient';
import { useAuth } from '../contexts/AuthContext';

export function TimeTrackingDashboard() {
  const { user } = useAuth();
  const api = useApiClient(user?.id);

  const [activeTab, setActiveTab] = useState<'trackers' | 'stats' | 'archives'>('trackers');
  const [tasks, setTasks] = useState<Tracker[]>([]);
  const [activeSessions, setActiveSessions] = useState<Record<string, ActiveSession>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [addTaskVisible, setAddTaskVisible] = useState(false);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [trackerToEdit, setTrackerToEdit] = useState<Tracker | null>(null);

  // Fetch all trackers from API
  const fetchTasks = useCallback(async () => {
    const res = await api<Tracker[]>('/trackers');
    if (res.success && res.data) {
      setTasks(res.data);
    }
  }, [api]);

  // Fetch active sessions from API
  const fetchActiveSessions = useCallback(async () => {
    if (!user?.id) return;
    const res = await api<ActiveSession[]>(`/sessions/${user.id}/active`);
    if (res.success && res.data) {
      const sessionMap = res.data.reduce((acc, session) => {
        acc[session.trackerId] = session;
        return acc;
      }, {} as Record<string, ActiveSession>);
      setActiveSessions(sessionMap);
    }
  }, [api, user?.id]);

  const loadData = useCallback(async () => {
    await Promise.all([fetchTasks(), fetchActiveSessions()]);
    setLoading(false);
  }, [fetchTasks, fetchActiveSessions]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchTasks(), fetchActiveSessions()]);
    setRefreshing(false);
  };

  // Actions
  const handleAddTask = async (newTask: NewTracker & { workDays: string }) => {
    const res = await api<Tracker>('/trackers', 'POST', {
      ...newTask,
      userId: user?.id,
    });
    if (res.success) {
      await fetchTasks();
      return true;
    }
    return res.error || 'Failed to create tracker';
  };

  const handleArchiveTask = async (taskId: string) => {
    const res = await api(`/trackers/${taskId}/archive`, 'POST');
    if (res.success) {
      await Promise.all([fetchTasks(), fetchActiveSessions()]);
    }
  };

  const handleUnarchiveTask = async (taskId: string) => {
    const res = await api(`/trackers/${taskId}/unarchive`, 'POST');
    if (res.success) {
      await Promise.all([fetchTasks(), fetchActiveSessions()]);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const res = await api(`/trackers/${taskId}`, 'DELETE');
    if (res.success) {
      await Promise.all([fetchTasks(), fetchActiveSessions()]);
    }
  };

  const handleSessionStart = async (taskId: string) => {
    const res = await api(`/trackers/${taskId}/start`, 'POST');
    if (res.success) {
      await Promise.all([fetchActiveSessions(), fetchTasks()]);
    }
  };

  const handleSessionEnd = async (taskId: string) => {
    const res = await api(`/trackers/${taskId}/stop`, 'POST');
    if (res.success) {
      await Promise.all([fetchActiveSessions(), fetchTasks()]);
    }
  };

  const handleEditTracker = (taskId: string) => {
    const tracker = tasks.find((t) => t.id === taskId);
    if (tracker) {
      setTrackerToEdit(tracker);
      setEditDialogVisible(true);
    }
  };

  const activeTasks = tasks.filter((task) => !task.archived);
  const archivedTasks = tasks.filter((task) => task.archived);

  return (
    <View className="flex-1 w-full">
      {/* Tab Bar & Action Controls matching Electron */}
      <View className="flex-row items-center justify-between mb-4">
        {/* Floating Capsule Tabs */}
        <View
          style={{
            backgroundColor: 'rgba(31, 41, 55, 0.65)',
            borderColor: 'rgba(75, 85, 99, 0.35)',
            borderWidth: 1,
            borderRadius: 16,
            padding: 4,
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
            marginRight: 8,
          }}
        >
          {/* Active Trackers Tab */}
          <TouchableOpacity
            onPress={() => setActiveTab('trackers')}
            activeOpacity={0.8}
            style={{
              flex: 1,
              borderRadius: 12,
              overflow: 'hidden',
            }}
          >
            {activeTab === 'trackers' ? (
              <LinearGradient
                colors={['#3b82f6', '#10b981']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 6,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                }}
              >
                <BarChart3 size={14} color="white" />
                <Text className="text-white font-bold text-xs ml-1.5" numberOfLines={1}>
                  Active
                </Text>
              </LinearGradient>
            ) : (
              <View
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 6,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                }}
              >
                <BarChart3 size={14} color="#9ca3af" />
                <Text className="text-muted-foreground font-medium text-xs ml-1.5" numberOfLines={1}>
                  Active
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Statistics Tab */}
          <TouchableOpacity
            onPress={() => setActiveTab('stats')}
            activeOpacity={0.8}
            style={{
              flex: 1,
              borderRadius: 12,
              overflow: 'hidden',
            }}
          >
            {activeTab === 'stats' ? (
              <LinearGradient
                colors={['#3b82f6', '#10b981']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 6,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                }}
              >
                <TrendingUp size={14} color="white" />
                <Text className="text-white font-bold text-xs ml-1.5" numberOfLines={1}>
                  Stats
                </Text>
              </LinearGradient>
            ) : (
              <View
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 6,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                }}
              >
                <TrendingUp size={14} color="#9ca3af" />
                <Text className="text-muted-foreground font-medium text-xs ml-1.5" numberOfLines={1}>
                  Stats
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Archives Tab */}
          <TouchableOpacity
            onPress={() => setActiveTab('archives')}
            activeOpacity={0.8}
            style={{
              flex: 1,
              borderRadius: 12,
              overflow: 'hidden',
            }}
          >
            {activeTab === 'archives' ? (
              <LinearGradient
                colors={['#3b82f6', '#10b981']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 6,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                }}
              >
                <Archive size={14} color="white" />
                <Text className="text-white font-bold text-xs ml-1.5" numberOfLines={1}>
                  Archives
                </Text>
              </LinearGradient>
            ) : (
              <View
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 6,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                }}
              >
                <Archive size={14} color="#9ca3af" />
                <Text className="text-muted-foreground font-medium text-xs ml-1.5" numberOfLines={1}>
                  Archives
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Action Controls: Refresh & Add Task */}
        <View className="flex-row items-center gap-2">
          {/* Refresh Button */}
          <TouchableOpacity
            onPress={onRefresh}
            activeOpacity={0.8}
            style={{
              width: 38,
              height: 38,
              backgroundColor: 'rgba(31, 41, 55, 0.65)',
              borderColor: 'rgba(75, 85, 99, 0.35)',
              borderWidth: 1,
              borderRadius: 14,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <RefreshCw size={16} color="#9ca3af" />
          </TouchableOpacity>

          {/* Add Tracker Button */}
          <TouchableOpacity
            onPress={() => setAddTaskVisible(true)}
            activeOpacity={0.85}
            style={{
              width: 38,
              height: 38,
              borderRadius: 14,
              overflow: 'hidden',
              shadowColor: '#3b82f6',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.3,
              shadowRadius: 6,
              elevation: 4,
            }}
          >
            <LinearGradient
              colors={['#3b82f6', '#10b981']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: '100%',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Plus size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Tab Content */}
      {loading ? (
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="text-sm text-muted-foreground mt-3">Loading trackers...</Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#3b82f6"
              colors={['#3b82f6', '#10b981']}
            />
          }
        >
          {/* Active Trackers Tab Content */}
          {activeTab === 'trackers' && (
            <View className="pb-16">
              {activeTasks.length === 0 ? (
                <View
                  style={{
                    backgroundColor: 'rgba(31, 41, 55, 0.65)',
                    borderColor: 'rgba(75, 85, 99, 0.35)',
                    borderWidth: 1,
                    borderRadius: 24,
                    padding: 32,
                    alignItems: 'center',
                    marginTop: 20,
                  }}
                >
                  <LinearGradient
                    colors={['#3b82f6', '#10b981']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 18,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 16,
                    }}
                  >
                    <Plus size={28} color="white" />
                  </LinearGradient>
                  <Text className="text-lg font-bold text-foreground mb-1">
                    No Active Trackers
                  </Text>
                  <Text className="text-xs text-muted-foreground text-center mb-6 px-4">
                    Create your first time tracker to forge your focus and boost productivity!
                  </Text>
                  <TouchableOpacity
                    onPress={() => setAddTaskVisible(true)}
                    activeOpacity={0.85}
                    style={{
                      borderRadius: 14,
                      overflow: 'hidden',
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
                      <Plus size={16} color="white" style={{ marginRight: 6 }} />
                      <Text className="text-white font-semibold text-sm">Create Tracker</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              ) : (
                activeTasks.map((task) => (
                  <TimeTracker
                    key={task.id}
                    task={task}
                    session={activeSessions[task.id]}
                    onStart={handleSessionStart}
                    onStop={handleSessionEnd}
                    onArchive={handleArchiveTask}
                    onEdit={handleEditTracker}
                  />
                ))
              )}
            </View>
          )}

          {/* Statistics Tab Content */}
          {activeTab === 'stats' && (
            <StatisticsView tasks={activeTasks} />
          )}

          {/* Archives Tab Content */}
          {activeTab === 'archives' && (
            <View className="pb-16">
              {archivedTasks.length === 0 ? (
                <View
                  style={{
                    backgroundColor: 'rgba(31, 41, 55, 0.65)',
                    borderColor: 'rgba(75, 85, 99, 0.35)',
                    borderWidth: 1,
                    borderRadius: 24,
                    padding: 32,
                    alignItems: 'center',
                    marginTop: 20,
                  }}
                >
                  <View
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 18,
                      backgroundColor: 'rgba(55, 65, 81, 0.6)',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 16,
                    }}
                  >
                    <Archive size={26} color="#9ca3af" />
                  </View>
                  <Text className="text-lg font-bold text-muted-foreground mb-1">
                    No Archived Trackers
                  </Text>
                  <Text className="text-xs text-muted-foreground/70 text-center px-4">
                    Archived trackers will appear here when you archive them from your active list.
                  </Text>
                </View>
              ) : (
                archivedTasks.map((task) => (
                  <ArchivedTracker
                    key={task.id}
                    task={task}
                    onDelete={handleDeleteTask}
                    onUnarchive={handleUnarchiveTask}
                  />
                ))
              )}
            </View>
          )}
        </ScrollView>
      )}

      {/* Dialog Modals */}
      <AddTaskDialog
        visible={addTaskVisible}
        onClose={() => setAddTaskVisible(false)}
        onAddTask={handleAddTask}
      />

      <EditTrackerDialog
        visible={editDialogVisible}
        onClose={() => {
          setEditDialogVisible(false);
          setTrackerToEdit(null);
        }}
        tracker={trackerToEdit}
        onSuccess={fetchTasks}
      />
    </View>
  );
}

export default TimeTrackingDashboard;

