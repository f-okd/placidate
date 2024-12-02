import { useAuth } from '@/providers/AuthProvider';
import { Text, View } from 'react-native';

export default function ProfileScreen() {
  const { profile } = useAuth();
  return (
    <View className='flex-1 items-center justify-center bg-white'>
      <Text className='text-black font-bold text-3xl'>Profile</Text>
      <Text className='text-black font-bold text-l'>{profile?.username}</Text>
    </View>
  );
}
