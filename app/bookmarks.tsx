import PostPreview from '@/components/PostPreview';
import Header from '@/components/TopLevelHeader';
import SupabaseUserPostInteractionEndpoint from '@/lib/supabase/UserPostInteractionEndpoint';
import { useAuth } from '@/providers/AuthProvider';
import { TPost, TProfile } from '@/utils/types';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';

export default function Bookmarks() {
  const [bookmarkedPosts, setBookmarkedPosts] = useState<TPost[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { profile: uncastedProfile } = useAuth();
  const activeProfile = uncastedProfile as TProfile;

  const params = useLocalSearchParams();
  const user_id = params.user_id
    ? (params.user_id as string)
    : activeProfile.id;
  const username = params.username as string;

  const userPostEndpoint = new SupabaseUserPostInteractionEndpoint();

  const loadBookmarks = async () => {
    setLoading(true);
    try {
      const userBookmarks = await userPostEndpoint.getBookmarks(user_id);
      setBookmarkedPosts(userBookmarks);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = useCallback(async (postId: string) => {
    try {
      await userPostEndpoint.unbookmarkPost(user_id, postId);
    } catch (error: any) {
      console.error(error);
      throw new Error('Error removing bookmark:', error.message);
    }
    setBookmarkedPosts((prev) => prev.filter((post) => post.id !== postId));
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBookmarks();
    }, [])
  );

  if (loading) {
    return (
      <View className='flex-1 bg-white items-center justify-center'>
        <ActivityIndicator size={'large'} />
      </View>
    );
  }
  console.log(username);
  return (
    <View className='flex-1 bg-white'>
      <Header
        title={
          username != undefined ? `${username}'s Bookmarks` : 'Your Bookmarks'
        }
        showNotificationIcon={false}
        showBackIcon
      />
      {bookmarkedPosts.length > 0 ? (
        <FlatList
          data={bookmarkedPosts}
          renderItem={({ item }) => (
            <View
              className='flex-row items-center justify-between px-2'
              testID='bookmarked-post-container'
            >
              <View className='flex-1' testID='post-preview-container'>
                <PostPreview post={item} />
              </View>
              {params.user_id == undefined ? (
                <Ionicons
                  testID='unbookmark-button'
                  name='trash-outline'
                  size={36}
                  color='black'
                  onPress={() => handleRemoveBookmark(item.id)}
                  className='ml-2'
                />
              ) : (
                <></>
              )}
            </View>
          )}
          className='w-full px-4'
          keyExtractor={(item) => item.id}
        />
      ) : (
        <View className='flex-1 items-center justify-center'>
          <Text className='text-3xl'>No bookmarks yet 😢</Text>
        </View>
      )}
    </View>
  );
}
