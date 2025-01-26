import Header from '@/components/Header';
import OwnProfileHeader from '@/components/OwnProfileHeader';
import PostPreview from '@/components/PostPreview';
import { useAuth } from '@/providers/AuthProvider';
import { TPost } from '@/utils/posts';
import {
  getPostsCreatedByUser,
  getUserFollowCounts,
  TProfile,
} from '@/utils/users';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ImageSourcePropType,
  View,
} from 'react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { profile: uncastedProfile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<TPost[]>([]);
  const [postCount, setPostCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [followerCount, setFollowerCount] = useState<number>(0);

  const profile = uncastedProfile as TProfile;

  useFocusEffect(
    useCallback(() => {
      const loadProfileData = async () => {
        try {
          setLoading(true);
          const [{ followers, following }, posts] = await Promise.all([
            getUserFollowCounts(profile.id),
            getPostsCreatedByUser(profile.id),
          ]);

          setFollowingCount(following);
          setFollowerCount(followers);

          if (posts) {
            setPosts(posts);
            setPostCount(posts.length);
          } else {
            console.error('Error setting posts for profile:', profile.id);
            setPosts([]);
            setPostCount(0);
          }
        } catch (error) {
          console.error('Error loading profile data:', error);
          setPosts([]);
          setPostCount(0);
        } finally {
          setLoading(false);
        }
      };

      loadProfileData();
    }, [profile])
  );

  if (loading) {
    return (
      <View className='flex-1 bg-white items-center justify-center'>
        <ActivityIndicator size={'large'} />
      </View>
    );
  }

  return (
    <View className='flex-1 bg-white'>
      <Header title={profile.username} showBackIcon isProfilePage />
      <OwnProfileHeader
        postCount={postCount}
        followingCount={followingCount}
        followerCount={followerCount}
        avatar={profile.avatar_url as string}
      />
      <FlatList
        data={posts}
        snapToStart
        renderItem={({ item }) => <PostPreview post={item}></PostPreview>}
        className='w-full px-4'
      />
    </View>
  );
}
