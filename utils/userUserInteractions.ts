import { supabase } from './supabase/supabase';
import { TProfile } from './users';

export const followUser = async (
  followerUserId: string,
  followingUserId: string
) => {
  const { data, error } = await supabase.from('follows').insert({
    follower_id: followerUserId,
    following_id: followingUserId,
    status: 'accepted',
  });
};

export const unFollowUser = async (
  followerUserId: string,
  followingUserId: string
) => {
  const { data, error } = await supabase.from('follows').insert({
    follower_id: followerUserId,
    following_id: followingUserId,
    status: 'accepted',
  });
};

export const userIsFollowing = async (
  followerUserId: string,
  followingUserId: string
): Promise<boolean> => {
  const { count, error } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', followerUserId)
    .eq('following_id', followingUserId);

  if (error) {
    console.error(
      `Error checking if user ${followerUserId} follows user ${followingUserId}:`,
      error.message
    );
    return false;
  }

  return count ? count > 0 : false;
};

export const unfollowUser = async (
  followerUserId: string,
  followingUserId: string
) => {
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', followerUserId)
    .eq('following_id', followingUserId);

  if (error) {
    console.error(
      `Error unfollowing user ${followingUserId} by user ${followerUserId}:`,
      error.message
    );
  }
};

export const blockUser = async (
  blockerUserId: string,
  blockedUserId: string
) => {
  const { error } = await supabase.from('blocks').insert({
    blocker_id: blockerUserId,
    blocked_id: blockedUserId,
  });

  if (error) {
    console.error(
      `Error blocking user ${blockedUserId} by user ${blockerUserId}:`,
      error.message
    );
    throw error;
  }

  // remove follow relationship after blocking
  await supabase
    .from('follows')
    .delete()
    .or(
      `follower_id.eq.${blockerUserId},following_id.eq.${blockedUserId},follower_id.eq.${blockedUserId},following_id.eq.${blockerUserId}`
    );
};

export const unblockUser = async (
  blockerUserId: string,
  blockedUserId: string
) => {
  const { error } = await supabase
    .from('blocks')
    .delete()
    .eq('blocker_id', blockerUserId)
    .eq('blocked_id', blockedUserId);

  if (error) {
    throw new Error(
      `Error unblocking user ${blockedUserId} by user ${blockerUserId}:` +
        error.message
    );
  }
};

export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) return console.error(error);
  return data;
};

export const getBlockedUsers = async (userId: string): Promise<TProfile[]> => {
  const { data, error } = await supabase
    .from('blocks')
    .select(
      `
      blocked:profiles!blocks_blocked_id_fkey (
        id,
        username,
        avatar_url,
        bio,
        is_private,
        updated_at
      )
    `
    )
    .eq('blocker_id', userId);

  if (error) {
    console.error(`Error fetching blocked users for user: ${userId}`, error);
    return [];
  }

  return (data?.map((block) => block.blocked) as TProfile[]) || [];
};
