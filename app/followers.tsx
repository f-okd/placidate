import FollowerListSearchResult from '@/components/FollowerListSearchResult';
import Header from '@/components/TopLevelHeader';
import SupabaseUserEndpoint from '@/lib/supabase/UserEndpoint';
import SupabaseUserUserInteractionEndpoint from '@/lib/supabase/UserUserInteractionEndpoint';
import { useAuth } from '@/providers/AuthProvider';
import { TProfile } from '@/utils/types';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';

export default function Followers() {
  const params = useLocalSearchParams();
  const user_id = params.user_id as string;
  const username = params.username as string;

  const { profile: uncastedProfile } = useAuth();
  const activeProfile = uncastedProfile as TProfile;
  const router = useRouter();

  const [followers, setFollowers] = useState<TProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const userEndpoint = new SupabaseUserEndpoint();
  const userUserEndpoint = new SupabaseUserUserInteractionEndpoint();

  const loadFollowers = async () => {
    const followers = await userEndpoint.getFollowers(user_id);
    if (followers) setFollowers(followers);
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadFollowers();
      setLoading(false);
    }, [])
  );

  const handleRemoveFollower = async (id: string) => {
    await userUserEndpoint.removeFollower(activeProfile.id, id);
    const followersWithoutRemovedFollower = followers.filter(
      (item) => item.id != id
    );

    setFollowers(followersWithoutRemovedFollower);
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
            ? `Your followers`
            : `${username}'s followers`
        }
      />
      <FlatList
        data={followers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FollowerListSearchResult
            profile={item}
            router={router}
            onRemoveFollower={handleRemoveFollower}
            ownList={user_id == activeProfile.id}
          />
        )}
      />
    </View>
  );
}
