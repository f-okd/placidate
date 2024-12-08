import Header from '@/components/Header';
import Post from '@/components/Post';
import { supabase } from '@/utils/supabase/supabase';
import { Database } from '@/utils/supabase/types';
import { useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';

type PostType = Database['public']['Tables']['posts']['Row'];
type PostProfileUsernameJoin = {
  profiles: {
    username: string;
    avatar_url: string | null;
  } | null;
};
export type HomePagePosts = PostType & PostProfileUsernameJoin;

export default function HomeScreen() {
  const [posts, setPosts] = useState<HomePagePosts[]>([]);
  useEffect(() => {
    getPosts();
  }, []);

  const getPosts = async (): Promise<void> => {
    console.log('hey');
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles!posts_author_id_fkey(username, avatar_url)')
      // .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
      return;
    }
    console.log(data);
    setPosts(data);
  };

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
