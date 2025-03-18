import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/providers/AuthProvider';
import SupabaseUserUserInteractionEndpoint from '@/lib/supabase/UserUserInteractionEndpoint';
import { RecentFollowerRecord, TProfile } from '@/utils/types';

interface FollowerItemProps {
  follower: RecentFollowerRecord;
}

const FollowerItem = ({ follower }: FollowerItemProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const { profile: uncastedProfile } = useAuth();
  const activeProfile = uncastedProfile as TProfile;

  const userUserEndpoint = new SupabaseUserUserInteractionEndpoint();

  useEffect(() => {
    const checkFollowStatus = async () => {
      setLoading(true);
      const status = await userUserEndpoint.userIsFollowing(
        activeProfile.id,
        follower.id
      );
      setIsFollowing(status);
      setLoading(false);
    };

    checkFollowStatus();
  }, [follower.id]);

  const handleFollow = async () => {
    await userUserEndpoint.followUser(activeProfile.id, follower.id);
    setIsFollowing(true);
  };

  const handleUnfollow = async () => {
    await userUserEndpoint.unfollowUser(activeProfile.id, follower.id);
    setIsFollowing(false);
  };

  return (
    <TouchableOpacity
      className='flex-row p-4 border-b border-gray-200 items-center'
      onPress={() => router.push(`/user?user_id=${follower.id}`)}
    >
      <Image
        source={
          follower.avatar_url
            ? { uri: follower.avatar_url }
            : require('@/assets/images/default-avatar.jpg')
        }
        className='w-12 h-12 rounded-full mr-3'
      />
      <View className='flex-1'>
        <Text className='font-bold text-base'>{follower.username}</Text>
        {follower.bio && (
          <Text className='text-gray-500 mt-1' numberOfLines={1}>
            {follower.bio}
          </Text>
        )}
        <Text className='text-gray-400 text-xs mt-1'>
          Followed{' '}
          {formatDistanceToNow(new Date(follower.created_at), {
            addSuffix: true,
          })}
        </Text>
      </View>
      {loading ? (
        <ActivityIndicator size='small' color='black' />
      ) : (
        follower.id !== activeProfile.id && (
          <TouchableOpacity
            className={`px-4 py-2 rounded-lg ${
              isFollowing ? 'bg-gray-200' : 'bg-purple-300'
            }`}
            onPress={isFollowing ? handleUnfollow : handleFollow}
          >
            <Text className='text-white font-bold'>
              {isFollowing ? 'Following' : 'Follow'}
            </Text>
          </TouchableOpacity>
        )
      )}
    </TouchableOpacity>
  );
};

export default FollowerItem;
