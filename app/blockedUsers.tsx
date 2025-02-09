import BlockedUser from '@/components/BlockedUser';
import Header from '@/components/TopLevelHeader';
import { useAuth } from '@/providers/AuthProvider';
import { showToast } from '@/utils/helpers';
import SupabaseUserUserInteractionEndpoint from '@/utils/supabase/UserUserInteractionEndpoint ';
import { TProfile } from '@/utils/types';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';

export default function blockedUsers() {
  const [blockedUsers, setBlockedUsers] = useState<TProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const { profile: uncastedProfile } = useAuth();
  const activeProfile = uncastedProfile as TProfile;

  const userUserEndpoint = new SupabaseUserUserInteractionEndpoint();

  const loadBlockedUsers = async () => {
    setLoading(true);
    try {
      const blocked = await userUserEndpoint.getBlockedUsers(activeProfile?.id);
      setBlockedUsers(blocked);
    } catch (error) {
      console.error('Error loading blocked users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnblockUser = async (targetId: string) => {
    try {
      await userUserEndpoint.unblockUser(activeProfile.id, targetId);
      setBlockedUsers((currentlyBlockedUsers) =>
        currentlyBlockedUsers.filter(
          (blockedUser) => blockedUser.id != targetId
        )
      );
    } catch (error) {
      showToast('There was an issue unblocking this user');
      console.error(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadBlockedUsers();
    }, [])
  );

  if (loading) {
    return (
      <View className='flex-1 bg-white items-center justify-center'>
        <ActivityIndicator size={'large'} />
      </View>
    );
  }

  return (
    <View className='flex-1 bg-white'>
      <Header
        title='Manage Blocked Users'
        showBackIcon
        showNotificationIcon={false}
      />
      <View className='px-4 pb-6'>
        <FlatList
          data={blockedUsers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <BlockedUser profile={item} onUnblock={handleUnblockUser} />
          )}
        />
      </View>
    </View>
  );
}
