import { supabase } from './supabase/supabase';
import { Tables } from './supabase/types';
import { TProfile } from './users';

export type TComments = Tables<'comments'>;
export type TPost = Tables<'posts'>;

export type TCommentsAndAuthors = TComments & {
  profiles: TProfile | null;
};

export const getCommentsAndAuthors = async (
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
  return data;
};

export const searchForPosts = async (
  searchTerm: string
): Promise<TPost[] | []> => {
  const { data, error } = await supabase
    .from('posts')
    .select()
    .like('body', `%${searchTerm}%`);

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
        posts_tags!inner(
          tags!inner(
            name
          )
        )
      `
      )
      .like('posts_tags.tags.name', `%${searchTerm}%`);

    if (error) {
      throw error;
    }
    return posts || [];
  } catch (error) {
    console.error('Error searching for posts by tag:', error);
    return [];
  }
};
