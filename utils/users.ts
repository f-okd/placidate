import { TPost } from './posts';
import { supabase } from './supabase/supabase';
import { Tables } from './supabase/types';

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
