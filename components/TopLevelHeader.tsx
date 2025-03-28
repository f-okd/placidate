import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface IHeaderProps {
  title: string;
  showBackIcon?: boolean;
  showNotificationIcon?: boolean;
  isProfileScreen?: boolean;
}

export default function Header({
  title,
  showBackIcon = false,
  showNotificationIcon = false,
  isProfileScreen = false,
}: IHeaderProps) {
  const router = useRouter();

  return (
    <View className='flex-row w-full items-center justify-between bg-white p-4'>
      <View className='w-10'>
        {showBackIcon && (
          <TouchableOpacity testID='back-button' onPress={() => router.back()}>
            <Ionicons name='chevron-back' size={22} />
          </TouchableOpacity>
        )}
      </View>
      <View>
        <TouchableOpacity testID='title'>
          <Text className='text-black font-bold text-2xl'>{title}</Text>
        </TouchableOpacity>
      </View>
      <View className='w-10'>
        {showNotificationIcon && (
          <TouchableOpacity
            testID='notifications-button'
            onPress={() => router.push('/activity')}
          >
            <Ionicons name='notifications' size={22} />
          </TouchableOpacity>
        )}

        {isProfileScreen && (
          <TouchableOpacity
            testID='settings-button'
            onPress={() => router.push('/settings')}
          >
            <Ionicons name='settings' size={22} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
