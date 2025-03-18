import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import React, { useCallback, useState } from 'react';
import Header from '@/components/TopLevelHeader';
import ActivityItem from '@/components/ActivityItem';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { ActivityRecord, TProfile } from '@/utils/types';
import SupabaseUserPostInteractionEndpoint from '@/lib/supabase/UserPostInteractionEndpoint';

export default function Activity() {
  const [activity, setActivity] = useState<ActivityRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const { profile: uncastedProfile } = useAuth();
  const activeProfile = uncastedProfile as TProfile;

  const userPostEndpoint = new SupabaseUserPostInteractionEndpoint();

  const fetchRecentActivity = async () => {
    setLoading(true);
    try {
      const recentActivity = await userPostEndpoint.getRecentActivity(
        activeProfile.id
      );
      setActivity(recentActivity);
    } catch (error) {
      console.error('Error fetching activity:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRecentActivity();
    }, [])
  );

  return (
    <View className='flex-1 bg-white'>
      <Header showBackIcon title='Activity' />
      {loading ? (
        <View className='flex-1 items-center justify-center'>
          <ActivityIndicator size='large' />
        </View>
      ) : activity && activity.length > 0 ? (
        <FlatList
          data={activity}
          renderItem={({ item }) => <ActivityItem item={item} />}
          className='w-full'
          keyExtractor={(item) => item.id}
        />
      ) : (
        <View className='flex-1 items-center justify-center'>
          <Text className='text-xl text-center px-4'>
            Nobody's interacted with your posts yet 😢
          </Text>
        </View>
      )}
    </View>
  );
}
