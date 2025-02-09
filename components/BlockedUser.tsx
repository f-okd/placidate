import { View, Text, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { TProfile } from '@/utils/types';

interface IBlockedUser {
  profile: TProfile;
  onUnblock: (targetId: string) => Promise<void>;
}

export default function BlockedUser({ profile, onUnblock }: IBlockedUser) {
  return (
    <View className='flex-row items-center justify-between py-4 px-2 border-b border-gray-200'>
      <View className='flex-row items-center flex-1'>
        <Image
          source={
            profile.avatar_url
              ? { uri: profile.avatar_url }
              : require('@/assets/images/default-avatar.jpg')
          }
          className='w-12 h-12 rounded-full'
        />
        <View className='ml-3'>
          <Text className='font-semibold text-lg'>{profile.username}</Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => onUnblock(profile.id)}
        className='ml-4 p-2'
      >
        <Ionicons name='close-circle-outline' size={24} color='black' />
      </TouchableOpacity>
    </View>
  );
}
