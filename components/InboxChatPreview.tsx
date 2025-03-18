import { View, Image, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { TProfile } from '@/utils/types';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface InboxChatPreviewProps {
  user: TProfile;
}

export default function InboxChatPreview({ user }: InboxChatPreviewProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.push(`/chat?user_id=${user.id}`)}
      className='flex-row gap-2 items-center w-full m-1'
    >
      <View className='flex-row justify-between w-full items-center pr-5'>
        <View className='flex-row gap-2'>
          <Image
            source={
              user.avatar_url
                ? { uri: user.avatar_url }
                : require('@/assets/images/default-avatar.jpg')
            }
            className='w-12 h-12 rounded-full mr-3'
          />
          <View>
            <Text className='font-bold '>{user.username}</Text>
            <Text>Say hi 👋</Text>
          </View>
        </View>
        <Ionicons name='arrow-forward-circle' size={20} />
      </View>
    </TouchableOpacity>
  );
}
