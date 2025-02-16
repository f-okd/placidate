import { Tables } from '@/lib/supabase/types';

export type TProfile = Tables<'profiles'>;

export type TComments = Tables<'comments'>;

export type TPost = Tables<'posts'>;

export type TCommentsAndAuthors = TComments & {
  profiles: TProfile | null;
  deletable: boolean;
};

export type TGetHomePagePost = {
  author_id: string;
  body: string;
  created_at: string;
  description: string | null;
  id: string;
  post_tags: Array<{
    tag_id: string;
    tags: {
      name: string;
    } | null;
  }>;
  post_type: string;
  profiles: {
    avatar_url: string | null;
    id: string;
    username: string;
  } | null;
  title: string;
  updated_at: string | null;
};
