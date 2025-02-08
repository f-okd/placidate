import { TPost } from '@/utils/types';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export default function PostPreview({ post }: { post: TPost }) {
  const router = useRouter();

  return (
    <View className='border m-1'>
      <TouchableOpacity onPress={() => router.push(`/post?post_id=${post.id}`)}>
        <View className='border-b h-[150px] p-3'>
          <Text className='font-bold text-2xl mb-2'>{post?.title}</Text>
          <Text>{post.body}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}
