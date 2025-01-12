import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';

interface ITag {
  tagName: string;
  isForNewPost: boolean | undefined;
  onRemoveTag: (() => void) | ((tag: string) => void);
}
export default function Tag({
  tagName,
  isForNewPost = false,
  onRemoveTag,
}: ITag) {
  return (
    <TouchableOpacity
      key={tagName}
      className='bg-gray-200 rounded-md px-1 py-[0.5]'
      onPress={isForNewPost ? () => onRemoveTag(tagName) : () => {}}
    >
      <Text>{tagName}</Text>
    </TouchableOpacity>
  );
}
