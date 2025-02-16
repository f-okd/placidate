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
  StyleSheet,
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
  const [image, setImage] = useState<string | null>(null);

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
      await userEndpoint.saveProfilePicture(activeProfile.id, photo.uri);
      await refreshProfile();
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
      refreshProfile();
    }
    setLoading(false);
  };

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
      await userEndpoint.changeUsername(activeProfile.id, newUsername.trim());
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
      await userEndpoint.updateBio(activeProfile.id, newBio.trim());
      await refreshProfile();
      showToast('Username updated successfully');
    } catch (error) {
      showToast('Failed to update username');
    } finally {
      setLoading(false);
    }
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
            <Image
              source={{ uri: image }}
              className='w-[150] h-[150] rounded-full'
            />
          ) : (
            <Image
              source={imageToDisplay}
              className='w-[150] h-[150] rounded-full'
            />
          )}
          <TouchableOpacity
            className='text-xl mt-1 text-gray-600 mb-2'
            onPress={pickImage}
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
      </View>
    </View>
  );
}

const editProfilePictureImageStyle = {
  width: 100,
  height: 100,
  borderRadius: 20,
  borderWidth: 2,
  borderColor: 'black',
  margin: 4,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 200,
    height: 200,
  },
});
