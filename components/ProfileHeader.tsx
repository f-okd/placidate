import { View, Text, Image, Button, TouchableOpacity } from 'react-native';
import React from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { TProfile } from '@/utils/posts';
import { useRouter } from 'expo-router';

interface IProfileHeader {
  profile: TProfile;
  currentlyLoggedInUser?: boolean;
  postCount: number;
  followerCount: number;
  followingCount: number;
}

export default function ProfileHeader({
  profile,
  currentlyLoggedInUser = false,
  postCount,
  followerCount,
  followingCount,
}: IProfileHeader) {
  const router = useRouter();

  return (
    <View className='border-b pb-5 border-gray-200 px-10'>
      {/*Section for profile picture and post, follower, following counts */}
      <View className='flex-row items-center justify-between  '>
        <Image
          src={'https://picsum.photos/200'}
          style={profilePictureImageStyle}
        />
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

      {/*Section for follow/unfollow or edit profile button*/}
      <View className='pt-2'>
        {currentlyLoggedInUser ? (
          <TouchableOpacity
            className='bg-gray-800 w-[24%] p-2 rounded-lg'
            onPress={() => router.push('/editProfile')}
          >
            <Text className='text-white'>Edit profile</Text>
          </TouchableOpacity>
        ) : (
          <View className='flex-row gap-2'>
            <TouchableOpacity
              className='bg-gray-800 w-[20%] p-2 rounded-lg'
              onPress={() => router.push('/editProfile')}
            >
              <Text className='text-white'>Follow</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className='bg-gray-800 w-[22%] p-2 rounded-lg'
              onPress={() => router.push('/editProfile')}
            >
              <Text className='text-white'>Message</Text>
            </TouchableOpacity>
          </View>
        )}
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
