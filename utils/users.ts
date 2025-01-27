import { router } from 'expo-router';
import { TPost } from './posts';
import { supabase } from './supabase/supabase';
import { Tables } from './supabase/types';

const PLACIDATE_SERVER_BASE_URL = 'http://10.0.2.2:8000';
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;

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
      console.error('Error changing username:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error in changeUsername:', error);
    return false;
  }
};

export const updateBio = async (
  userId: string,
  newBio: string
): Promise<boolean> => {
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
};

export const saveImage = async (
  user_id: string,
  imageUri: string
): Promise<boolean> => {
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
  await removeProfilePictureFromStorage(user_id);
  // 3. Upload image to storage bucket
  const { error: storageError } = await supabase.storage
    .from('avatars')
    .upload(fileNameToSaveAs, formData);

  if (storageError) throw new Error(storageError.message);

  // 2. Update avatar reference in the user's record after successfully uploading image
  await updateAvatarProfileReference(user_id, fileNameToSaveAs);
  return true;
};

export const removeProfilePicture = async (
  userId: string,
  alreadyHasProfilePicture: boolean
) => {
  if (alreadyHasProfilePicture) {
    await removeProfilePictureFromStorage(userId);
  }
  await updateAvatarProfileReference(userId, null);
};

export const removeProfilePictureFromStorage = async (
  userId: string
): Promise<boolean> => {
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
};

const updateAvatarProfileReference = async (
  userId: string,
  fileNameToSaveAs: string | null
) => {
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
};
