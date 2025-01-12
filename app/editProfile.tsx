import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import {
  changePassword,
  changeUsername,
  deleteAccount,
  TProfile,
} from '@/utils/users';
import { showToast } from '@/utils/helpers';

export default function EditProfile() {
  const router = useRouter();
  const { profile: uncastedProfile, refreshProfile } = useAuth();
  const activeProfile = uncastedProfile as TProfile;

  const [newUsername, setNewUsername] = useState(activeProfile?.username || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUsernameChange = async () => {
    if (newUsername.trim() === activeProfile.username) {
      showToast('Please enter a different username');
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

  const handlePasswordChange = async () => {
    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await changePassword(newPassword);
      showToast('Password updated successfully');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      showToast('Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const success = await deleteAccount(activeProfile.id);
              if (success) {
                setLoading(false);
                router.replace('/');
              }
            } catch (error) {
              setLoading(false);
              showToast('Failed to delete account. Try again later');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View className='flex-1 bg-white'>
      <View className='px-4 py-6'>
        <Text className='text-2xl font-bold mb-6'>Edit Profile</Text>

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

        {/* Password Section */}
        <View className='mb-6'>
          <Text className='text-gray-600 mb-2'>Change Password</Text>
          <TextInput
            className='border border-gray-300 rounded-lg p-3 mb-2'
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder='Enter new password'
            secureTextEntry
          />
          <TextInput
            className='border border-gray-300 rounded-lg p-3 mb-2'
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder='Confirm new password'
            secureTextEntry
          />
          <TouchableOpacity
            className='bg-purple-200 rounded-lg p-3'
            onPress={handlePasswordChange}
            disabled={loading}
          >
            <Text className='text-white text-center font-semibold'>
              Update Password
            </Text>
          </TouchableOpacity>
        </View>

        {/* Delete Account Section */}
        <View className='mt-8'>
          <TouchableOpacity
            className='bg-red-500 rounded-lg p-3'
            onPress={handleDeleteAccount}
            disabled={loading}
          >
            <Text className='text-white text-center font-semibold'>
              Delete Account
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
