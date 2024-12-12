import { View, Text } from 'react-native';
import React from 'react';

interface ITag {
  tagName: string;
}
export default function Tag({ tagName }: ITag) {
  return (
    <View className='bg-gray-200 rounded-md px-1 py-[0.5]'>
      <Text>{tagName}</Text>
    </View>
  );
}
