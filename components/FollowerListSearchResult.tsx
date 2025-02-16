import { Image, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { TProfile } from '@/utils/types';
import { Router } from 'expo-router';

interface IFollowerListSearchResult {
  profile: TProfile;
  router: Router;
  onRemoveFollower: (id: string) => void;
  ownList: boolean;
}

export default function FollowerListSearchResult({
  profile,
  router,
  onRemoveFollower,
  ownList,
}: IFollowerListSearchResult) {
  return (
    <TouchableOpacity
      testID='search-result'
      className='flex-row justify-between items-center'
      onPress={() => router.push(`/user?user_id=${profile.id}`)}
    >
      <View className='flex-row items-center p-2'>
        <Image
          testID='avatar'
          source={
            profile.avatar_url
              ? { uri: profile.avatar_url }
              : require('@/assets/images/default-avatar.jpg')
          }
          style={profilePictureImageStyle}
        />
        <Text testID='username' className='p-2 font-bold'>
          {profile.username}
        </Text>
      </View>
      {ownList ? (
        <TouchableOpacity
          testID='remove-follower-button'
          className={'bg-gray-800 w-[22%] p-2 rounded-lg'}
          onPress={() => onRemoveFollower(profile.id)}
        >
          <Text className='text-white text-center'>Remove</Text>
        </TouchableOpacity>
      ) : (
        <></>
      )}
    </TouchableOpacity>
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
