import PostPreview from '@/components/PostPreview';
import UserSearchResult from '@/components/UserSearchResult';
import { useAuth } from '@/providers/AuthProvider';
import SupabasePostEndpoint from '@/lib/supabase/PostEndpoint';
import SupabaseUserEndpoint from '@/lib/supabase/UserEndpoint';
import { TPost, TProfile } from '@/utils/types';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

enum SearchTerm {
  POSTS = 'posts',
  USERS = 'users',
  TAGS = 'tags',
}

const searchOptions = [
  { label: 'Posts', value: SearchTerm.POSTS },
  { label: 'Users', value: SearchTerm.USERS },
  { label: 'Tags', value: SearchTerm.TAGS },
];

export default function SearchScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState('');
  const [searchType, setSearchType] = useState<SearchTerm>(SearchTerm.POSTS);
  const [showDropdown, setShowDropdown] = useState(false);

  const { profile: uncastedProfile } = useAuth();
  const activeProfile = uncastedProfile as TProfile;

  const [fetchedPosts, setfFetchedPosts] = useState<TPost[]>([]);
  const [fetchedPostsByTag, setFetchedPostsByTag] = useState<TPost[]>([]);
  const [fetchedUsers, setFetchedUsers] = useState<TProfile[]>([]);

  const postEndpoint = new SupabasePostEndpoint();
  const userEndpoint = new SupabaseUserEndpoint();

  useEffect(() => {
    for (const [key, value] of Object.entries(SearchTerm)) {
      if (params.searchTerm === value) {
        setSearchType(SearchTerm[key as keyof typeof SearchTerm]);
      }
    }
  }, [params, searchType]);

  const handleSearch = async () => {
    switch (searchType) {
      case SearchTerm.USERS:
        setLoading(true);
        const usersResult = await userEndpoint.searchForUsers(
          activeProfile.id,
          searchText
        );
        setFetchedUsers(usersResult);
        setLoading(false);
        break;
      case SearchTerm.POSTS:
        setLoading(true);
        const postsResult = await postEndpoint.searchForPosts(
          activeProfile.id,
          searchText
        );
        setfFetchedPosts(postsResult);
        setLoading(false);
      case SearchTerm.TAGS:
        setLoading(true);
        const postsByTagResult = await postEndpoint.searchForPostsByTag(
          activeProfile.id,
          searchText
        );
        setFetchedPostsByTag(postsByTagResult);
        setLoading(false);
      default:
        console.log('default search case');
    }
  };

  if (loading) {
    return (
      <View className='flex-1 bg-white items-center justify-center'>
        <ActivityIndicator size={'large'} />
      </View>
    );
  }
  return (
    <View className='flex-1 bg-white'>
      <View className='px-4 py-3 border-y border-gray-200 bg-white'>
        {/*Search Bar */}
        <View className='flex-row items-center mb-2'>
          {/* Dropdown Button */}
          <TouchableOpacity
            onPress={() => setShowDropdown(true)}
            className='bg-gray-100 px-3 py-2 rounded-full min-w-[80px] max-w-[100px]'
          >
            <Text className='text-center' numberOfLines={1}>
              {searchType}
            </Text>
          </TouchableOpacity>

          {/* Search Input */}
          <TextInput
            className='flex-1 bg-gray-100 px-4 py-2 rounded-full mx-2'
            placeholder='Search...'
            value={searchText}
            onChangeText={setSearchText}
          />

          {/* Search Button */}
          <TouchableOpacity onPress={handleSearch}>
            <Ionicons
              name='arrow-forward-circle-outline'
              size={32}
              color='black'
            />
          </TouchableOpacity>
        </View>

        {/*Display user search results when user search type is toggled*/}
        {searchType === SearchTerm.USERS && fetchedUsers.length > 0 && (
          <FlatList
            data={fetchedUsers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <UserSearchResult
                id={item.id}
                username={item.username}
                avatarUrl={item.avatar_url}
                router={router}
              />
            )}
          />
        )}

        {/*Display post search results when post search type is toggled*/}
        {searchType === SearchTerm.POSTS && fetchedPosts.length > 0 && (
          <FlatList
            data={fetchedPosts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <PostPreview post={item}></PostPreview>}
          />
        )}

        {/*Display post search results when post search type is toggled*/}
        {searchType === SearchTerm.TAGS && fetchedPostsByTag.length > 0 && (
          <FlatList
            data={fetchedPostsByTag}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <PostPreview post={item}></PostPreview>}
          />
        )}
      </View>

      {/* Dropdown Modal */}
      <Modal
        visible={showDropdown}
        transparent={true}
        animationType='slide'
        onRequestClose={() => setShowDropdown(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
          onPress={() => setShowDropdown(false)}
        >
          <View className='mt-20 mx-4 bg-white rounded-lg overflow-hidden'>
            <FlatList
              data={searchOptions}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className='p-4 border-b border-gray-200'
                  onPress={() => {
                    setSearchType(item.value);
                    setShowDropdown(false);
                  }}
                >
                  <Text>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
