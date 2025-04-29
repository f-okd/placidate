import { getTimeAgo } from '@/utils/helpers';
import { TProfile } from '@/utils/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

interface InboxChatPreviewProps {
  user: TProfile;
  lastMessage: {
    body: string;
    created_at: string;
    is_post_share: boolean;
    sender_id: string;
  } | null;
}

export default function InboxChatPreview({
  user,
  lastMessage,
}: InboxChatPreviewProps) {
  const router = useRouter();

  const getMessagePreview = () => {
    if (!lastMessage) return 'Say hi 👋';
    if (lastMessage.is_post_share) {
      if (lastMessage.sender_id != user.id) {
        return 'You shared a post';
      } else {
        return 'Shared a post';
      }
    }

    return lastMessage.body.length > 25
      ? lastMessage.body.substring(0, 25) + '...'
      : lastMessage.body;
  };

  return (
    <TouchableOpacity
      testID='chat-preview-component'
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
            testID='avatar'
          />
          <View>
            <Text className='font-bold' testID='username'>
              {user.username}
            </Text>
            <View className='flex-row items-center'>
              <Text testID='message-preview' className='text-gray-600'>
                {getMessagePreview()}
              </Text>
              {lastMessage && (
                <Text className='text-gray-400 text-xs ml-1'>
                  · {getTimeAgo(lastMessage.created_at)}
                </Text>
              )}
            </View>
          </View>
        </View>
        <Ionicons
          testID='forward-button'
          name='arrow-forward-circle'
          size={20}
        />
      </View>
    </TouchableOpacity>
  );
}
