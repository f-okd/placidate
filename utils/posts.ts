import { supabase } from './supabase/supabase';
import { Database, Tables } from './supabase/types';

export type TComments = Tables<'comments'>;
export type TProfile = Tables<'profiles'>;

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
