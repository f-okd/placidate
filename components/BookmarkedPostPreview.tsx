import SupabaseUserPostInteractionEndpoint from '@/lib/supabase/UserPostInteractionEndpoint';
import { TPost } from '@/utils/types';
import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Touchable, TouchableOpacity, View } from 'react-native';
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
    <View
      className='flex-row items-center justify-between px-2'
      testID='bookmarked-post-container'
    >
      <View className='flex-1' testID='post-preview-container'>
        <PostPreview post={post} />
      </View>
      <TouchableOpacity
        testID='unbookmark-button'
        className='ml-2'
        onPress={handleUnbookmark}
      >
        <Ionicons name='trash-outline' size={36} color='black' />
      </TouchableOpacity>
    </View>
  );
}
