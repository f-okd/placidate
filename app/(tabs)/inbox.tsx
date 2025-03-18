import InboxChatPreview from '@/components/InboxChatPreview';
import Header from '@/components/TopLevelHeader';
import SupabaseUserEndpoint from '@/lib/supabase/UserEndpoint';
import { useAuth } from '@/providers/AuthProvider';
import { TProfile } from '@/utils/types';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

export default function InboxScreen() {
  const router = useRouter();
  const [friends, setFriends] = useState<TProfile[]>();
  const { profile: uncastedProfile } = useAuth();
  const activeProfile = uncastedProfile as TProfile;

  const userEndpoint = new SupabaseUserEndpoint();
  const fetchAndSetFriends = async () => {
    const friends = await userEndpoint.getFriends(activeProfile.id);
    setFriends(friends);
  };
  useFocusEffect(
    useCallback(() => {
      fetchAndSetFriends();
    }, [])
  );

  return (
    <View className='flex-1 p-2 bg-white '>
      <Header showBackIcon title='Inbox' />

      {/*New Followers*/}
      <TouchableOpacity
        onPress={() => router.push('/recentFollowers')}
        className='flex-row gap-2 items-center w-full m-1 '
      >
        <View className='flex-row justify-between w-full items-center pr-3'>
          <View className='flex-row gap-2'>
            <View className='w-12 h-12 rounded-full bg-purple-300 items-center justify-center'>
              <Ionicons name='people' size={30} color='white' />
            </View>
            <View>
              <Text className='font-bold'>New Followers</Text>
              <Text>See who's recently followed you</Text>
            </View>
          </View>
          <Ionicons name='chevron-forward' size={20} />
        </View>
      </TouchableOpacity>

      {/*Recent Activity*/}
      <TouchableOpacity
        onPress={() => router.push('/activity')}
        className='flex-row gap-2 items-center w-full m-1'
      >
        <View className='flex-row justify-between w-full items-center pr-3'>
          <View className='flex-row gap-2'>
            <View className='w-12 h-12 rounded-full bg-purple-300 items-center justify-center'>
              <Ionicons name='notifications' size={30} color='white' />
            </View>
            <View>
              <Text className='font-bold'>Activity</Text>
              <Text>Notifications show up here</Text>
            </View>
          </View>
          <Ionicons name='chevron-forward' size={20} />
        </View>
      </TouchableOpacity>

      {/* Chats*/}
      <View className='mx-1 my-5'>
        <Text>Messages:</Text>
      </View>
      <FlatList
        data={friends}
        renderItem={({ item }) => <InboxChatPreview user={item} />}
      />
    </View>
  );
}
