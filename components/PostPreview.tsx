import { TPost } from '@/utils/types';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export default function PostPreview({ post }: { post: TPost }) {
  const router = useRouter();

  return (
    <View className='border m-1'>
      <TouchableOpacity
        testID='post-view'
        onPress={() => router.push(`/post?post_id=${post.id}`)}
      >
        <View className='border-b h-[150px] p-3'>
          <Text
            testID='post-title'
            className='font-bold text-xl mb-2 text-center'
            numberOfLines={1}
            ellipsizeMode='tail'
          >
            {post?.title}
          </Text>
          <Text
            testID='post-body'
            numberOfLines={4}
            ellipsizeMode='tail'
            className={`text-base ${
              post?.post_type === 'poem' ? 'text-center' : ''
            }`}
          >
            {post.body}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}
