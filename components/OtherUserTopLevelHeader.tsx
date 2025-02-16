import SupabaseUserUserInteractionEndpoint from '@/lib/supabase/UserUserInteractionEndpoint';
import { TProfile } from '@/utils/types';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

interface IHeaderProps {
  currentlyLoggedInUser: TProfile;
  currentlyViewedUser: TProfile;
}

export default function Header({
  currentlyLoggedInUser,
  currentlyViewedUser,
}: IHeaderProps) {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);

  const userUserEndpoint = new SupabaseUserUserInteractionEndpoint();

  const handleBlock = async () => {
    try {
      await userUserEndpoint.blockUser(
        currentlyLoggedInUser.id,
        currentlyViewedUser.id
      );
      setModalVisible(false);
      router.push('/(tabs)');
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  };

  return (
    <View className='flex-row w-full items-center justify-between bg-white p-4'>
      <View className='w-10'>
        <TouchableOpacity testID='back-button' onPress={() => router.back()}>
          <Ionicons name='chevron-back' size={22} />
        </TouchableOpacity>
      </View>
      <View>
        <TouchableOpacity>
          <Text testID='username' className='text-black font-bold text-2xl'>
            {currentlyViewedUser.username}
          </Text>
        </TouchableOpacity>
      </View>
      <View className='w-10'>
        <TouchableOpacity
          testID='options-button'
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name='ellipsis-horizontal' size={22} />
        </TouchableOpacity>
      </View>

      <Modal
        testID='options-modal'
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
            <TouchableOpacity
              testID='block-button'
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
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
