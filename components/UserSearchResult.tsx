import { useAuth } from '@/providers/AuthProvider';
import { Router } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

interface IUserSearchResult {
  id: string;
  username: string;
  avatarUrl: string | null;
  router: Router;
  isOnFollowingList?: boolean;
  isOnFollowerList?: boolean;
}

export default function UserSearchResult({
  id,
  username,
  avatarUrl,
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
    <TouchableOpacity
      testID='search-result'
      className='flex-row items-center p-2'
      onPress={() => navigateToProfile()}
    >
      <Image
        testID='avatar'
        source={
          avatarUrl
            ? { uri: avatarUrl }
            : require('@/assets/images/default-avatar.jpg')
        }
        style={profilePictureImageStyle}
      />
      <Text testID='username' className='p-2 font-bold'>
        {username}
      </Text>
    </TouchableOpacity>
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
