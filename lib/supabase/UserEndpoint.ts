import { router } from 'expo-router';

import { supabase } from './client';
import { RecentFollowerRecord, TProfile } from '@/utils/types';
import { showToast } from '@/utils/helpers';

const PLACIDATE_SERVER_BASE_URL =
  process.env.NODE_ENV == 'production'
    ? String(process.env.EXPO_PUBLIC_SERVER_BASE_URL)
    : 'http://10.0.2.2:8000';
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
        if ((error as any).code == 23505) {
          showToast('That username is not available');
          return false;
        }
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
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData?.session?.access_token) {
        console.error('No active session found');
        return false;
      }

      const response = await fetch(
        `${PLACIDATE_SERVER_BASE_URL}/api/users/${userId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionData.session.access_token}`,
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

  async canViewUserContent(
    viewerId: string,
    targetUserId: string
  ): Promise<boolean> {
    // Self can always view own content
    if (viewerId === targetUserId) return true;
    try {
      // Get target user's privacy setting
      const { data: targetProfile, error: profileError } = await supabase
        .from('profiles')
        .select('is_private')
        .eq('id', targetUserId)
        .single();

      if (profileError || !targetProfile) {
        console.error('Error checking user privacy:', profileError);
        return false;
      }
      // If profile is public, anyone can view
      if (!targetProfile.is_private) return true;

      // If profile is private, check if they mutually follow each other
      // First check if viewer follows target
      const { data: viewerFollowsTarget, error: followError1 } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', viewerId)
        .eq('following_id', targetUserId)
        .single();

      if (followError1) {
        if ((followError1 as any).code === 'PGRST116') {
          // No relationship found
          return false;
        }
        console.error('Error checking if viewer follows target:', followError1);
        return false;
      }

      // Then check if target follows viewer (mutual follow)
      const { data: targetFollowsViewer, error: followError2 } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', targetUserId)
        .eq('following_id', viewerId)
        .single();

      if (followError2) {
        if ((followError2 as any).code === 'PGRST116') {
          // No relationship found
          return false;
        }
        console.error('Error checking if target follows viewer:', followError2);
        return false;
      }

      // Return true only if they mutually follow each other
      return !!viewerFollowsTarget && !!targetFollowsViewer;
    } catch (error) {
      console.error('Unexpected error in canViewUserContent:', error);
      return false;
    }
  }

  async getRecentFollowers(
    userId: string,
    limit: number = 20
  ): Promise<RecentFollowerRecord[]> {
    try {
      // Get all users who follow the specified user with the timestamp of when they followed
      const { data, error } = await supabase
        .from('follows')
        .select(
          `
        created_at, 
        follower:profiles!follows_follower_id_fkey (
          id, 
          username, 
          avatar_url, 
          bio, 
          is_private
        )
      `
        )
        .eq('following_id', userId)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching recent followers:', error);
        return [];
      }

      // Format and filter followers
      const formattedFollowers = data
        .filter((item) => item.follower)
        .map((item) => ({
          ...item.follower,
          created_at: item.created_at, // Add the created_at from the follows table
        }));

      return formattedFollowers;
    } catch (error) {
      console.error('Error in getRecentFollowers:', error);
      return [];
    }
  }

  async getFriends(userId: string): Promise<TProfile[]> {
    try {
      // First, get users who the current user follows
      const { data: following, error: followingError } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId)
        .eq('status', 'accepted');

      if (followingError) {
        console.error('Error fetching following list:', followingError);
        return [];
      }

      if (!following || following.length === 0) {
        // If the user doesn't follow anyone, they can't have mutual followers
        return [];
      }

      // Get the IDs of users the current user follows
      const followingIds = following.map((f) => f.following_id);

      // Now find users who follow the current user AND are followed by the current user
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
        .eq('following_id', userId) // They follow the current user
        .in('follower_id', followingIds) // The current user follows them back
        .eq('status', 'accepted');

      if (error) {
        console.error('Error fetching mutual followers:', error);
        return [];
      }

      const friends = (data?.map((item) => item.follower) as TProfile[]) || [];

      return friends;
    } catch (error) {
      console.error('Error in getFriends:', error);
      return [];
    }
  }

  async getFriendsThatCanSeePost(userId: string, postId: string) {
    const { data: postData, error: postError } = await supabase
      .from('posts')
      .select('author_id, profiles!posts_author_id_fkey(is_private)')
      .eq('id', postId)
      .single();

    if (postError) {
      console.error(
        'Error fetching getting friends that can see post:',
        postError
      );
      return [];
    }

    const postAuthorId = postData.author_id;
    const isAuthorPrivate = postData.profiles?.is_private;

    // 1. Get all current user's friends
    const friends = await this.getFriends(userId);

    if (!friends || friends.length === 0) {
      return [];
    }

    const friendIds = friends.map((friend) => friend.id);

    // 2. Get blocks between post author and friends
    const { data: blocks, error: blocksError } = await supabase
      .from('blocks')
      .select('blocker_id, blocked_id')
      .or(`blocker_id.eq.${postAuthorId},blocked_id.eq.${postAuthorId}`)
      .in('blocked_id', friendIds.concat([postAuthorId]))
      .in('blocker_id', friendIds.concat([postAuthorId]));

    if (blocksError) {
      console.error('Error fetching blocks:', blocksError);
      return [];
    }

    const blockedByAuthor = new Set(
      (blocks || [])
        .filter((block) => block.blocker_id === postAuthorId)
        .map((block) => block.blocked_id)
    );

    const blockingAuthor = new Set(
      (blocks || [])
        .filter((block) => block.blocked_id === postAuthorId)
        .map((block) => block.blocker_id)
    );

    let eligibleFriends = friends.filter(
      (friend) =>
        !blockedByAuthor.has(friend.id) && !blockingAuthor.has(friend.id)
    );

    // 3. If author has a private account, only show to mutual followers
    if (isAuthorPrivate && userId !== postAuthorId) {
      const { data: authorFollowers, error: followersError } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('following_id', postAuthorId)
        .eq('status', 'accepted');

      if (followersError) {
        console.error('Error fetching author followers:', followersError);
        return [];
      }

      const { data: authorFollowing, error: followingError } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', postAuthorId)
        .eq('status', 'accepted');

      if (followingError) {
        console.error('Error fetching author following:', followingError);
        return [];
      }

      const followerIds = new Set(
        (authorFollowers || []).map((f) => f.follower_id)
      );
      const followingIds = new Set(
        (authorFollowing || []).map((f) => f.following_id)
      );

      const authorMutualIds = new Set(
        [...followerIds].filter((id) => followingIds.has(id))
      );

      eligibleFriends = eligibleFriends.filter(
        (friend) => friend.id === postAuthorId || authorMutualIds.has(friend.id)
      );
    }

    return eligibleFriends;
  }

  async getFriendsInOrderOfRecentMessaging(userId: string): Promise<
    {
      friend: TProfile;
      lastMessage: {
        body: string;
        created_at: string;
        is_post_share: boolean;
      } | null;
    }[]
  > {
    try {
      const friends = await this.getFriends(userId);

      if (friends.length === 0) return [];

      const friendIds = friends.map((friend) => friend.id);

      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .in('sender_id', [...friendIds, userId])
        .in('receiver_id', [...friendIds, userId]);

      if (messageError) {
        console.error('Error fetching messages:', messageError);
        return friends.map((friend) => ({ friend, lastMessage: null }));
      }

      const friendMessageMap = new Map();

      messageData.forEach((message) => {
        const friendId =
          message.sender_id === userId
            ? message.receiver_id
            : message.sender_id;

        if (!friendIds.includes(friendId)) return;

        if (
          !friendMessageMap.has(friendId) ||
          new Date(message.created_at) >
            new Date(friendMessageMap.get(friendId).created_at)
        ) {
          friendMessageMap.set(friendId, {
            body: message.body,
            created_at: message.created_at,
            is_post_share: message.body.includes('{{post:'),
            sender_id: message.sender_id,
          });
        }
      });

      const result = friends.map((friend) => ({
        friend,
        lastMessage: friendMessageMap.get(friend.id) || null,
      }));

      // Sort by most recent message
      return result.sort((a, b) => {
        // Friends with no messages go to the bottom
        if (!a.lastMessage) return 1;
        if (!b.lastMessage) return -1;

        // Sort by message timestamp, most recent first
        return (
          new Date(b.lastMessage.created_at).getTime() -
          new Date(a.lastMessage.created_at).getTime()
        );
      });
    } catch (error) {
      console.error('Error in getFriendsInOrderOfRecentMessaging:', error);
      return [];
    }
  }

  async toggleAccountPrivacy(
    userId: string,
    selectedId: string
  ): Promise<boolean> {
    const { error } = await supabase
      .from('profiles')
      .update({ is_private: selectedId == '1' ? false : true })
      .eq('id', userId);

    if (error) {
      console.error('Error updating privacy settings:', error);
      showToast('Failed to update privacy settings');
      return false;
    }

    return true;
  }

  async toggleBookmarkPrivacy(
    userId: string,
    visibility: string
  ): Promise<boolean> {
    const { error } = await supabase
      .from('profiles')
      .update({ bookmark_visibility: visibility })
      .eq('id', userId);

    if (error) {
      console.error('Error updating privacy settings:', error);
      showToast('Failed to update privacy settings');
      return false;
    }

    return true;
  }
}

export default SupabaseUserEndpoint;
