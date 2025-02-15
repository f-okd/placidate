import { useAuth } from '@/providers/AuthProvider';
import SupabaseUserUserInteractionEndpoint from '@/lib/supabase/UserUserInteractionEndpoint';
import { TProfile } from '@/utils/types';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

interface IProfileHeader {
  profile: TProfile;
  currentlyLoggedInUser?: boolean;
  postCount: number;
  isFollowing: boolean;
  followerCount: number;
  followingCount: number;
  onFollow: React.Dispatch<React.SetStateAction<boolean>>;
  handleSetFollowerCount: React.Dispatch<React.SetStateAction<number>>;
}

export default function ProfileHeader({
  profile,
  postCount,
  isFollowing,
  followerCount,
  followingCount,
  onFollow,
  handleSetFollowerCount,
}: IProfileHeader) {
  const router = useRouter();
  const { profile: activeProfile } = useAuth();

  const userUserEndpoint = new SupabaseUserUserInteractionEndpoint();

  const handleFollow = async () => {
    if (!activeProfile) return;
    try {
      await userUserEndpoint.followUser(activeProfile.id, profile.id);
      onFollow(true);
      handleSetFollowerCount((prev) => prev + 1);
    } catch (error) {
      console.error(`Error following user ${profile.id}:`, error);
    }
  };

  const handleUnfollow = async () => {
    if (!activeProfile) return;
    try {
      const userUserEndpoint = new SupabaseUserUserInteractionEndpoint();
      await userUserEndpoint.unfollowUser(activeProfile.id, profile.id);
      onFollow(false);
      handleSetFollowerCount((prev) => prev - 1);
    } catch (error) {
      console.error(`Error unfollowing user ${profile.id}:`, error);
    }
  };

  const imageToDisplay = profile.avatar_url
    ? { uri: profile.avatar_url }
    : require('@/assets/images/default-avatar.jpg');

  return (
    <View className='border-b pb-5 border-gray-200 px-10'>
      <View className='flex-row items-center justify-between'>
        <Image source={imageToDisplay} style={profilePictureImageStyle} />
        <View>
          <Text className='font-bold text-xl'>{followerCount}</Text>
          <Text>Followers</Text>
        </View>
        <View>
          <Text className='font-bold text-xl'>{followingCount}</Text>
          <Text>Following</Text>
        </View>
        <View>
          <Text className='font-bold text-xl'>{postCount}</Text>
          <Text>Posts</Text>
        </View>
      </View>

      <View className='pt-2'>
        <View className='flex-row gap-2'>
          <TouchableOpacity
            className={'bg-gray-800 w-[22%] p-2 rounded-lg'}
            onPress={isFollowing ? handleUnfollow : handleFollow}
          >
            <Text className='text-white text-center'>
              {isFollowing ? 'Unfollow' : 'Follow'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className='bg-gray-800 w-[22%] p-2 rounded-lg'
            onPress={() => router.push('/inbox')}
          >
            <Text className='text-white text-center'>Message</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const profilePictureImageStyle = {
  width: 70,
  height: 70,
  borderRadius: 35,
  borderWidth: 2,
  borderColor: 'black',
};
