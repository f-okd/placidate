import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { HomePagePosts } from '@/app/(tabs)';
import { Image } from 'react-native';
import { useRouter } from 'expo-router';

export default function Post({ post }: { post: HomePagePosts }) {
  if (!post) {
    return <View>Error: Post is missing</View>;
  } else if (!post.profiles) {
    return <View>Error: Profile is missing</View>;
  }
  const {
    profiles: { id, username },
  } = post;
  const { description } = post;

  const router = useRouter();

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
          <Text>
            <Text className='font-bold'>{username + ': '}</Text>
            {description && (
              <Text>
                {description.length > 170
                  ? description.substring(0, 170) + ' ...'
                  : description}
              </Text>
            )}
          </Text>
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
