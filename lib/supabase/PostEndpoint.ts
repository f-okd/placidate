import { TCommentsAndAuthors, TGetHomePagePost, TPost } from '@/utils/types';
import { supabase } from './client';
import { PLACIDATE_SERVER_BASE_URL } from './UserEndpoint';

class SupabasePostEndpoint {
  async getCommentsAndAuthors(
    currentlyAuthenticatedUser: string,
    post_id: string
  ): Promise<TCommentsAndAuthors[] | null> {
    try {
      // First get the post to determine the author
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .select('author_id')
        .eq('id', post_id)
        .single();

      if (postError) {
        console.error('Error fetching post author:', postError);
        return null;
      }

      const postAuthorId = postData.author_id;

      // Get blocks
      const { data: blocks, error: blocksError } = await supabase
        .from('blocks')
        .select('blocker_id, blocked_id');

      if (blocksError) {
        console.error('Error fetching blocks:', blocksError);
        return null;
      }

      // Create Sets for efficient lookup
      const blockedUsers = new Set(
        blocks
          ?.filter((block) => block.blocker_id === currentlyAuthenticatedUser)
          .map((block) => block.blocked_id)
      );
      const blockedByUsers = new Set(
        blocks
          ?.filter((block) => block.blocked_id === currentlyAuthenticatedUser)
          .map((block) => block.blocker_id)
      );

      // Get comments with profiles
      const { data, error } = await supabase
        .from('comments')
        .select('*, profiles(*)')
        .eq('post_id', post_id);

      if (error) {
        console.error(error.message);
        return null;
      }

      if (!data) {
        console.error(`Error fetching comments for post: ${post_id}`);
        return null;
      }

      // Filter and map the comments
      return data
        .filter(
          (comment) =>
            !blockedUsers.has(comment.user_id) &&
            !blockedByUsers.has(comment.user_id)
        )
        .map((commentAndProfileObject) => ({
          ...commentAndProfileObject,
          deletable:
            commentAndProfileObject.profiles?.id ===
              currentlyAuthenticatedUser ||
            currentlyAuthenticatedUser === postAuthorId,
        }));
    } catch (error) {
      console.error('Error in getCommentsAndAuthors:', error);
      return null;
    }
  }

  async getFollowingPosts(
    currentlyAuthenticatedUser: string
  ): Promise<TGetHomePagePost[] | null> {
    try {
      // Get all users that the current user follows
      const { data: followingRelationships, error: followingError } =
        await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', currentlyAuthenticatedUser)
          .eq('status', 'accepted');

      if (followingError) {
        console.error(
          'Error fetching following relationships:',
          followingError
        );
        return null;
      }

      // If the user doesn't follow anyone, return empty array
      if (!followingRelationships || followingRelationships.length === 0) {
        return [];
      }

      const followingIds = followingRelationships.map(
        (rel) => rel.following_id
      );

      // Get the blocked relationships
      const { data: blocks, error: blocksError } = await supabase
        .from('blocks')
        .select('blocker_id, blocked_id');

      if (blocksError) {
        console.error('Error fetching blocks:', blocksError);
        return null;
      }

      // Get all blocked and blocker IDs related to the current user
      const blockedUsers = new Set(
        blocks
          ?.filter((block) => block.blocker_id === currentlyAuthenticatedUser)
          .map((block) => block.blocked_id)
      );
      const blockedByUsers = new Set(
        blocks
          ?.filter((block) => block.blocked_id === currentlyAuthenticatedUser)
          .map((block) => block.blocker_id)
      );

      // Get posts only from users that the current user follows
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select(
          `
        *,
        profiles!posts_author_id_fkey(id, username, avatar_url),
        post_tags(
          tag_id,
          tags(
            name
          )
        )
      `
        )
        .in('author_id', followingIds)
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('Error fetching posts:', postsError);
        return null;
      }

      // Filter out posts from blocked users
      return posts.filter(
        (post) =>
          !blockedUsers.has(post.author_id) &&
          !blockedByUsers.has(post.author_id)
      );
    } catch (error) {
      console.error('Error in getFollowingPosts:', error);
      return null;
    }
  }
  async getRecommendedPosts(
    userId: string
  ): Promise<TGetHomePagePost[] | null> {
    try {
      const response = await fetch(
        `${PLACIDATE_SERVER_BASE_URL}/api/recommendations/${userId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.recommendations;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      return null;
    }
  }

  async searchForPosts(
    currentlyAuthenticatedUser: string,
    searchTerm: string
  ): Promise<TPost[] | []> {
    try {
      // Get blocks
      const { data: blocks, error: blocksError } = await supabase
        .from('blocks')
        .select('blocker_id, blocked_id');

      if (blocksError) {
        console.error('Error fetching blocks:', blocksError);
        return [];
      }

      // Create Sets
      const blockedUsers = new Set(
        blocks
          ?.filter((block) => block.blocker_id === currentlyAuthenticatedUser)
          .map((block) => block.blocked_id)
      );
      const blockedByUsers = new Set(
        blocks
          ?.filter((block) => block.blocked_id === currentlyAuthenticatedUser)
          .map((block) => block.blocker_id)
      );

      // Get posts with specific profile relationship
      const { data, error } = await supabase
        .from('posts')
        .select('*, profiles!posts_author_id_fkey(*)')
        .ilike('title', `%${searchTerm}%`);

      if (error) {
        console.error('Error searching for posts:', error);
        return [];
      }

      return (
        data.filter(
          (post) =>
            !blockedUsers.has(post.author_id) &&
            !blockedByUsers.has(post.author_id)
        ) || []
      );
    } catch (error) {
      console.error('Error in searchForPosts:', error);
      return [];
    }
  }

  async searchForPostsByTag(
    currentlyAuthenticatedUser: string,
    searchTerm: string
  ): Promise<TPost[] | []> {
    try {
      // Get blocks
      const { data: blocks, error: blocksError } = await supabase
        .from('blocks')
        .select('blocker_id, blocked_id');

      if (blocksError) {
        console.error('Error fetching blocks:', blocksError);
        return [];
      }

      // Create Sets
      const blockedUsers = new Set(
        blocks
          ?.filter((block) => block.blocker_id === currentlyAuthenticatedUser)
          .map((block) => block.blocked_id)
      );
      const blockedByUsers = new Set(
        blocks
          ?.filter((block) => block.blocked_id === currentlyAuthenticatedUser)
          .map((block) => block.blocker_id)
      );

      // Get posts by tag with specific profile relationship
      const { data: posts, error } = await supabase
        .from('posts')
        .select(
          `
        *,
        profiles!posts_author_id_fkey(*),
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

      return (
        posts.filter(
          (post) =>
            !blockedUsers.has(post.author_id) &&
            !blockedByUsers.has(post.author_id)
        ) || []
      );
    } catch (error) {
      console.error('Error searching for posts by tag:', error);
      return [];
    }
  }

  async deletePost(postId: string): Promise<boolean> {
    try {
      // Delete tag mappings first (foreign key constraints)
      const { error: tagMappingDeleteError } = await supabase
        .from('post_tags')
        .delete()
        .eq('post_id', postId);

      if (tagMappingDeleteError) {
        console.error('Error deleting post tag mappings:', {
          operation: 'delete_tag_mappings',
          error: tagMappingDeleteError,
          postId,
        });
        return false;
      }

      // Delete the post
      const { error: postDeleteError } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (postDeleteError) {
        console.error('Error deleting post:', {
          operation: 'delete_post',
          error: postDeleteError,
          postId,
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Unexpected error in deletePost:', {
        operation: 'delete_post',
        error,
        postId,
      });
      return false;
    }
  }

  async createPost(
    authorId: string,
    title: string,
    description: string | undefined,
    postType: string,
    body: string,
    tagNames: string[]
  ): Promise<boolean> {
    try {
      // Upsert tags and then select them to get their IDs
      const { error: tagUpsertError } = await supabase.from('tags').upsert(
        tagNames.map((name) => ({ name })),
        {
          onConflict: 'name',
        }
      );

      if (tagUpsertError) {
        console.error('Tag upsert operation failed:', {
          operation: 'tag_upsert',
          error: tagUpsertError,
          attemptedTags: tagNames,
          timestamp: new Date().toISOString(),
          userId: authorId,
        });
        return false;
      }

      // Fetch the tags we just upserted
      const { data: tags, error: tagFetchError } = await supabase
        .from('tags')
        .select('id, name')
        .in('name', tagNames);

      if (tagFetchError || !tags) {
        console.error('Tag fetch operation failed:', {
          operation: 'tag_fetch',
          error: tagFetchError,
          attemptedTags: tagNames,
          timestamp: new Date().toISOString(),
          userId: authorId,
        });
        return false;
      }

      // Create the post
      const postData = {
        author_id: authorId,
        title,
        description,
        post_type: postType,
        body,
      };

      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert(postData)
        .select()
        .single();

      if (postError || !post) {
        console.error('Post creation failed:', {
          operation: 'post_creation',
          error: postError,
          attemptedData: postData,
          timestamp: new Date().toISOString(),
          userId: authorId,
        });
        return false;
      }

      // Create tag mappings
      const tagMappings = tags.map((tag) => ({
        post_id: post.id,
        tag_id: tag.id,
      }));

      const { error: tagMappingError } = await supabase
        .from('post_tags')
        .insert(tagMappings);

      if (tagMappingError) {
        console.error('Tag mapping creation failed:', {
          operation: 'tag_mapping',
          error: tagMappingError,
          postId: post.id,
          attemptedMappings: tagMappings,
          timestamp: new Date().toISOString(),
          userId: authorId,
        });

        const { error: cleanupError } = await supabase
          .from('posts')
          .delete()
          .match({ id: post.id });

        if (cleanupError) {
          console.error('Post cleanup failed:', {
            operation: 'post_cleanup',
            error: cleanupError,
            postId: post.id,
            timestamp: new Date().toISOString(),
            userId: authorId,
          });
        }
        return false;
      }

      return true;
    } catch (error) {
      console.error('Unexpected error in createPost:', {
        operation: 'create_post',
        error,
        input: {
          authorId,
          title,
          description,
          postType,
          tagCount: tagNames.length,
          tags: tagNames,
        },
        timestamp: new Date().toISOString(),
      });
      return false;
    }
  }

  async getPostsCreatedByUser(user_id: string): Promise<TPost[] | null> {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('author_id', user_id);

    if (error) {
      console.error(error);
      return null;
    }

    return data;
  }
}

export default SupabasePostEndpoint;
