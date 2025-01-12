import { router } from 'expo-router';
import { TPost } from './posts';
import { supabase } from './supabase/supabase';
import { Tables } from './supabase/types';

const API_BASE_URL = 'http://10.0.2.2:8000';

interface ApiError {
  error: string;
}

interface DeleteAccountResponse {
  success: boolean;
}
export type TProfile = Tables<'profiles'>;

export const getPostsCreatedByUser = async (
  user_id: string
): Promise<TPost[] | null> => {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('author_id', user_id);

  if (error) {
    console.error(error);
    return null;
  }

  return data;
};

export const getUserFollowCounts = async (
  user_id: string
): Promise<{ followers: number; following: number }> => {
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
};

export const searchForUsers = async (
  searchTerm: string
): Promise<TProfile[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select()
    .ilike('username', `%${searchTerm}%`);
  if (error) {
    console.error('Error searching for user:');
  }
  return data || [];
};

export const getBookmarks = async (userId: string): Promise<TPost[]> => {
  const { data, error } = await supabase
    .from('bookmarks')
    .select(`posts (*) `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`Error searching for user: ${userId}\'s bookmarks`);
  }
  return (data?.map((bookmark) => bookmark.posts) as TPost[]) || [];
};

export const changeUsername = async (
  userId: string,
  newUsername: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ username: newUsername })
      .eq('id', userId);

    if (error) {
      console.error('Error changing username:', {
        operation: 'change_username',
        error,
        userId,
        attemptedUsername: newUsername,
      });
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error in changeUsername:', {
      operation: 'change_username',
      error,
      userId,
    });
    return false;
  }
};

export const changePassword = async (newPassword: string): Promise<boolean> => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error('Error changing password:', {
        operation: 'change_password',
        error,
      });
      return false;
    }

    router.replace('/');
    return true;
  } catch (error) {
    console.error('Unexpected error in changePassword:', {
      operation: 'change_password',
      error,
    });
    return false;
  }
};

export const deleteAccount = async (userId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

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
};
