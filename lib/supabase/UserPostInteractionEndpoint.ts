import { ActivityRecord, TPost } from '@/utils/types';
import { supabase } from './client';

class SupabaseUserPostInteractionEndpoint {
  async addComment(
    sender_id: string,
    post_id: string,
    comment: string
  ): Promise<void> {
    const { error } = await supabase
      .from('comments')
      .insert({ user_id: sender_id, post_id: post_id, body: comment });

    if (error) {
      console.error(
        `Error posting comment: ${comment} from user: ${sender_id} on post: ${post_id}`
      );
    }
  }

  // user should be able to delete any comment written by them
  // user should be able to delete any comment on their posts
  async deleteComment(comment_id: string): Promise<boolean> {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', comment_id);

    if (error) {
      console.error(`Error deleting comment ${comment_id}`);
      return false;
    }

    return true;
  }

  async postIsLikedByUser(post_id: string, user_id: string): Promise<boolean> {
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
  }

  async likePost(post_id: string, user_id: string): Promise<void> {
    const { error } = await supabase.from('likes').insert({ post_id, user_id });

    if (error) {
      console.error('Error unliking post: ', post_id, 'as user: ', user_id);
    }
  }

  async unlikePost(post_id: string, user_id: string): Promise<void> {
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('post_id', post_id)
      .eq('user_id', user_id);

    if (error) {
      console.error('Error unliking post: ', post_id, 'as user: ', user_id);
    }
  }

  async getBookmarks(userId: string): Promise<TPost[]> {
    const { data, error } = await supabase
      .from('bookmarks')
      .select(`posts (*) `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Error searching for user: ${userId}\'s bookmarks`);
    }
    return (data?.map((bookmark) => bookmark.posts) as TPost[]) || [];
  }

  async postIsBookmarkedByUser(
    post_id: string,
    user_id: string
  ): Promise<boolean> {
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
  }

  async bookmarkPost(userId: string, postId: string) {
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
  }
  async unbookmarkPost(userId: string, postId: string) {
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
  }

  async getRecentActivity(
    userId: string,
    limit: number = 20
  ): Promise<ActivityRecord[]> {
    try {
      // Get likes on user's posts
      const { data: likes, error: likesError } = await supabase
        .from('likes')
        .select(
          `
        created_at,
        user_id,
        post_id,
        profiles!likes_user_id_fkey(id, username, avatar_url),
        posts(id, title, post_type, author_id)
      `
        )
        .eq('posts.author_id', userId)
        .order('created_at', { ascending: false });

      if (likesError) {
        console.error('Error fetching likes activity:', likesError);
        return [];
      }

      // Get comments on user's posts
      const { data: comments, error: commentsError } = await supabase
        .from('comments')
        .select(
          `
        id,
        created_at,
        user_id,
        post_id,
        body,
        profiles!comments_user_id_fkey(id, username, avatar_url),
        posts(id, title, post_type, author_id)
      `
        )
        .eq('posts.author_id', userId)
        .order('created_at', { ascending: false });

      if (commentsError) {
        console.error('Error fetching comments activity:', commentsError);
        return [];
      }

      // Get bookmarks on user's posts
      const { data: bookmarks, error: bookmarksError } = await supabase
        .from('bookmarks')
        .select(
          `
        created_at,
        user_id,
        post_id,
        profiles!bookmarks_user_id_fkey(id, username, avatar_url),
        posts(id, title, post_type, author_id)
      `
        )
        .eq('posts.author_id', userId)
        .order('created_at', { ascending: false });

      if (bookmarksError) {
        console.error('Error fetching bookmarks activity:', bookmarksError);
        return [];
      }

      // Get blocks to filter out activities from blocked users
      const { data: blocks, error: blocksError } = await supabase
        .from('blocks')
        .select('blocker_id, blocked_id');

      if (blocksError) {
        console.error('Error fetching blocks:', blocksError);
        return [];
      }

      // Create Sets for efficient lookup
      const blockedUsers = new Set(
        blocks
          ?.filter((block) => block.blocker_id === userId)
          .map((block) => block.blocked_id)
      );
      const blockedByUsers = new Set(
        blocks
          ?.filter((block) => block.blocked_id === userId)
          .map((block) => block.blocker_id)
      );

      // Combine and format all activities
      const formattedLikes = likes
        .filter(
          (like) =>
            like.posts &&
            like.posts.author_id === userId &&
            !blockedUsers.has(like.user_id) &&
            !blockedByUsers.has(like.user_id)
        )
        .map((like) => ({
          id: `like_${like.user_id}_${like.post_id}_${new Date(
            like.created_at
          ).getTime()}`,
          type: 'like',
          created_at: like.created_at,
          user: like.profiles,
          post: like.posts,
        }));

      const formattedComments = comments
        .filter(
          (comment) =>
            comment.posts &&
            comment.posts.author_id === userId &&
            !blockedUsers.has(comment.user_id) &&
            !blockedByUsers.has(comment.user_id)
        )
        .map((comment) => ({
          id: comment.id,
          type: 'comment',
          created_at: comment.created_at,
          user: comment.profiles,
          post: comment.posts,
          body: comment.body,
        }));

      const formattedBookmarks = bookmarks
        .filter(
          (bookmark) =>
            bookmark.posts &&
            bookmark.posts.author_id === userId &&
            !blockedUsers.has(bookmark.user_id) &&
            !blockedByUsers.has(bookmark.user_id)
        )
        .map((bookmark) => ({
          id: `bookmark_${bookmark.user_id}_${bookmark.post_id}_${new Date(
            bookmark.created_at
          ).getTime()}`,
          type: 'bookmark',
          created_at: bookmark.created_at,
          user: bookmark.profiles,
          post: bookmark.posts,
        }));

      // Combine all activities
      const allActivities = [
        ...formattedLikes,
        ...formattedComments,
        ...formattedBookmarks,
      ];

      // Sort by date (most recent first) and limit
      return allActivities
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .slice(0, limit);
    } catch (error) {
      console.error('Error in getRecentActivity:', error);
      return [];
    }
  }
}

export default SupabaseUserPostInteractionEndpoint;
