import { supabase } from './supabase/supabase';

export const addComment = async (
  sender_id: string,
  post_id: string,
  comment: string
): Promise<void> => {
  const { error } = await supabase
    .from('comments')
    .insert({ user_id: sender_id, post_id: post_id, body: comment });
};

export const postIsLikedByUser = async (
  post_id: string,
  user_id: string
): Promise<boolean> => {
  const { count, error } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', post_id)
    .eq('user_id', user_id);

  if (error) {
    console.error(
      `Error checking if post ${post_id} was liked by user ${user_id}:`,
      error.message
    );
    return false;
  }

  return count ? count > 0 : false;
};

export const likePost = async (
  post_id: string,
  user_id: string
): Promise<void> => {
  const { error } = await supabase.from('likes').insert({ post_id, user_id });

  if (error) {
    console.error('Error unliking post: ', post_id, 'as user: ', user_id);
  }
};

export const unlikePost = async (
  post_id: string,
  user_id: string
): Promise<void> => {
  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('post_id', post_id)
    .eq('user_id', user_id);

  if (error) {
    console.error('Error unliking post: ', post_id, 'as user: ', user_id);
  }
};
