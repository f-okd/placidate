import { View, Text, ActivityIndicator, FlatList } from 'react-native';
import React, { useCallback, useState } from 'react';
import { TPost } from '@/utils/posts';
import { router, useFocusEffect } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { getBookmarks } from '@/utils/users';
import Header from '@/components/Header';
import PostPreview from '@/components/PostPreview';

export default function Bookmarks() {
  const [bookmarkedPosts, setBookmarkedPosts] = useState<TPost[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { profile } = useAuth();

  if (loading) {
    return (
      <View className='flex-1 bg-white items-center justify-center'>
        <ActivityIndicator size={'large'} />
      </View>
    );
  }

  if (!profile) {
    return router.replace('/');
  }

  useFocusEffect(
    useCallback(() => {
      const loadBookmarks = async () => {
        setLoading(true);
        const userBookmarks = await getBookmarks(profile?.id);
        setBookmarkedPosts(userBookmarks);
        setLoading(false);
      };

      loadBookmarks();
    }, [])
  );

  return (
    <View className='flex-1 items-center justify-center bg-white'>
      <Header title='Bookmarks' showNotificationIcon={true} />
      <FlatList
        data={bookmarkedPosts}
        renderItem={({ item }) => <PostPreview post={item} />}
        className='w-full px-4'
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}
