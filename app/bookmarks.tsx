// bookmarks.tsx
import { View, Text, ActivityIndicator, FlatList } from 'react-native';
import React, { useCallback, useState } from 'react';
import { TPost } from '@/utils/posts';
import { router, useFocusEffect } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { getBookmarks, TProfile } from '@/utils/users';
import Header from '@/components/Header';
import BookmarkedPostPreview from '@/components/BookmarkedPostPreview';

export default function Bookmarks() {
  const [bookmarkedPosts, setBookmarkedPosts] = useState<TPost[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { profile: uncastedProfile } = useAuth();
  const activeProfile = uncastedProfile as TProfile;

  const loadBookmarks = async () => {
    setLoading(true);
    try {
      const userBookmarks = await getBookmarks(activeProfile?.id);
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
      <Header title='Bookmarks' showNotificationIcon={true} showBackIcon />
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
