import Header from '@/components/TopLevelHeader';
import { useAuth } from '@/providers/AuthProvider';
import { showToast } from '@/utils/helpers';
import SupabaseUserEndpoint from '@/lib/supabase/UserEndpoint';
import { TProfile } from '@/utils/types';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

class CustomError extends Error {
  flag = 'X';
}

export default function EditProfile() {
  const router = useRouter();
  const { profile: uncastedProfile, refreshProfile } = useAuth();
  const activeProfile = uncastedProfile as TProfile;

  const [newUsername, setNewUsername] = useState(activeProfile?.username || '');
  const [newBio, setNewBio] = useState(activeProfile?.bio || '');
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState(0);

  const countWords = (text: string): number => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };

  const userEndpoint = new SupabaseUserEndpoint();

  /* Display the active profile's avatar if they have set a profile picture
      If they don't have a profile picture and have not just uploaded a new avatar, display the default avatar
      If they have just uploaded a new avatar, display that image 
  */
  const uploadedImageOrDefault = image
    ? image
    : require('@/assets/images/default-avatar.jpg');

  const imageToDisplay = activeProfile.avatar_url
    ? { uri: activeProfile.avatar_url }
    : uploadedImageOrDefault;

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      cameraType: ImagePicker.CameraType.front,
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0].fileName) {
      const photo = result.assets[0];
      setLoading(true);
      setImage(photo.uri);
      // await refreshProfile();
      setLoading(false);
    } else {
      showToast('Error uploading your profile picture');
    }
  };

  const handleRemoveProfilePicture = async () => {
    setLoading(true);
    const success = await userEndpoint.removeProfilePicture(
      activeProfile.id,
      Boolean(activeProfile.avatar_url || image)
    );
    if (success) {
      refreshProfile(true);
    }
    setLoading(false);
  };

  const handleUsernameChange = async () => {
    if (newUsername.trim() === activeProfile.username) {
      return;
    }

    if (newUsername.length < 4) {
      throw new CustomError('Username must be at least 4 characters long');
    }
    if (newUsername.length > 16) {
      throw new CustomError('Username must be <= 16 characters');
    }

    if (newUsername.indexOf(' ') >= 0)
      throw new CustomError('Username must not contain whitespace.');
    const alphanumeric = /^[\p{sc=Latn}\p{Nd}]*$/u;
    if (!alphanumeric.test(newUsername)) {
      throw new CustomError('Username may only contain letters and numbers');
    }

    setLoading(true);
    try {
      await userEndpoint.changeUsername(activeProfile.id, newUsername.trim());
    } catch (error) {
      throw new CustomError('Failed to update username');
    } finally {
      setLoading(false);
    }
  };

  const handleBioTextChange = (text: string) => {
    const words = text.split(/\s+/);
    if (words.length <= 200) {
      setNewBio(text);
      setWordCount(countWords(text));
    } else {
      // Truncate to 200 words
      const truncatedText = words.slice(0, 200).join(' ');
      setNewBio(truncatedText);
      setWordCount(200);
      showToast('Bio cannot exceed 200 words');
    }
  };

  // Separate submit handler for the button
  const handleBioSubmit = async () => {
    await userEndpoint.updateBio(activeProfile.id, newBio.trim());
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      showToast('Updating profile...');
      await handleUsernameChange();
      await handleBioSubmit();
      image && (await userEndpoint.saveProfilePicture(activeProfile.id, image));
      await refreshProfile();
    } catch (error) {
      if (error instanceof CustomError) {
        showToast(error.message);
      } else {
        showToast('Failed to update bio:');
      }
      return;
    } finally {
      setLoading(false);
    }
    showToast('Profile  updated successfully');
  };

  if (loading) {
    return (
      <View className='absolute inset-0 bg-black/30 items-center justify-center'>
        <ActivityIndicator size='large' color='#0000ff' />
      </View>
    );
  }
  return (
    <View className='flex-1 bg-white'>
      <Header
        title='Edit Profile'
        showBackIcon={false}
        showNotificationIcon={false}
      />
      <View className='px-4 pb-6'>
        {/*Avatar section */}
        <View className='mb-6 items-center'>
          {image ? (
            <Image source={{ uri: image }} className='w-40 h-40 rounded-full' />
          ) : (
            <Image source={imageToDisplay} className='w-40 h-40 rounded-full' />
          )}
          <TouchableOpacity
            className='text-xl mt-1 text-gray-600 mb-2'
            onPress={pickImage}
            disabled={loading}
          >
            <Text>Upload new avatar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className='text-xl mt-1 text-gray-600 mb-2'
            onPress={() => handleRemoveProfilePicture()}
          >
            <Text className='text-red-800'>Remove avatar</Text>
          </TouchableOpacity>
        </View>

        {/* Username Section */}
        <View className='mb-6'>
          <Text className='text-gray-600 mb-2'>Username</Text>
          <TextInput
            className='border border-gray-300 rounded-lg p-3 mb-2'
            value={newUsername}
            onChangeText={setNewUsername}
            placeholder='Enter new username'
            maxLength={16}
          />
        </View>

        {/* Bio Section */}
        <View className='mb-6'>
          <Text className='text-gray-600 mb-2'>Profile Bio</Text>
          <TextInput
            className='border border-gray-300 rounded-lg p-3 mb-2 min-h-[200]'
            value={newBio}
            onChangeText={handleBioTextChange}
            placeholder='Enter new profile bio (200 words max)'
            textAlignVertical='top'
            multiline
            numberOfLines={15}
          />
        </View>

        <TouchableOpacity
          className='bg-purple-200 rounded-lg p-3'
          onPress={handleSaveChanges}
          disabled={loading}
        >
          <Text className='text-white text-center font-semibold'>
            Update Profile
          </Text>
        </TouchableOpacity>
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
      </View>
    </View>
  );
}
