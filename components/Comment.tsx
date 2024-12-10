import { TCommentsAndAuthors } from '@/utils/userPostInteractions';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export default function Comment({ comment }: { comment: TCommentsAndAuthors }) {
  const { profiles: profile } = comment;
  const { user_id: author_id } = comment;
  const router = useRouter();

  return (
    <View className='flex-row gap-2 items center w-full m-1'>
      {/*Error handling in case the comments and profile join in getCommentsAndAuthors fails. Typescript suggests we could end up with a null profiles object but it I believe an error will be thrown if it fails but this is just to satisfy the compiler*/}
      <View>
        {profile?.username ? (
          <TouchableOpacity
            onPress={() => router.push(`/user?user_id=${author_id}`)}
          >
            <Text className='font-bold'>{profile.username}: </Text>
          </TouchableOpacity>
        ) : (
          <Text className='font-bold'>A user: </Text>
        )}
        <Text>{comment.body}</Text>
      </View>
    </View>
  );
}
