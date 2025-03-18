import Header from '@/components/TopLevelHeader';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function InboxScreen() {
  const router = useRouter();
  return (
    <View className='flex-1 p-2 bg-white'>
      <Header showBackIcon title='Inbox' />
      <TouchableOpacity
        onPress={() => router.push('/activity')}
        className='flex-row gap-2 items-center w-full m-1'
      >
        <View className='flex-row justify-between w-full items-center pr-3'>
          <View className='flex-row gap-2'>
            <View className='w-12 h-12 rounded-full bg-purple-300 items-center justify-center'>
              <Ionicons name='time' size={30} color='white' />
            </View>
            <View>
              <Text className='font-bold'>Recent Activity</Text>
              <Text>Find out what's new 🤔</Text>
            </View>
          </View>
          <Ionicons name='chevron-forward' size={20} />
        </View>
      </TouchableOpacity>
    </View>
  );
}
