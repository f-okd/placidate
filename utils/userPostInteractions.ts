import { supabase } from './supabase/supabase';

export const addComment = async (
  sender_id: string,
  post_id: string,
  comment: string
): Promise<void> => {
  const { error } = await supabase
    .from('comments')
    .insert({ user_id: sender_id, post_id: post_id, body: comment });

  if (error) {
    console.error(
      `Error posting comment: ${comment} from user: ${sender_id} on post: ${post_id}`
    );
  }
};

// user should be able to delete any comment written by them
// user should be able to delete any comment on their posts
export const deleteComment = async (comment_id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', comment_id);

  if (error) {
    console.error(`Error deleting comment ${comment_id}`);
    return false;
  }

  return true;
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

export const postIsBookmarkedByUser = async (
  post_id: string,
  user_id: string
): Promise<boolean> => {
  const { count, error } = await supabase
    .from('bookmarks')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', post_id)
    .eq('user_id', user_id);

  if (error) {
    console.error(
      `Error checking if post ${post_id} was bookmarked by user ${user_id}:`,
      error.message
    );
    return false;
  }

  return count ? count > 0 : false;
};

export const bookmarkPost = async (userId: string, postId: string) => {
  const { error } = await supabase.from('bookmarks').insert({
    user_id: userId,
    post_id: postId,
  });

  if (error) {
    console.error(
      `Error bookmarking post ${postId} for user ${userId}:`,
      error
    );
  }
};
export const unbookmarkPost = async (userId: string, postId: string) => {
  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('user_id', userId)
    .eq('post_id', postId);

  if (error) {
    console.error(
      `Error removing bookmark of post ${postId} for user ${userId}:`,
      error.message
    );
  }
};
