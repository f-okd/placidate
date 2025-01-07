import { View, Text, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import { Router } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';

interface IUserSearchResult {
  id: string;
  username: string;
  router: Router;
}

export default function UserSearchResult({
  id,
  username,
  router,
}: IUserSearchResult) {
  const { profile: currentlyLoggedInUser } = useAuth();

  const navigateToProfile = (): void => {
    if (currentlyLoggedInUser?.id == id) {
      return router.push('/(tabs)/profile');
    } else {
      return router.push(`/user?user_id=${id}`);
    }
  };
  return (
    <View className='flex-row gap 2'>
      <TouchableOpacity
        className='flex-row items-center p-2'
        onPress={() => navigateToProfile()}
      >
        <Image
          src={'https://picsum.photos/200'}
          style={profilePictureImageStyle}
        />
        <Text className='p-2 font-bold'>{username}</Text>
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
