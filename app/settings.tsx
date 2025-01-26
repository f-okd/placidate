import Header from '@/components/Header';
import { useAuth } from '@/providers/AuthProvider';
import { showToast } from '@/utils/helpers';
import { changePassword, deleteAccount, TProfile } from '@/utils/users';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import RadioGroup, { RadioButtonProps } from 'react-native-radio-buttons-group';

export default function Settings() {
  const router = useRouter();
  const { profile: uncastedProfile, signOut } = useAuth();
  const activeProfile = uncastedProfile as TProfile;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedPrivacyOptionId, setSelectedPrivacyOptionId] =
    useState<string>('1');
  const [loading, setLoading] = useState(false);

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

  const radioButtons: RadioButtonProps[] = useMemo(
    () => [
      {
        id: '1',
        label: 'Anyone',
        value: 'public',
        containerStyle: { alignItems: 'flex-start', alignSelf: 'flex-start' },
      },
      {
        id: '2',
        label: 'People that follow me',
        value: 'private',
        containerStyle: { alignItems: 'flex-start', alignSelf: 'flex-start' },
      },
    ],
    []
  );

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
        title='Settings and Activity'
        showNotificationIcon={false}
        showBackIcon={false}
      />
      <View className='px-4 pb-6'>
        {/*Screen Header*/}

        {/*Go to bookmarks*/}
        <TouchableOpacity
          className='bg-gray-500 rounded-lg my-4 p-3'
          onPress={() => router.push('/bookmarks')}
          disabled={loading}
        >
          <Text className='text-white text-center font-semibold'>
            Manage Bookmarked Posts
          </Text>
        </TouchableOpacity>

        {/*Go to blocked users*/}
        <TouchableOpacity
          className='bg-gray-500 rounded-lg my-4 p-3'
          onPress={() => router.push('/blockedUsers')}
          disabled={loading}
        >
          <Text className='text-white text-center font-semibold'>
            Manage Blocked Users
          </Text>
        </TouchableOpacity>

        {/*TODO: Implement post visibility functionality */}
        {/*Manage Post visibility */}
        <Text className='text-lg mt-4'>Who can view your posts?</Text>
        <RadioGroup
          radioButtons={radioButtons}
          onPress={setSelectedPrivacyOptionId}
          selectedId={selectedPrivacyOptionId}
          containerStyle={{ alignItems: 'flex-start', width: '100%' }}
        />

        <Text className='text-2xl font-bold mt-10 mb-6'>Account Settings</Text>
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

        {/* Sign Out Button */}
        <TouchableOpacity
          className='mt-4 p-3'
          onPress={() => signOut()}
          disabled={loading}
        >
          <Text className='text-blue-500 text-center font-semibold'>
            Sign Out
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
