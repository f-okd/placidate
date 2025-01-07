import { TCommentsAndAuthors } from '@/utils/posts';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { deleteComment } from '@/utils/userPostInteractions';

interface IComment {
  comment: TCommentsAndAuthors;
  handleDelete: (comment_id: string) => void;
}

export default function Comment({ comment, handleDelete }: IComment) {
  const { profiles: profile } = comment;
  const { user_id: author_id } = comment;
  const router = useRouter();

  return (
    <View className='flex-row gap-2 items center w-full m-1'>
      {/*Error handling in case the comments and profile join in getCommentsAndAuthors fails.
       Typescript suggests we could end up with a null profiles object 
       but it I believe an error will be thrown if it fails but this is just to satisfy the compiler*/}
      <View className='w-[99%]'>
        {profile?.username ? (
          <View className='flex-row justify-between items-center  '>
            <TouchableOpacity
              onPress={() => router.push(`/user?user_id=${author_id}`)}
            >
              <Text className='font-bold'>{profile.username}: </Text>
            </TouchableOpacity>
            {comment.deletable ? (
              <Ionicons
                name='trash-outline'
                size={15}
                color='black'
                onPress={() => handleDelete(comment.id)}
              />
            ) : (
              <></>
            )}
          </View>
        ) : (
          <Text className='font-bold'>A user: </Text>
        )}
        <Text>{comment.body}</Text>
      </View>
    </View>
  );
}
