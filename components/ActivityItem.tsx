import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { formatDistanceToNow } from 'date-fns';
import { ActivityRecord } from '@/utils/types';

interface ActivityItemProps {
  item: ActivityRecord;
}

const ActivityItem = ({ item }: ActivityItemProps) => {
  const router = useRouter();

  let activityText = '';

  if (item.type === 'like') {
    activityText = `${item.user.username} liked your ${item.post.post_type}: "${item.post.title}"`;
  } else if (item.type === 'comment') {
    activityText = `${item.user.username} commented on your ${item.post.post_type}: "${item.post.title}"`;
  } else if (item.type === 'bookmark') {
    activityText = `${item.user.username} bookmarked your ${item.post.post_type}: "${item.post.title}"`;
  }

  return (
    <TouchableOpacity
      className='flex-row p-3 border-b border-gray-200 items-center'
      onPress={() => router.push(`/post?post_id=${item.post.id}`)}
    >
      <TouchableOpacity
        onPress={() => router.push(`/user?user_id=${item.user.id}`)}
      >
        <Image
          source={
            item.user.avatar_url
              ? { uri: item.user.avatar_url }
              : require('@/assets/images/default-avatar.jpg')
          }
          className='w-10 h-10 rounded-full mr-3'
        />
      </TouchableOpacity>
      <View className='flex-1'>
        <Text className='text-base'>{activityText}</Text>
        {item.type === 'comment' && (
          <Text className='text-gray-500 mt-1' numberOfLines={1}>
            "{item.body}"
          </Text>
        )}
        <Text className='text-gray-400 text-xs mt-1'>
          {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default ActivityItem;
