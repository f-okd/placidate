import Header from '@/components/Header';
import { useAuth } from '@/providers/AuthProvider';
import { showToast } from '@/utils/helpers';
import { changeUsername, TProfile, updateBio } from '@/utils/users';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function EditProfile() {
  const router = useRouter();
  const { profile: uncastedProfile, refreshProfile } = useAuth();
  const activeProfile = uncastedProfile as TProfile;

  const [newUsername, setNewUsername] = useState(activeProfile?.username || '');
  const [newBio, setNewBio] = useState(activeProfile?.bio || '');
  const [loading, setLoading] = useState(false);

  const handleUsernameChange = async () => {
    if (newUsername.trim() === activeProfile.username) {
      showToast('Please enter a new username');
      return;
    }

    if (newUsername.length < 3) {
      showToast('Username must be at least 3 characters long');
      return;
    }

    setLoading(true);
    try {
      await changeUsername(activeProfile.id, newUsername.trim());
      await refreshProfile();
      showToast('Username updated successfully');
    } catch (error) {
      showToast('Failed to update username');
    } finally {
      setLoading(false);
    }
  };

  const handleBioChange = async () => {
    setLoading(true);
    try {
      await updateBio(activeProfile.id, newBio.trim());
      await refreshProfile();
      showToast('Username updated successfully');
    } catch (error) {
      showToast('Failed to update username');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className='flex-1 bg-white'>
      <Header
        title='Edit Profile'
        showBackIcon={false}
        showNotificationIcon={false}
      />
      <View className='px-4 pb-6'>
        {/* Username Section */}
        <View className='mb-6'>
          <Text className='text-gray-600 mb-2'>Username</Text>
          <TextInput
            className='border border-gray-300 rounded-lg p-3 mb-2'
            value={newUsername}
            onChangeText={setNewUsername}
            placeholder='Enter new username'
          />
          <TouchableOpacity
            className='bg-purple-200 rounded-lg p-3'
            onPress={handleUsernameChange}
            disabled={loading}
          >
            <Text className='text-white text-center font-semibold'>
              Update Username
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bio Section */}
        <View className='mb-6'>
          <Text className='text-gray-600 mb-2'>Profile Bio</Text>
          <TextInput
            className='border border-gray-300 rounded-lg p-3 mb-2 min-h-[200]'
            value={newBio}
            onChangeText={setNewBio}
            placeholder='Enter new profile bio'
            textAlignVertical='top'
            multiline
            numberOfLines={5}
            maxLength={200}
          />
          <TouchableOpacity
            className='bg-purple-200 rounded-lg p-3'
            onPress={handleBioChange}
            disabled={loading}
          >
            <Text className='text-white text-center font-semibold'>
              Update Bio
            </Text>
          </TouchableOpacity>
        </View>

        {/* Back Button */}
        <TouchableOpacity
          className='mt-4 p-3'
          onPress={() => router.back()}
          disabled={loading}
        >
          <Text className='text-blue-500 text-center font-semibold'>
            Back to Profile
          </Text>
        </TouchableOpacity>

        {/* Loading Indicator */}
        {loading && (
          <View className='absolute inset-0 bg-black/30 items-center justify-center'>
            <ActivityIndicator size='large' color='#0000ff' />
          </View>
        )}
      </View>
    </View>
  );
}
