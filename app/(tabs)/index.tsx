import Header from '@/components/Header';
import Post from '@/components/Post';
import { supabase } from '@/utils/supabase/supabase';
import { QueryData } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { FlatList, View, Text } from 'react-native';

const getPostsQuery = supabase
  .from('posts')
  .select('*, profiles!posts_author_id_fkey(id, username, avatar_url)')
  .order('created_at', { ascending: false });

export type TGetPosts = QueryData<typeof getPostsQuery>;

export default function HomeScreen() {
  const [posts, setPosts] = useState<TGetPosts>([]);
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    setLoading(true);
    getPosts();
    setLoading(false);
  }, []);

  const getPosts = async (): Promise<void> => {
    const { data, error } = await getPostsQuery;

    if (error) {
      console.error('Error fetching posts:', error);
      return;
    }
    setPosts(data);
  };

  if (loading) {
    return (
      <View>
        <Text>Loading</Text>
      </View>
    );
  }

  return (
    <View className='flex-1 items-center justify-center bg-white'>
      <Header title='Placidate' showNotificationIcon={true} />
      <FlatList
        data={posts}
        snapToStart
        renderItem={({ item }) => <Post post={item}></Post>}
        className='w-full px-4'
      />
    </View>
  );
}
