import InboxChatPreview from '@/components/InboxChatPreview';
import Header from '@/components/TopLevelHeader';
import SupabaseUserEndpoint from '@/lib/supabase/UserEndpoint';
import { useAuth } from '@/providers/AuthProvider';
import { TProfile } from '@/utils/types';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function InboxScreen() {
  const router = useRouter();
  const [friends, setFriends] = useState<
    {
      friend: TProfile;
      lastMessage: {
        body: string;
        created_at: string;
        is_post_share: boolean;
      } | null;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const { profile: uncastedProfile } = useAuth();
  const activeProfile = uncastedProfile as TProfile;

  const userEndpoint = new SupabaseUserEndpoint();

  const fetchAndSetFriends = async () => {
    setLoading(true);
    const friendsWithMessages =
      await userEndpoint.getFriendsInOrderOfRecentMessaging(activeProfile.id);
    setFriends(friendsWithMessages);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchAndSetFriends();
    }, [])
  );

  return (
    <View className='flex-1 p-2 bg-white'>
      <Header showBackIcon title='Inbox' />

      {/*New Followers*/}
      <TouchableOpacity
        onPress={() => router.push('/recentFollowers')}
        className='flex-row gap-2 items-center w-full m-1'
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

      {loading ? (
        <View className='flex-1 items-center justify-center'>
          <ActivityIndicator size='large' />
        </View>
      ) : (
        <FlatList
          data={friends}
          renderItem={({ item }) => (
            <InboxChatPreview
              user={item.friend}
              lastMessage={item.lastMessage}
            />
          )}
          keyExtractor={(item) => item.friend.id}
          ListEmptyComponent={() => (
            <View className='flex-1 items-center justify-center my-10'>
              <Text className='text-gray-500'>
                You don't have any conversations yet
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}
