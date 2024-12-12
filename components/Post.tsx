import { View, Text, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { TGetPosts } from '@/app/(tabs)';
import { Image } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/utils/supabase/supabase';
import { QueryData } from '@supabase/supabase-js';
import Tag from './Tag';

export const getPostTagsQuery = supabase.from('post_tags').select(
  `
      tag_id,
      tags (
        name
      )
    `
);
export type TPostTagsQuery = QueryData<typeof getPostTagsQuery>;

export default function Post({ post }: { post: TGetPosts[number] }) {
  if (!post) {
    return <View>Error: Post is missing</View>;
  } else if (!post.profiles) {
    return <View>Error: Profile is missing</View>;
  }

  const [loading, setLoading] = useState<boolean>(true);
  const [tags, setTags] = useState<TPostTagsQuery>([]);

  useEffect(() => {
    setLoading(true);
    getPostTags(post.id);
    setLoading(false);
  }, []);

  const getPostTags = async (postId: string) => {
    const { data, error } = await getPostTagsQuery.eq('post_id', postId);

    if (error) {
      console.error('Error fetching tags:', error);
      return [];
    }

    setTags(data);
  };

  const {
    profiles: { id, username },
  } = post;

  const router = useRouter();

  if (loading) {
    return (
      <View>
        <Text>Loading</Text>
      </View>
    );
  }

  return (
    <View className='border m-1'>
      <TouchableOpacity
        className='flex-row items-center border-b border-black'
        onPress={() => router.push(`/user?user_id=${id}`)}
      >
        <Image
          src={'https://picsum.photos/200'}
          style={profilePictureImageStyle}
        />
        <Text className='p-2 font-bold'>{username}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push(`/post?post_id=${post.id}`)}>
        <View className='border-b h-[150px] p-3'>
          <Text>{post.body}</Text>
        </View>
        <View className='p-2 border-b h-[80px]'>
          <View className='flex-row flex-wrap gap-1'>
            {tags &&
              tags.map((tag) => (
                <Tag key={tag.tag_id} tagName={tag.tags?.name ?? ''} />
              ))}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const profilePictureImageStyle = {
  width: 40,
  height: 40,
  borderRadius: 20,
  borderWidth: 2,
  borderColor: 'black',
  margin: 4,
};
