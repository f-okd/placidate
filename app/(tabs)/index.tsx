import Post from '@/components/Post';
import Header from '@/components/TopLevelHeader';
import { useAuth } from '@/providers/AuthProvider';
import { getRecommendedPosts, TGetHomePagePost, TProfile } from '@/utils/posts';
import { supabase } from '@/utils/supabase/supabase';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  View,
  Text,
} from 'react-native';

export default function HomeScreen() {
  const [posts, setPosts] = useState<TGetHomePagePost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeSection, setActiveSection] = useState<activeSectionType>(
    activeSectionType.FOLLOWING
  );
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const { profile: uncastedProfile } = useAuth();
  const activeProfile = uncastedProfile as TProfile;

  const getPosts = async (showLoadingState = true): Promise<void> => {
    if (showLoadingState) setLoading(true);

    try {
      const posts = await getRecommendedPosts(activeProfile.id);

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
      <View className='flex-row w-full justify-center items-center gap-4'>
        <TouchableOpacity>
          <Text>Following</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text>Recommended</Text>
        </TouchableOpacity>
      </View>
      {activeSection == activeSectionType.FOLLOWING ? (
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
      ) : (
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
      )}
    </View>
  );
}

enum activeSectionType {
  FOLLOWING = 'following',
  RECOMMENDED = 'recmommended',
}
