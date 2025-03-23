import { useAuth } from '@/providers/AuthProvider';
import SupabaseUserUserInteractionEndpoint from '@/lib/supabase/UserUserInteractionEndpoint';
import { TProfile } from '@/utils/types';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, Share, Text, TouchableOpacity, View } from 'react-native';

interface IActionBar {
  authorId: string;
  liked: boolean;
  bookmarked: boolean;
  onLike: () => Promise<void>;
  onUnlike: () => Promise<void>;
  onBookmark: () => Promise<void>;
  onUnbookmark: () => Promise<void>;
  onDelete: () => Promise<void>;
  onEdit: () => Promise<void>;
  onShare: () => Promise<void>;
  onSendInChat: () => void;
}

export default function ActionBar({
  authorId,
  bookmarked,
  liked,
  onLike,
  onUnlike,
  onBookmark,
  onUnbookmark,
  onDelete,
  onEdit,
  onShare,
  onSendInChat,
}: IActionBar) {
  const [modalVisible, setModalVisible] = useState(false);
  const { profile } = useAuth();
  const router = useRouter();
  const currentlyLoggedInUser = profile as TProfile;

  const userUserEndpoint = new SupabaseUserUserInteractionEndpoint();

  const handleBlock = async () => {
    try {
      await userUserEndpoint.blockUser(currentlyLoggedInUser.id, authorId);
      setModalVisible(false);
      router.push('/(tabs)');
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  };

  return (
    <View className='flex-row pr-3 gap-2'>
      <Ionicons
        testID='like-button'
        name={liked ? 'heart' : 'heart-outline'}
        size={24}
        color='black'
        onPress={() => (liked ? onUnlike() : onLike())}
      />
      <Ionicons
        testID='bookmark-button'
        name={bookmarked ? 'bookmark' : 'bookmark-outline'}
        size={24}
        color='black'
        onPress={() => (bookmarked ? onUnbookmark() : onBookmark())}
      />
      <Ionicons
        testID='more-options-button'
        name='ellipsis-horizontal'
        size={24}
        color='black'
        onPress={() => setModalVisible(true)}
      />

      <Modal
        testID='modal'
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
                testID='send-button'
                onPress={onSendInChat}
                className='flex-row items-center gap-2 p-2'
              >
                <Ionicons name='send-outline' size={24} color='black' />
                <Text className='text-lg'>Send as A Message</Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID='share-button'
                className='flex-row items-center gap-2 p-2'
                onPress={onShare}
              >
                <Ionicons name='share-social-outline' size={24} color='black' />
                <Text className='text-lg'>Share Post</Text>
              </TouchableOpacity>
              {authorId == profile?.id ? (
                <>
                  <TouchableOpacity
                    testID='edit-button'
                    className='flex-row items-center gap-2 p-2'
                    onPress={onEdit}
                  >
                    <Ionicons name='create' size={24} color='black' />
                    <Text className='text-lg'>Edit post</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    testID='delete-button'
                    className='flex-row items-center gap-2 p-2'
                    onPress={onDelete}
                  >
                    <Ionicons name='trash-outline' size={24} color='black' />
                    <Text className='text-lg'>Delete post</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    testID='report-button'
                    className='flex-row items-center gap-2 p-2'
                    onPress={handleBlock}
                  >
                    <Ionicons name='flag-outline' size={24} color='black' />
                    <Text className='text-lg'>Report Post</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    testID='block-button'
                    className='flex-row items-center gap-2 p-2'
                    onPress={handleBlock}
                  >
                    <Ionicons name='ban-outline' size={24} color='black' />
                    <Text className='text-lg'>Block User</Text>
                  </TouchableOpacity>
                </>
              )}

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
