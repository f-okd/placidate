import Header from '@/components/OtherUserTopLevelHeader';
import PostPreview from '@/components/PostPreview';
import ProfileHeader from '@/components/ProfileHeader';
import { Profile, useAuth } from '@/providers/AuthProvider';

import SupabasePostEndpoint from '@/utils/supabase/PostEndpoint';
import SupabaseUserEndpoint from '@/utils/supabase/UserEndpoint';
import SupabaseUserUserInteractionEndpoint from '@/utils/supabase/UserUserInteractionEndpoint ';
import { TPost, TProfile } from '@/utils/types';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';

export default function OtherUsersProfileScreen() {
  const { user_id } = useLocalSearchParams();
  const router = useRouter();
  const { profile: uncastedProfile } = useAuth();

  const [currentlyLoggedInProfile, setCurrentlyLoggedInProfile] =
    useState<Profile>(uncastedProfile as TProfile);
  const [profile, setProfile] = useState<Profile | null>();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<TPost[]>([]);
  const [postCount, setPostCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [followerCount, setFollowerCount] = useState<number>(0);
  const [followStatus, setFollowStatus] = useState<boolean>(false);

  const userEndpoint = new SupabaseUserEndpoint();
  const postEndpoint = new SupabasePostEndpoint();
  const userUserEndpoint = new SupabaseUserUserInteractionEndpoint();

  useFocusEffect(
    useCallback(() => {
      /* Redirect to /profile if currentUser is viewing their own profile */
      const activeProfile = uncastedProfile as TProfile;
      if (activeProfile.id == user_id) {
        router.replace('/(tabs)/profile');
      }

      const loadAllProfileData = async () => {
        try {
          setLoading(true);
          // 1.) Fetch and set profile
          const profileData = await userEndpoint.getProfile(String(user_id));
          if (!profileData) {
            console.error('Could not find profile:', user_id);
            return router.back();
          }
          console.log(profileData.username);
          setProfile(profileData);

          // 2.) Fetch and set follow and post counts
          const [{ followers, following }, posts, followStatus] =
            await Promise.all([
              userEndpoint.getUserFollowCounts(profileData.id),
              postEndpoint.getPostsCreatedByUser(profileData.id),
              userUserEndpoint.userIsFollowing(
                activeProfile.id,
                String(user_id)
              ),
            ]);

          setFollowStatus(followStatus);
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
    }, [user_id])
  );

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
      <Header
        currentlyLoggedInUser={currentlyLoggedInProfile}
        currentlyViewedUser={profile}
      />
      <ProfileHeader
        profile={profile}
        currentlyLoggedInUser={false}
        postCount={postCount}
        isFollowing={followStatus}
        followingCount={followingCount}
        followerCount={followerCount}
        onFollow={setFollowStatus}
        handleSetFollowerCount={setFollowerCount}
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
