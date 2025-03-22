import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface IHeaderProps {
  username: string;
  userId?: string;
}

export default function Header({ username, userId }: IHeaderProps) {
  const router = useRouter();

  return (
    <View className='flex-row w-full items-center justify-between bg-white p-4'>
      <View className='w-10'>
        <TouchableOpacity testID='back-button' onPress={() => router.back()}>
          <Ionicons name='chevron-back' size={22} />
        </TouchableOpacity>
      </View>
      <View>
        <TouchableOpacity
          testID='username'
          onPress={
            userId ? () => router.push(`/user?user_id=${userId}`) : () => {}
          }
        >
          <Text className='text-black font-bold text-2xl'>{username}</Text>
        </TouchableOpacity>
      </View>
      <View className='w-10'>
        <></>
      </View>
    </View>
  );
}
