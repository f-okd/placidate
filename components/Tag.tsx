import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

interface ITag {
  tagName: string;
  onRemoveTag?: (() => void) | ((tag: string) => void);
}
export default function Tag({ tagName, onRemoveTag }: ITag) {
  return (
    <TouchableOpacity
      testID='tag'
      key={tagName}
      className='bg-gray-200 rounded-md px-1 py-[0.5]'
      onPress={onRemoveTag ? () => onRemoveTag(tagName) : () => {}}
    >
      <Text>{tagName}</Text>
    </TouchableOpacity>
  );
}
