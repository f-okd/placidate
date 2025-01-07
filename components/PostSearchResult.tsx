import { View, Text } from 'react-native';
import React from 'react';
import { TPost } from '@/utils/posts';

interface IPostSearchResult {
  Profile: TPost;
}

export default function PostSearchResult({ Profile }: IPostSearchResult) {
  return (
    <View className='flex-row'>
      <Text>PostSearchResult</Text>
    </View>
  );
}
