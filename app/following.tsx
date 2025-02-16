import FollowingListSearchResult from '@/components/FollowingListSearchResult';
import Header from '@/components/TopLevelHeader';
import SupabaseUserEndpoint from '@/lib/supabase/UserEndpoint';
import SupabaseUserUserInteractionEndpoint from '@/lib/supabase/UserUserInteractionEndpoint';
import { useAuth } from '@/providers/AuthProvider';
import { TProfile } from '@/utils/types';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';

export default function Following() {
  const params = useLocalSearchParams();
  const user_id = params.user_id as string;
  const username = params.username as string;

  const { profile: uncastedProfile } = useAuth();
  const activeProfile = uncastedProfile as TProfile;
  const router = useRouter();

  const [following, setFollowing] = useState<TProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const userEndpoint = new SupabaseUserEndpoint();
  const userUserEndpoint = new SupabaseUserUserInteractionEndpoint();

  const loadFollowing = async () => {
    const following = await userEndpoint.getFollowing(user_id);
    if (following) setFollowing(following);
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadFollowing();
      setLoading(false);
    }, [])
  );

  const handleUnfollow = async (id: string) => {
    await userUserEndpoint.unfollowUser(activeProfile.id, id);
    const followingListWithoutUnfollowedUser = following.filter(
      (item) => item.id != id
    );

    setFollowing(followingListWithoutUnfollowedUser);
  };

  if (loading) {
    return (
      <View className='flex-1 bg-white items-center justify-center'>
        <ActivityIndicator size={'large'} />
      </View>
    );
  }

  return (
    <View className='flex-1 p-2 bg-white'>
      <Header
        showBackIcon
        title={
          user_id == activeProfile.id
            ? `Your following`
            : `${username}'s following`
        }
      />
      <FlatList
        data={following}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FollowingListSearchResult
            profile={item}
            router={router}
            onUnfollow={handleUnfollow}
            ownList={user_id == activeProfile.id}
          />
        )}
      />
    </View>
  );
}
