import Header from '@/components/Header';
import ProfileHeader from '@/components/ProfileHeader';
import ProfilePost from '@/components/ProfilePostPreview';
import { Profile, useAuth } from '@/providers/AuthProvider';
import { TPost } from '@/utils/posts';
import { getPostsCreatedByUser, getUserFollowCounts } from '@/utils/users';
import { getProfile } from '@/utils/userUserInteractions';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';

export default function OtherUsersProfileScreen() {
  const { profile: currentlyLoggedInUser } = useAuth();
  const { user_id } = useLocalSearchParams();
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<TPost[]>([]);
  const [postCount, setPostCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [followerCount, setFollowerCount] = useState<number>(0);

  useEffect(() => {
    if (currentlyLoggedInUser?.id == user_id) {
      router.replace('/(tabs)/profile');
      return;
    }

    const loadAllProfileData = async () => {
      try {
        setLoading(true);
        // 1.) Fetch and set profile
        const profileData = await getProfile(String(user_id));
        if (!profileData) {
          console.error('Could not find profile:', user_id);
          return router.back();
        }
        console.log(profileData.username);
        setProfile(profileData);

        // 2.) Fetch and set follow and post counts
        const [{ followers, following }, posts] = await Promise.all([
          getUserFollowCounts(profileData.id),
          getPostsCreatedByUser(profileData.id),
        ]);

        setFollowingCount(following);
        setFollowerCount(followers);

        if (posts) {
          setPosts(posts);
          setPostCount(posts.length);
        } else {
          console.error('Error setting posts for profile:', profileData.id);
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

    loadAllProfileData();
  }, [user_id, currentlyLoggedInUser?.id]);

  if (loading) {
    return (
      <View className='flex-1 bg-white items-center justify-center'>
        <ActivityIndicator size={'large'} />
      </View>
    );
  }

  if (!profile) {
    console.error('No profile set');
    return router.back();
  }

  return (
    <View className='flex-1 bg-white'>
      <Header title={profile.username} showBackIcon />
      <ProfileHeader
        profile={profile}
        currentlyLoggedInUser={false}
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
