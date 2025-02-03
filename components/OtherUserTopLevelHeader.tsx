import { View, Text, TouchableOpacity, Modal } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { blockUser } from '@/utils/userUserInteractions';
import { TProfile } from '@/utils/users';

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

  const handleBlock = async () => {
    try {
      await blockUser(currentlyLoggedInUser.id, currentlyViewedUser.id);
      setModalVisible(false);
      router.push('/(tabs)');
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  };

  return (
    <View className='flex-row w-full items-center justify-between bg-white p-4'>
      <View className='w-10'>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name='chevron-back' size={22} />
        </TouchableOpacity>
      </View>
      <View>
        <TouchableOpacity>
          <Text className='text-black font-bold text-2xl'>
            {currentlyViewedUser.username}
          </Text>
        </TouchableOpacity>
      </View>
      <View className='w-10'>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons name='ellipsis-horizontal' size={22} />
        </TouchableOpacity>
      </View>

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
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
