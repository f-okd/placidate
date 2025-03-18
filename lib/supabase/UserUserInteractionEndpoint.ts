import { MessageRecord, TProfile } from '@/utils/types';
import { supabase } from './client';

class SupabaseUserUserInteractionEndpoint {
  async followUser(
    followerUserId: string,
    followingUserId: string
  ): Promise<void> {
    const { data, error } = await supabase.from('follows').insert({
      follower_id: followerUserId,
      following_id: followingUserId,
      status: 'accepted',
    });
  }

  async unfollowUser(
    followerUserId: string,
    followingUserId: string
  ): Promise<void> {
    console.log(followerUserId, followingUserId);
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
  }

  async userIsFollowing(
    followerUserId: string,
    followingUserId: string
  ): Promise<boolean> {
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
  }

  async blockUser(blockerUserId: string, blockedUserId: string): Promise<void> {
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
  }

  async unblockUser(
    blockerUserId: string,
    blockedUserId: string
  ): Promise<void> {
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
  }

  async getBlockedUsers(userId: string): Promise<TProfile[]> {
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
  }

  async removeFollower(
    currentUserId: string,
    followerToRemoveId: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', followerToRemoveId)
        .eq('following_id', currentUserId);

      if (error) {
        console.error(
          `Error removing follower. Follower: ${followerToRemoveId}, Following: ${currentUserId} `
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error('Unexpected error in removeFollower:', error);
      return false;
    }
  }

  async getChat(
    userId: string,
    recipientId: string,
    limit: number = 50
  ): Promise<MessageRecord[]> {
    console.log(userId, recipientId);
    try {
      // Get messages where user is sender or recipient
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .or(`sender_id.eq.${recipientId},receiver_id.eq.${recipientId}`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching chat messages:', error);
        return [];
      }

      // Filter messages to only include those between these two users
      const filteredMessages = data.filter(
        (message) =>
          (message.sender_id === userId &&
            message.receiver_id === recipientId) ||
          (message.sender_id === recipientId && message.receiver_id === userId)
      );

      // Sort messages by creation date (oldest first)
      return filteredMessages.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    } catch (error) {
      console.error('Error in getChat:', error);
      return [];
    }
  }

  async sendMessage(
    senderId: string,
    recipientId: string,
    body: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase.from('messages').insert({
        sender_id: senderId,
        receiver_id: recipientId,
        body: body,
      });

      if (error) {
        console.error('Error sending message:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in sendMessage:', error);
      return false;
    }
  }
}

export default SupabaseUserUserInteractionEndpoint;
