import { supabase } from './supabase/supabase';
import { Tables } from './supabase/types';

export type TPosts = Tables<'posts'>;

export const getPostsCreatedByUser = async (
  user_id: string
): Promise<TPosts[] | null> => {
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
