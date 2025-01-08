import { View, Text, Modal, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '@/providers/AuthProvider';
import { TProfile } from '@/utils/users';
import { blockUser } from '@/utils/userUserInteractions';
import { router, useRouter } from 'expo-router';

interface IActionBar {
  authorId: string;
  liked: boolean;
  bookmarked: boolean;
  onLike: () => Promise<void>;
  onUnlike: () => Promise<void>;
  onBookmark: () => Promise<void>;
  onUnbookmark: () => Promise<void>;
}

export default function ActionBar({
  authorId,
  bookmarked,
  liked,
  onLike,
  onUnlike,
  onBookmark,
  onUnbookmark,
}: IActionBar) {
  const [modalVisible, setModalVisible] = useState(false);
  const { profile } = useAuth();
  const router = useRouter();
  const currentlyLoggedInUser = profile as TProfile;

  const handleBlock = async () => {
    try {
      await blockUser(currentlyLoggedInUser.id, authorId);
      setModalVisible(false);
      router.push('/(tabs)');
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  };

  return (
    <View className='flex-row pr-3 gap-2'>
      <Ionicons
        name={liked ? 'heart' : 'heart-outline'}
        size={24}
        color='black'
        onPress={() => (liked ? onUnlike() : onLike())}
      />
      <Ionicons
        name={bookmarked ? 'bookmark' : 'bookmark-outline'}
        size={24}
        color='black'
        onPress={() => (bookmarked ? onUnbookmark() : onBookmark())}
      />
      <Ionicons
        name='ellipsis-horizontal'
        size={24}
        color='black'
        onPress={() => setModalVisible(true)}
      />

      <Modal
        animationType='slide'
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          className='flex-1 bg-black/50'
          onPress={() => setModalVisible(false)}
        >
          <View className='mt-auto bg-white rounded-t-3xl'>
            <View className='p-4 gap-4'>
              <TouchableOpacity
                className='flex-row items-center gap-2 p-2'
                onPress={() => {
                  console.log('Report pressed');
                  setModalVisible(false);
                }}
              >
                <Ionicons name='flag-outline' size={24} color='black' />
                <Text className='text-lg'>Report Post</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className='flex-row items-center gap-2 p-2'
                onPress={handleBlock}
              >
                <Ionicons name='ban-outline' size={24} color='black' />
                <Text className='text-lg'>Block User</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className='flex-row items-center justify-center p-2 mt-2'
                onPress={() => setModalVisible(false)}
              >
                <Text className='text-lg text-red-500'>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
