import { View, Text } from 'react-native';
import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';

interface IActionBar {
  liked: boolean;
  saved: boolean;
  onLike: () => Promise<void>;
  onUnlike: () => Promise<void>;
}

export default function ActionBar({
  saved,
  liked,
  onLike,
  onUnlike,
}: IActionBar) {
  return (
    <View className='flex-row pr-3 gap-2'>
      <Ionicons
        name={liked ? 'heart' : 'heart-outline'}
        size={24}
        color='black'
        onPress={() => (liked ? onUnlike() : onLike())}
      />
      <Ionicons
        name={saved ? 'bookmark' : 'bookmark-outline'}
        size={24}
        color='black'
      />
      <Ionicons name='ellipsis-horizontal' size={24} color='black' />
    </View>
  );
}
