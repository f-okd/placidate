import SupabaseUserPostInteractionEndpoint from '@/utils/supabase/UserPostInteractionEndpoint';
import { TPost } from '@/utils/types';
import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { View } from 'react-native';
import PostPreview from './PostPreview';

interface IBookmarkedPostPreview {
  userId: string;
  post: TPost;
  onRemoveBookmark: (postId: string) => void;
}

export default function BookmarkedPostPreview({
  userId,
  post,
  onRemoveBookmark,
}: IBookmarkedPostPreview) {
  const userPostEndpoint = new SupabaseUserPostInteractionEndpoint();

  const handleUnbookmark = async () => {
    try {
      await userPostEndpoint.unbookmarkPost(userId, post.id);
      onRemoveBookmark(post.id);
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  return (
    <View className='flex-row items-center justify-between px-2'>
      <View className='flex-1'>
        <PostPreview post={post} />
      </View>
      <Ionicons
        name='trash-outline'
        size={36}
        color='black'
        onPress={handleUnbookmark}
        className='ml-2'
      />
    </View>
  );
}
