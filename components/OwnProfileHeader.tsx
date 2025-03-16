import { useRouter } from 'expo-router';
import React, { useState, useMemo } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

interface IProfileHeader {
  postCount: number;
  followerCount: number;
  followingCount: number;
  avatar: string | null;
  id: string;
  bio: string;
}

export default function OwnProfileHeader({
  postCount,
  followerCount,
  followingCount,
  avatar,
  id,
  bio,
}: IProfileHeader) {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();

  const imageToDisplay = avatar
    ? { uri: avatar }
    : require('@/assets/images/default-avatar.jpg');

  // Calculate truncated and full text
  const { shouldShowButton, displayText } = useMemo(() => {
    const words = bio.trim().split(/\s+/);
    if (words.length <= 25) {
      return { shouldShowButton: false, displayText: bio };
    }
    const truncatedText = words.slice(0, 25).join(' ') + '...';
    return {
      shouldShowButton: true,
      displayText: isExpanded ? bio : truncatedText,
    };
  }, [bio, isExpanded]);

  return (
    <View className='border-b pb-5 border-gray-200 px-10'>
      {/*Section for profile picture and post, follower, following counts */}
      <View className='flex-row items-center justify-between  '>
        <Image
          testID='avatar'
          source={imageToDisplay}
          style={profilePictureImageStyle}
        />
        <TouchableOpacity
          testID='followers-section'
          onPress={() => router.push(`/followers?user_id=${id}`)}
        >
          <Text testID='follower-count' className='font-bold text-xl'>
            {followerCount}
          </Text>
          <Text testID='followers-label'>Followers</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID='following-section'
          onPress={() => router.push(`/following?user_id=${id}`)}
        >
          <Text testID='following-count' className='font-bold text-xl'>
            {followingCount}
          </Text>
          <Text testID='following-label'>Following</Text>
        </TouchableOpacity>
        <View>
          <Text className='font-bold text-xl'>{postCount}</Text>
          <Text>Posts</Text>
        </View>
      </View>

      {/*Section for bio and edit profile button*/}
      <View className='pt-2 gap-2 flex-col'>
        <View>
          <Text testID='bio'>{displayText}</Text>
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
        <TouchableOpacity
          testID='edit-profile-button'
          className='bg-gray-800 w-[24%] p-2 rounded-lg'
          onPress={() => router.push('/editProfile')}
        >
          <Text className='text-white'>Edit profile</Text>
        </TouchableOpacity>
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
