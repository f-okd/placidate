import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import React, { useCallback, useState } from 'react';
import Header from '@/components/TopLevelHeader';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { RecentFollowerRecord, TProfile } from '@/utils/types';
import SupabaseUserEndpoint from '@/lib/supabase/UserEndpoint';
import FollowerItem from '@/components/FollowerItem';

export default function RecentFollowers() {
  const [followers, setFollowers] = useState<RecentFollowerRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const { profile: uncastedProfile } = useAuth();
  const activeProfile = uncastedProfile as TProfile;

  const userEndpoint = new SupabaseUserEndpoint();

  const fetchRecentFollowers = async () => {
    setLoading(true);
    try {
      const recentFollowers = await userEndpoint.getRecentFollowers(
        activeProfile.id
      );
      setFollowers(recentFollowers);
    } catch (error) {
      console.error('Error fetching recent followers:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRecentFollowers();
    }, [])
  );

  return (
    <View className='flex-1 bg-white'>
      <Header showBackIcon title='Recent Followers' />
      {loading ? (
        <View className='flex-1 items-center justify-center'>
          <ActivityIndicator size='large' />
        </View>
      ) : followers && followers.length > 0 ? (
        <FlatList
          data={followers}
          renderItem={({ item }) => <FollowerItem follower={item} />}
          className='w-full'
          keyExtractor={(item) => item.id}
        />
      ) : (
        <View className='flex-1 items-center justify-center'>
          <Text className='text-xl text-center px-4'>
            No one has followed you yet 😢
          </Text>
        </View>
      )}
    </View>
  );
}
