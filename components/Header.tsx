import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

interface IHeaderProps {
  title: string;
  showBackIcon?: boolean;
  showNotificationIcon?: boolean;
}

export default function Header({
  title,
  showBackIcon = false,
  showNotificationIcon = false,
}: IHeaderProps) {
  const router = useRouter();

  return (
    <View className='flex-row w-full items-center justify-between bg-white p-4'>
      <View className='w-10'>
        {showBackIcon && (
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name='chevron-back' size={22} />
          </TouchableOpacity>
        )}
      </View>
      <View>
        <TouchableOpacity>
          <Text className='text-black font-bold text-2xl'>{title}</Text>
        </TouchableOpacity>
      </View>
      <View className='w-10'>
        <TouchableOpacity
          onPress={() => console.log('Navigate to notification screen')}
        >
          <Ionicons name='notifications' size={22} />
        </TouchableOpacity>
      </View>
    </View>
  );
}