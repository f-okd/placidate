import { router } from 'expo-router';

import { supabase } from './client';
import { TProfile } from '@/utils/types';
import { showToast } from '@/utils/helpers';

export const PLACIDATE_SERVER_BASE_URL = 'http://10.0.2.2:8000';
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;

class SupabaseUserEndpoint {
  async getUserFollowCounts(
    user_id: string
  ): Promise<{ followers: number; following: number }> {
    const [{ count: followers }, { count: following }] = await Promise.all([
      supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', user_id),
      supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', user_id),
    ]);

    return {
      followers: followers || 0,
      following: following || 0,
    };
  }

  async searchForUsers(
    currentlyAuthenticatedUser: string,
    searchTerm: string
  ): Promise<TProfile[]> {
    try {
      // Get blocks
      const { data: blocks, error: blocksError } = await supabase
        .from('blocks')
        .select('blocker_id, blocked_id');

      if (blocksError) {
        console.error('Error fetching blocks:', blocksError);
        return [];
      }

      // Create Sets
      const blockedUsers = new Set(
        blocks
          ?.filter((block) => block.blocker_id === currentlyAuthenticatedUser)
          .map((block) => block.blocked_id)
      );
      const blockedByUsers = new Set(
        blocks
          ?.filter((block) => block.blocked_id === currentlyAuthenticatedUser)
          .map((block) => block.blocker_id)
      );

      // Get users
      const { data, error } = await supabase
        .from('profiles')
        .select()
        .ilike('username', `%${searchTerm}%`);

      if (error) {
        console.error('Error searching for users:', error);
        return [];
      }

      // Filter users based on blocks
      return (
        data.filter((profile) => {
          const isBlocked = blockedUsers.has(profile.id);
          const isBlockedBy = blockedByUsers.has(profile.id);
          return !isBlocked && !isBlockedBy;
        }) || []
      );
    } catch (error) {
      console.error('Error in searchForUsers:', error);
      return [];
    }
  }

  async changeUsername(userId: string, newUsername: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username: newUsername })
        .eq('id', userId);

      if (error) {
        console.error('Error changing username:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Unexpected error in changeUsername:', error);
      return false;
    }
  }

  async updateBio(userId: string, newBio: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ bio: newBio })
        .eq('id', userId);

      if (error) {
        console.error('Error changing bio:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Unexpected error in updateBio function:', error);
      return false;
    }
  }
  async changePassword(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      if (
        error.message ==
        'New password should be different from the old password.'
      ) {
        return showToast(
          'New password should be different from the old password.'
        );
      } else {
        return console.error('Error changing password:', {
          operation: 'change_password',
          error,
        });
      }
    }

    router.replace('/');
  }

  async deleteAccount(userId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${PLACIDATE_SERVER_BASE_URL}/api/users/${userId}/delete`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Delete account response:', data);
      return data.success;
    } catch (error) {
      console.error('Error:', error);
      return false;
    }
  }

  async saveProfilePicture(
    user_id: string,
    imageUri: string
  ): Promise<boolean> {
    // 1. Prepare image as form data object
    const fileName = imageUri?.split('/').pop();
    const type = `image/${fileName?.split('/').pop()}`;

    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type,
      name: fileName as string,
    } as any);

    const fileNameToSaveAs: string = `avatar-${user_id}-${Math.random()}`;

    // 2. Remove existing image from storage bucket
    await this.removeProfilePictureFromStorage(user_id);
    // 3. Upload image to storage bucket
    const { error: storageError } = await supabase.storage
      .from('avatars')
      .upload(fileNameToSaveAs, formData);

    if (storageError) throw new Error(storageError.message);

    // 2. Update avatar reference in the user's record after successfully uploading image
    await this.updateAvatarProfileReference(user_id, fileNameToSaveAs);
    return true;
  }

  async removeProfilePicture(
    userId: string,
    alreadyHasProfilePicture: boolean
  ): Promise<boolean> {
    if (alreadyHasProfilePicture) {
      await this.removeProfilePictureFromStorage(userId);
    }
    await this.updateAvatarProfileReference(userId, null);
    return true;
  }

  private async removeProfilePictureFromStorage(
    userId: string
  ): Promise<boolean> {
    const { data: avatars, error: avatarListError } = await supabase.storage
      .from('avatars')
      .list('', {
        search: `avatar-${userId}-`,
      });

    if (avatarListError) {
      console.error(`Error listing avatars for user ${userId}`);
      return false;
    }
    // Should only ever return one value
    if (avatars && avatars.length > 0) {
      const { error: avatarDeleteError } = await supabase.storage
        .from('avatars')
        .remove([avatars[0].name]);

      if (avatarDeleteError) {
        console.error(`Error deleting user ${userId}'s avatar:`);
        return false;
      }
    }
    return true;
  }

  private async updateAvatarProfileReference(
    userId: string,
    fileNameToSaveAs: string | null
  ) {
    const { error } = await supabase
      .from('profiles')
      .update({
        avatar_url: fileNameToSaveAs
          ? `${SUPABASE_URL}/storage/v1/object/public/avatars/${fileNameToSaveAs}`
          : null,
      })
      .eq('id', userId);

    if (error)
      throw new Error(
        `Error updating avatar referece for user: ${userId} \n ${error.message}`
      );
    return true;
  }

  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) return console.error(error);
    return data;
  }

  async getFollowers(userId: string): Promise<TProfile[]> {
    try {
      // Get all users who follow the specified user
      const { data, error } = await supabase
        .from('follows')
        .select(
          `
          follower:profiles!follows_follower_id_fkey (
            id,
            username,
            avatar_url,
            bio,
            is_private,
            updated_at
          )
        `
        )
        .eq('following_id', userId)
        .eq('status', 'accepted');

      if (error) {
        console.error('Error fetching followers:', error);
        return [];
      }

      return (data?.map((item) => item.follower) as TProfile[]) || [];
    } catch (error) {
      console.error('Error in getFollowers:', error);
      return [];
    }
  }

  async getFollowing(userId: string): Promise<TProfile[]> {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select(
          `
          following:profiles!follows_following_id_fkey (
            id,
            username,
            avatar_url,
            bio,
            is_private,
            updated_at
          )
        `
        )
        .eq('follower_id', userId)
        .eq('status', 'accepted');

      if (error) {
        console.error('Error fetching following:', error);
        return [];
      }

      return (data?.map((item) => item.following) as TProfile[]) || [];
    } catch (error) {
      console.error('Error in getFollowing:', error);
      return [];
    }
  }

  async userExists(username: string): Promise<boolean> {
    try {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('username', username);

      if (error) {
        console.error('Error checking username existence:', error);
        return false;
      }

      return count ? count > 0 : false;
    } catch (error) {
      console.error(`Error checking if ${username} is available:`, error);
      return false;
    }
  }
}

export default SupabaseUserEndpoint;
