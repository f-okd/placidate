import { TCommentsAndAuthors, TProfile } from '@/utils/types';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface IComment {
  comment: TCommentsAndAuthors;
  onDelete: (comment_id: string) => void;
}

export default function Comment({ comment, onDelete }: IComment) {
  const { profiles } = comment;
  const profile = profiles as TProfile;

  const { user_id: author_id } = comment;
  const router = useRouter();

  return (
    <View className='flex-row gap-2 items center w-full m-1'>
      <View className='w-[99%]'>
        <View className='flex-row justify-between items-center'>
          <TouchableOpacity
            onPress={() => router.push(`/user?user_id=${author_id}`)}
          >
            <Text testID='clickable-username' className='font-bold'>
              {profile.username}:{' '}
            </Text>
          </TouchableOpacity>
          {comment.deletable ? (
            <Ionicons
              testID='delete-button'
              name='trash-outline'
              size={15}
              color='black'
              onPress={() => onDelete(comment.id)}
            />
          ) : (
            <></>
          )}
        </View>
        <Text testID='comment-body'>{comment.body}</Text>
      </View>
    </View>
  );
}
