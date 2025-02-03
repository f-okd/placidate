import Header from '@/components/TopLevelHeader';
import Post from '@/components/Post';
import { supabase } from '@/utils/supabase/supabase';
import { QueryData } from '@supabase/supabase-js';
import { useCallback, useState } from 'react';
import {
  FlatList,
  View,
  Text,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getHomePagePosts, TGetHomePagePost, TProfile } from '@/utils/posts';
import { useAuth } from '@/providers/AuthProvider';

export default function HomeScreen() {
  const [posts, setPosts] = useState<TGetHomePagePost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const { profile: uncastedProfile, refreshProfile } = useAuth();
  const activeProfile = uncastedProfile as TProfile;

  const getPosts = async (showLoadingState = true): Promise<void> => {
    if (showLoadingState) setLoading(true);

    try {
      const posts = await getHomePagePosts(activeProfile.id);

      setPosts(posts ?? []);
    } catch (error) {
      console.error('Unexpected error fetching posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    getPosts(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      getPosts();

      // Setup real-time subscription for new posts -- do i really want this
      const subscription = supabase
        .channel('posts')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'posts' },
          () => {
            getPosts(false);
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
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
    <View className='flex-1 items-center justify-center bg-white'>
      <Header title='Placidate' showNotificationIcon={true} />
      <FlatList
        data={posts}
        snapToStart
        renderItem={({ item }) => <Post post={item} />}
        className='w-full px-4'
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}
