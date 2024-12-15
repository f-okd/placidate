import Header from '@/components/Header';
import ProfileHeader from '@/components/ProfileHeader';
import ProfilePost from '@/components/ProfilePostPreview';
import { useAuth } from '@/providers/AuthProvider';
import {
  getPostsCreatedByUser,
  getUserFollowCounts,
  TPosts,
} from '@/utils/users';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { profile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<TPosts[]>([]);
  const [postCount, setPostCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [followerCount, setFollowerCount] = useState<number>(0);

  // Early return if no profile
  if (!profile) {
    console.error('Error showing post: Couldnt load profile from auth context');
    router.back();
    return null; // Return null for type safety
  }

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
    }, [profile.id])
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
      <ProfileHeader
        profile={profile}
        currentlyLoggedInUser
        postCount={postCount}
        followingCount={followingCount}
        followerCount={followerCount}
      />
      <FlatList
        data={posts}
        snapToStart
        renderItem={({ item }) => <ProfilePost post={item}></ProfilePost>}
        className='w-full px-4'
      />
    </View>
  );
}
