import { useAuth } from '@/providers/AuthProvider';
import SupabaseUserUserInteractionEndpoint from '@/lib/supabase/UserUserInteractionEndpoint';
import { Router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface IUserSearchResult {
  id: string;
  username: string;
  avatarUrl: string | null;
  router: Router;
}

export default function UserSearchResult({
  id,
  username,
  avatarUrl,
  router,
}: IUserSearchResult) {
  const { profile: currentlyLoggedInUser } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  const userUserEndpoint = new SupabaseUserUserInteractionEndpoint();

  useEffect(() => {
    const checkFollowStatus = async () => {
      setLoading(true);
      if (currentlyLoggedInUser && id !== currentlyLoggedInUser.id) {
        const followStatus = await userUserEndpoint.userIsFollowing(
          currentlyLoggedInUser.id,
          id
        );
        setIsFollowing(followStatus);
      }
      setLoading(false);
    };

    checkFollowStatus();
  }, [currentlyLoggedInUser, id]);

  const navigateToProfile = (): void => {
    if (currentlyLoggedInUser?.id == id) {
      return router.push('/(tabs)/profile');
    } else {
      return router.push(`/user?user_id=${id}`);
    }
  };

  const handleFollow = async () => {
    if (!currentlyLoggedInUser || currentlyLoggedInUser.id === id) return;

    setLoading(true);
    try {
      if (isFollowing) {
        await userUserEndpoint.unfollowUser(currentlyLoggedInUser.id, id);
        setIsFollowing(false);
      } else {
        await userUserEndpoint.followUser(currentlyLoggedInUser.id, id);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error toggling follow status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ActivityIndicator size={'small'} />;

  return (
    <View className='flex-row items-center justify-between p-2'>
      <TouchableOpacity
        testID='search-result'
        className='flex-row items-center'
        onPress={() => navigateToProfile()}
      >
        <Image
          testID='avatar'
          source={
            avatarUrl
              ? { uri: avatarUrl }
              : require('@/assets/images/default-avatar.jpg')
          }
          style={profilePictureImageStyle}
        />
        <Text testID='username' className='p-2 font-bold'>
          {username}
        </Text>
      </TouchableOpacity>

      {currentlyLoggedInUser?.id !== id && loading == false && (
        <TouchableOpacity
          className={`px-4 py-2 rounded-full ${
            isFollowing ? 'bg-gray-300' : 'bg-purple-200'
          }`}
          onPress={handleFollow}
          disabled={loading}
          testID='follow-button'
        >
          <Text className='text-center font-semibold'>
            {isFollowing ? 'Unfollow' : 'Follow'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const profilePictureImageStyle = {
  width: 40,
  height: 40,
  borderRadius: 20,
  borderWidth: 2,
  borderColor: 'black',
  margin: 4,
};
