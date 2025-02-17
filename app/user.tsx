import Header from '@/components/OtherUserTopLevelHeader';
import PostPreview from '@/components/PostPreview';
import ProfileHeader from '@/components/ProfileHeader';
import { Profile, useAuth } from '@/providers/AuthProvider';

import SupabasePostEndpoint from '@/lib/supabase/PostEndpoint';
import SupabaseUserEndpoint from '@/lib/supabase/UserEndpoint';
import SupabaseUserUserInteractionEndpoint from '@/lib/supabase/UserUserInteractionEndpoint';
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
  const [followedByStatus, setFollowedByStatus] = useState<boolean>(false);

  const userEndpoint = new SupabaseUserEndpoint();
  const postEndpoint = new SupabasePostEndpoint();
  const userUserEndpoint = new SupabaseUserUserInteractionEndpoint();

  const handleFollow = async () => {
    if (!profile) return;
    try {
      await userUserEndpoint.followUser(
        currentlyLoggedInProfile.id,
        profile.id
      );
      setFollowStatus(true);
      setFollowerCount((prev) => prev + 1);
    } catch (error) {
      console.error(`Error following user ${profile.id}:`, error);
    }
  };

  const handleUnfollow = async () => {
    if (!profile) return;
    try {
      await userUserEndpoint.unfollowUser(
        currentlyLoggedInProfile.id,
        profile.id
      );
      setFollowStatus(false);
      setFollowerCount((prev) => prev - 1);
    } catch (error) {
      console.error(`Error unfollowing user ${profile.id}:`, error);
    }
  };

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
          setProfile(profileData);

          // 2.) Fetch and set follow and post counts
          const [
            { followers, following },
            posts,
            followStatus,
            followedByStatus,
          ] = await Promise.all([
            userEndpoint.getUserFollowCounts(profileData.id),
            postEndpoint.getPostsCreatedByUser(profileData.id),
            userUserEndpoint.userIsFollowing(activeProfile.id, String(user_id)),
            userUserEndpoint.userIsFollowing(String(user_id), activeProfile.id),
          ]);

          setFollowStatus(followStatus);
          setFollowedByStatus(followedByStatus);
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
        postCount={postCount}
        isFollowing={followStatus}
        isFollowedBy={followedByStatus}
        followingCount={followingCount}
        followerCount={followerCount}
        onFollow={handleFollow}
        onUnfollow={handleUnfollow}
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
