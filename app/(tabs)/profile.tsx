import Header from '@/components/Header';
import { useAuth } from '@/providers/AuthProvider';
import { Text, View } from 'react-native';

export default function ProfileScreen() {
  const { profile } = useAuth();

  return (
    <View className=''>
      <Header title='Profile' showBackIcon />

      <Text className='text-black font-bold text-l'>
        {JSON.stringify(profile)}
      </Text>
    </View>
  );
}
