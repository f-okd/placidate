import { View, Text, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import { TGetPosts } from '@/app/(tabs)';
import { useRouter } from 'expo-router';
import Tag from './Tag';

export default function Post({ post }: { post: TGetPosts[number] }) {
  if (!post) {
    return <View>Error: Post is missing</View>;
  } else if (!post.profiles) {
    return <View>Error: Profile is missing</View>;
  }

  const router = useRouter();
  const {
    profiles: { id, username, avatar_url },
  } = post;

  const imageToDisplay = avatar_url
    ? { uri: avatar_url }
    : require('@/assets/images/default-avatar.jpg');

  return (
    <View className='border m-1'>
      <TouchableOpacity
        className='flex-row items-center border-b border-black'
        onPress={() => router.push(`/user?user_id=${id}`)}
      >
        <Image source={imageToDisplay} style={profilePictureImageStyle} />
        <Text className='p-2 font-bold'>{username}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push(`/post?post_id=${post.id}`)}>
        <View className='border-b h-[150px] p-3'>
          <Text>{post.body}</Text>
        </View>
        <View className='p-2 border-b h-[80px]'>
          <View className='flex-row flex-wrap gap-1'>
            {post.post_tags &&
              post.post_tags.map((tag) => (
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
