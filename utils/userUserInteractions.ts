import { supabase } from './supabase/supabase';

const followUser = async (followerUserId: string, followingUserId: string) => {
  const { data, error } = await supabase.from('follows').insert({
    follower_id: followerUserId,
    following_id: followingUserId,
    status: 'accepted',
  });
};

const unFollowUser = async (
  followerUserId: string,
  followingUserId: string
) => {
  const { data, error } = await supabase.from('follows').insert({
    follower_id: followerUserId,
    following_id: followingUserId,
    status: 'accepted',
  });
};

export const getProfile = async (id: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return console.error(error);
  return data;
};
