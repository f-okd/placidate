import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

interface IProfileHeader {
  postCount: number;
  followerCount: number;
  followingCount: number;
  avatar: string | null;
  id: string;
}

export default function OwnProfileHeader({
  postCount,
  followerCount,
  followingCount,
  avatar,
  id,
}: IProfileHeader) {
  const router = useRouter();

  const imageToDisplay = avatar
    ? { uri: avatar }
    : require('@/assets/images/default-avatar.jpg');

  return (
    <View className='border-b pb-5 border-gray-200 px-10'>
      {/*Section for profile picture and post, follower, following counts */}
      <View className='flex-row items-center justify-between  '>
        <Image source={imageToDisplay} style={profilePictureImageStyle} />
        <TouchableOpacity
          testID='followers-section'
          onPress={() => router.push(`/followers?user_id=${id}`)}
        >
          <Text testID='follower-count' className='font-bold text-xl'>
            {followerCount}
          </Text>
          <Text testID='followers-label'>Followers</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID='following-section'
          onPress={() => router.push(`/following?user_id=${id}`)}
        >
          <Text testID='following-count' className='font-bold text-xl'>
            {followingCount}
          </Text>
          <Text testID='following-label'>Following</Text>
        </TouchableOpacity>
        <View>
          <Text className='font-bold text-xl'>{postCount}</Text>
          <Text>Posts</Text>
        </View>
      </View>

      {/*Section for follow/unfollow or edit profile button*/}
      <View className='pt-2 gap-2 flex-row'>
        <TouchableOpacity
          testID='edit-profile-button'
          className='bg-gray-800 w-[24%] p-2 rounded-lg'
          onPress={() => router.push('/editProfile')}
        >
          <Text className='text-white'>Edit profile</Text>
        </TouchableOpacity>
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
