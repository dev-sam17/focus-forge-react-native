import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { TimeTracker } from './TimeTracker';
import { Plus, Clock } from 'lucide-react-native';
import { AddTaskDialog } from './AddTaskDialog';

export function TimeTrackingDashboard() {
  const [activeTab, setActiveTab] = useState<'trackers' | 'archived' | 'stats'>('trackers');
  const [addTaskVisible, setAddTaskVisible] = useState(false);

  // Mock trackers for initial UI scaffolding
  const mockTrackers = [
    { id: '1', trackerName: 'Deep Work', targetHours: 20, archived: 0, workDays: '1,2,3,4,5', description: 'Core work tasks', createdAt: new Date(), updatedAt: new Date() },
    { id: '2', trackerName: 'Learning', targetHours: 5, archived: 0, workDays: '6,0', description: 'Study React Native', createdAt: new Date(), updatedAt: new Date() }
  ];

  return (
    <View className="flex-1 w-full">
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <View className="bg-primary/20 p-2 rounded-lg mr-3">
             <Clock size={24} className="text-primary" />
          </View>
          <Text className="text-2xl font-bold text-foreground">Focus Forge</Text>
        </View>
        <TouchableOpacity 
          onPress={() => setAddTaskVisible(true)} 
          className="bg-primary p-2 rounded-full shadow-sm"
        >
          <Plus size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View className="flex-row mb-6 border-b border-border bg-card rounded-lg overflow-hidden">
        <TouchableOpacity 
          onPress={() => setActiveTab('trackers')}
          className={`flex-1 p-3 items-center border-b-2 ${activeTab === 'trackers' ? 'border-primary bg-primary/5' : 'border-transparent'}`}
        >
          <Text className={activeTab === 'trackers' ? 'text-primary font-medium' : 'text-muted-foreground'}>Active</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setActiveTab('archived')}
          className={`flex-1 p-3 items-center border-b-2 ${activeTab === 'archived' ? 'border-primary bg-primary/5' : 'border-transparent'}`}
        >
          <Text className={activeTab === 'archived' ? 'text-primary font-medium' : 'text-muted-foreground'}>Archived</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setActiveTab('stats')}
          className={`flex-1 p-3 items-center border-b-2 ${activeTab === 'stats' ? 'border-primary bg-primary/5' : 'border-transparent'}`}
        >
          <Text className={activeTab === 'stats' ? 'text-primary font-medium' : 'text-muted-foreground'}>Stats</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {activeTab === 'trackers' && (
           <View className="space-y-4 pb-10">
             {mockTrackers.map(t => (
                <View key={t.id} className="mb-4">
                  <TimeTracker tracker={t} />
                </View>
             ))}
           </View>
        )}
        {activeTab === 'archived' && (
           <View className="items-center py-10 bg-card rounded-xl border border-border">
             <Text className="text-muted-foreground">No archived trackers</Text>
           </View>
        )}
        {activeTab === 'stats' && (
           <View className="items-center py-10 bg-card rounded-xl border border-border">
             <Text className="text-muted-foreground">Statistics coming soon</Text>
           </View>
        )}
      </ScrollView>

      {addTaskVisible && (
        <AddTaskDialog onClose={() => setAddTaskVisible(false)} />
      )}
    </View>
  );
}
