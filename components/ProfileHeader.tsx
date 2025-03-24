import { showToast } from '@/utils/helpers';
import { TProfile } from '@/utils/types';
import { useRouter } from 'expo-router';
import React, { useState, useMemo } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

interface IProfileHeader {
  profile: TProfile;
  postCount: number;
  isFollowing: boolean;
  isFollowedBy: boolean;
  followerCount: number;
  followingCount: number;
  onFollow: () => void;
  onUnfollow: () => void;
  canViewContent: boolean;
}

export default function ProfileHeader({
  profile,
  postCount,
  isFollowing,
  isFollowedBy,
  followerCount,
  followingCount,
  onFollow,
  onUnfollow,
  canViewContent,
}: IProfileHeader) {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();

  const imageToDisplay = profile.avatar_url
    ? { uri: profile.avatar_url }
    : require('@/assets/images/default-avatar.jpg');

  // Calculate truncated and full text
  const { shouldShowButton, displayText } = useMemo(() => {
    const bio = profile.bio?.trim() || '';
    const words = bio.split(/\s+/);
    if (words.length <= 25) {
      return { shouldShowButton: false, displayText: bio };
    }
    const truncatedText = words.slice(0, 25).join(' ') + '...';
    return {
      shouldShowButton: true,
      displayText: isExpanded ? bio : truncatedText,
    };
  }, [profile.bio, isExpanded]);

  return (
    <View className='border-b pb-5 border-gray-200 px-10'>
      <View className='flex-row items-center justify-between'>
        <Image
          testID='avatar'
          source={imageToDisplay}
          style={profilePictureImageStyle}
        />
        <TouchableOpacity
          testID='followers-section'
          onPress={() =>
            canViewContent
              ? router.push(
                  `/followers?user_id=${profile.id}&username=${profile.username}`
                )
              : showToast("User's account is private")
          }
        >
          <Text testID='follower-count' className='font-bold text-xl'>
            {followerCount}
          </Text>
          <Text testID='follower-label'>Followers</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID='following-section'
          onPress={() =>
            canViewContent
              ? router.push(
                  `/following?user_id=${profile.id}&username=${profile.username}`
                )
              : showToast("User's account is private")
          }
        >
          <Text testID='following-count' className='font-bold text-xl'>
            {followingCount}
          </Text>
          <Text testID='following-label'>Following</Text>
        </TouchableOpacity>
        <View>
          <Text testID='post-count' className='font-bold text-xl'>
            {postCount}
          </Text>
          <Text testID='post-label'>Posts</Text>
        </View>
      </View>
      <View className='pt-2'>
        <View className='flex-col'>
          <View>
            <Text>{displayText}</Text>
            {shouldShowButton && (
              <TouchableOpacity
                onPress={() => setIsExpanded(!isExpanded)}
                className='mt-1'
              >
                <Text className='text-gray-600'>
                  {isExpanded ? 'Show less' : 'Read more'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <View className='flex-row gap-2 mt-2'>
            <TouchableOpacity
              testID='follow-button'
              className={'bg-gray-800 w-[22%] p-2 rounded-lg'}
              onPress={isFollowing ? onUnfollow : onFollow}
            >
              <Text className='text-white text-center'>
                {isFollowing ? 'Unfollow' : 'Follow'}
              </Text>
            </TouchableOpacity>
            {isFollowing && isFollowedBy && (
              <>
                <TouchableOpacity
                  testID='message-button'
                  className='bg-gray-800 w-[22%] p-2 rounded-lg'
                  onPress={() => router.push(`/chat?user_id=${profile.id}`)}
                >
                  <Text className='text-white text-center'>Message</Text>
                </TouchableOpacity>
              </>
            )}
            {/* Show bookmarks button if:
              1. Bookmarks are public, OR
              2. Bookmarks are set to mutuals AND there's a mutual follow relationship */}
            {(profile.bookmark_visibility === 'public' ||
              (profile.bookmark_visibility === 'mutuals' &&
                (profile.is_private
                  ? canViewContent
                  : isFollowing && isFollowedBy))) && (
              <TouchableOpacity
                testID='bookmarks-button'
                className='bg-gray-800 w-[35%] p-2 rounded-lg'
                onPress={() =>
                  router.push(
                    `/bookmarks?user_id=${profile.id}&username=${profile.username}`
                  )
                }
              >
                <Text className='text-white text-center'>View Bookmarks</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const profilePictureImageStyle = {
  width: 70,
  height: 70,
  borderRadius: 35,
  borderWidth: 2,
  borderColor: 'black',
};
