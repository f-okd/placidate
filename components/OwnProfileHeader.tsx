import { TProfile } from '@/utils/posts';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

interface IProfileHeader {
  postCount: number;
  followerCount: number;
  followingCount: number;
}

export default function OwnProfileHeader({
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
      <View className='pt-2 gap-2 flex-row'>
        <TouchableOpacity
          className='bg-gray-800 w-[24%] p-2 rounded-lg'
          onPress={() => router.push('/editProfile')}
        >
          <Text className='text-white'>Edit profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className='bg-gray-800 w-[30%] p-2 rounded-lg'
          onPress={() => router.push('/bookmarks')}
        >
          <Text className='text-white'>Bookmarks</Text>
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
