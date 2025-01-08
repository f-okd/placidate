import { supabase } from './supabase/supabase';
import { Tables } from './supabase/types';
import { TProfile } from './users';

export type TComments = Tables<'comments'>;
export type TPost = Tables<'posts'>;

export type TCommentsAndAuthors = TComments & {
  profiles: TProfile | null;
  deletable: boolean;
};

export const getCommentsAndAuthors = async (
  currentlyAuthenticatedUser: string,
  post_id: string
): Promise<TCommentsAndAuthors[] | null> => {
  const { data, error } = await supabase
    .from('comments')
    .select('*,profiles(*)')
    .eq('post_id', post_id);

  if (error) {
    console.error(error.message);
    return null;
  }
  if (!data) {
    console.error(`Error fetching comments for post: ${post_id}`);
    return null;
  }
  return data.map((commentAndProfileObject) => ({
    ...commentAndProfileObject,
    deletable:
      commentAndProfileObject.profiles?.id == currentlyAuthenticatedUser ||
      commentAndProfileObject.user_id == currentlyAuthenticatedUser,
  }));
};

export const searchForPosts = async (
  searchTerm: string
): Promise<TPost[] | []> => {
  const { data, error } = await supabase
    .from('posts')
    .select()
    .ilike('title', `%${searchTerm}%`);

  if (error) {
    console.error('Error searching for a post:', error);
  }
  return data || [];
};

export const searchForPostsByTag = async (
  searchTerm: string
): Promise<TPost[] | []> => {
  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select(
        `
        *,
        post_tags!inner(
          tags!inner(
            name
          )
        )
      `
      )
      .ilike('post_tags.tags.name', `%${searchTerm}%`);

    if (error) {
      throw error;
    }
    return posts || [];
  } catch (error) {
    console.error('Error searching for posts by tag:', error);
    return [];
  }
};
export { TProfile };
