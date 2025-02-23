import BookmarkedPostPreview from '@/components/BookmarkedPostPreview';
import Header from '@/components/TopLevelHeader';
import { useAuth } from '@/providers/AuthProvider';
import SupabaseUserPostInteractionEndpoint from '@/lib/supabase/UserPostInteractionEndpoint';
import { TPost, TProfile } from '@/utils/types';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';

export default function Bookmarks() {
  const [bookmarkedPosts, setBookmarkedPosts] = useState<TPost[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { profile: uncastedProfile } = useAuth();
  const activeProfile = uncastedProfile as TProfile;

  const userPostEndpoint = new SupabaseUserPostInteractionEndpoint();

  const loadBookmarks = async () => {
    setLoading(true);
    try {
      const userBookmarks = await userPostEndpoint.getBookmarks(
        activeProfile?.id
      );
      setBookmarkedPosts(userBookmarks);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = useCallback((postId: string) => {
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

  return (
    <View className='flex-1 bg-white'>
      <Header title='Bookmarks' showNotificationIcon={false} showBackIcon />
      {bookmarkedPosts.length > 0 ? (
        <FlatList
          data={bookmarkedPosts}
          renderItem={({ item }) => (
            <BookmarkedPostPreview
              userId={activeProfile.id}
              post={item}
              onRemoveBookmark={handleRemoveBookmark}
            />
          )}
          className='w-full px-4'
          ListEmptyComponent={() => (
            <Text className='text-gray-500 p-4'>No bookmarks yet</Text>
          )}
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
