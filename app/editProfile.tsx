import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';

export default function editProfile() {
  const router = useRouter();

  return (
    <View className='flex-1 justify-center items-center'>
      <Text>editProfile</Text>
      <TouchableOpacity onPress={() => router.back()}>
        <Text>Save changes</Text>
      </TouchableOpacity>
    </View>
  );
}
