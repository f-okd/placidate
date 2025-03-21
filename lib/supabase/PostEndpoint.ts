import {
  IUpdatedPostDetails,
  TCommentsAndAuthors,
  TGetHomePagePost,
  TPost,
} from '@/utils/types';
import { supabase } from './client';

const PLACIDATE_SERVER_BASE_URL =
  process.env.NODE_ENV == 'production'
    ? String(process.env.EXPO_PUBLIC_SERVER_BASE_URL)
    : 'http://10.0.2.2:8000';

class SupabasePostEndpoint {
  async getComments(
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
      console.error('Error in getComments:', error);
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
          .eq('follower_id', currentlyAuthenticatedUser);

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

      // Get all users who follow the current user
      const { data: followers, error: followersError } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('following_id', currentlyAuthenticatedUser);

      if (followersError) {
        console.error('Error fetching followers:', followersError);
        return null;
      }

      // Create set of follower IDs
      const followerIds = new Set(followers?.map((f) => f.follower_id) || []);

      // Create set of mutual followers (users who the current user follows and who follow the current user)
      const mutualFollowerIds = followingIds.filter((id) =>
        followerIds.has(id)
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
        profiles!posts_author_id_fkey(id, username, avatar_url, is_private),
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

      // Filter out posts from blocked users and respect privacy settings
      return posts.filter((post) => {
        // Filter out posts from blocked users
        if (
          blockedUsers.has(post.author_id) ||
          blockedByUsers.has(post.author_id)
        ) {
          return false;
        }

        // If the author has a private profile, ensure they are mutual followers
        if (post.profiles?.is_private) {
          return mutualFollowerIds.includes(post.author_id);
        }

        // Posts from public profiles that the user follows are visible
        return true;
      });
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
        // console.log(response);
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

      // Create Sets for blocked users
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

      // Get all users that the current user follows
      const { data: following, error: followingError } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', currentlyAuthenticatedUser);

      if (followingError) {
        console.error('Error fetching following:', followingError);
        return [];
      }

      // Get all users that follow the current user
      const { data: followers, error: followersError } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('following_id', currentlyAuthenticatedUser);

      if (followersError) {
        console.error('Error fetching followers:', followersError);
        return [];
      }

      // Create sets for following and followers
      const followingIds = new Set(following?.map((f) => f.following_id) || []);
      const followerIds = new Set(followers?.map((f) => f.follower_id) || []);

      // Find mutual followers (users who the current user follows and who follow the current user)
      const mutualFollowers = new Set(
        [...followingIds].filter((id) => followerIds.has(id))
      );

      // Get posts with specific profile relationship
      const { data, error } = await supabase
        .from('posts')
        .select('*, profiles!posts_author_id_fkey(*)')
        .or(`title.ilike.%${searchTerm}%, description.ilike.%${searchTerm}%`);

      if (error) {
        console.error('Error searching for posts:', error);
        return [];
      }

      // Filter posts based on privacy settings and blocks
      return (
        data.filter((post) => {
          // Skip posts from blocked/blocking users
          if (
            blockedUsers.has(post.author_id) ||
            blockedByUsers.has(post.author_id)
          ) {
            return false;
          }

          // Current user can always see their own posts
          if (post.author_id === currentlyAuthenticatedUser) {
            return true;
          }

          // If the author has a private profile, check if they're mutual followers
          if (post.profiles?.is_private) {
            return mutualFollowers.has(post.author_id);
          }

          // Public profiles' posts are visible to all
          return true;
        }) || []
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

      // Create Sets for blocked users
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

      // Get all users that the current user follows
      const { data: following, error: followingError } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', currentlyAuthenticatedUser);

      if (followingError) {
        console.error('Error fetching following:', followingError);
        return [];
      }

      // Get all users that follow the current user
      const { data: followers, error: followersError } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('following_id', currentlyAuthenticatedUser);

      if (followersError) {
        console.error('Error fetching followers:', followersError);
        return [];
      }

      // Create sets for following and followers
      const followingIds = new Set(following?.map((f) => f.following_id) || []);
      const followerIds = new Set(followers?.map((f) => f.follower_id) || []);

      // Find mutual followers (users who the current user follows and who follow the current user)
      const mutualFollowers = new Set(
        [...followingIds].filter((id) => followerIds.has(id))
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

      // Filter posts based on privacy settings and blocks
      return (
        posts.filter((post) => {
          // Skip posts from blocked/blocking users
          if (
            blockedUsers.has(post.author_id) ||
            blockedByUsers.has(post.author_id)
          ) {
            return false;
          }

          // Current user can always see their own posts
          if (post.author_id === currentlyAuthenticatedUser) {
            return true;
          }

          // If the author has a private profile, check if they're mutual followers
          if (post.profiles?.is_private) {
            return mutualFollowers.has(post.author_id);
          }

          // Public profiles' posts are visible to all
          return true;
        }) || []
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

    return data.reverse();
  }

  async getPostDetails(post_id: string): Promise<TPost | null> {
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles!posts_author_id_fkey(*)')
      .eq('id', post_id)
      .single();

    if (error) {
      console.error('Error fetching post details:', error);
      return null;
    }

    if (!data) {
      console.error(`Post with ID ${post_id} not found`);
      return null;
    }

    return data;
  }

  async getTagsForPost(post_id: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('post_tags')
      .select('tags(name)')
      .eq('post_id', post_id);

    if (error) {
      console.error('Error fetching tags for post:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((item) => item.tags?.name).filter(Boolean) as string[];
  }

  async updatePost(
    author_id: string,
    post_id: string,
    updatedPostDetails: IUpdatedPostDetails
  ): Promise<boolean> {
    try {
      // First, update the post record
      const { error: postUpdateError } = await supabase
        .from('posts')
        .update({
          title: updatedPostDetails.title,
          description: updatedPostDetails.description,
          post_type: updatedPostDetails.post_type,
          body: updatedPostDetails.body,
        })
        .eq('id', post_id)
        .eq('author_id', author_id); // For security, verify the author is making the change

      if (postUpdateError) {
        console.error('Error updating post:', postUpdateError);
        return false;
      }

      // Get existing tags for this post
      const { data: existingTagMappings, error: existingTagsError } =
        await supabase
          .from('post_tags')
          .select('tag_id, tags(name)')
          .eq('post_id', post_id);

      if (existingTagsError) {
        console.error('Error fetching existing tags:', existingTagsError);
        return false;
      }

      // Create a map of existing tag names to their IDs
      const existingTagMap = new Map();
      existingTagMappings.forEach((mapping) => {
        if (mapping.tags && mapping.tags.name) {
          existingTagMap.set(mapping.tags.name, mapping.tag_id);
        }
      });

      // Determine which tags to keep, add, or remove
      const existingTagNames = Array.from(existingTagMap.keys());
      const tagsToAdd = updatedPostDetails.tags.filter(
        (tag) => !existingTagNames.includes(tag)
      );
      const tagsToRemove = existingTagNames.filter(
        (tag) => !updatedPostDetails.tags.includes(tag)
      );

      // Upsert any new tags that need to be added
      if (tagsToAdd.length > 0) {
        const { error: tagUpsertError } = await supabase.from('tags').upsert(
          tagsToAdd.map((name) => ({ name })),
          { onConflict: 'name' }
        );

        if (tagUpsertError) {
          console.error('Error upserting new tags:', tagUpsertError);
          return false;
        }

        // Get the IDs of the tags we just upserted
        const { data: newTags, error: newTagsError } = await supabase
          .from('tags')
          .select('id, name')
          .in('name', tagsToAdd);

        if (newTagsError || !newTags) {
          console.error('Error fetching new tag IDs:', newTagsError);
          return false;
        }

        // Create new tag mappings
        const newTagMappings = newTags.map((tag) => ({
          post_id: post_id,
          tag_id: tag.id,
        }));

        const { error: newMappingsError } = await supabase
          .from('post_tags')
          .insert(newTagMappings);

        if (newMappingsError) {
          console.error('Error inserting new tag mappings:', newMappingsError);
          return false;
        }
      }

      // Remove tags that are no longer needed
      if (tagsToRemove.length > 0) {
        const tagIdsToRemove = tagsToRemove.map((tagName) =>
          existingTagMap.get(tagName)
        );

        const { error: removeMappingsError } = await supabase
          .from('post_tags')
          .delete()
          .eq('post_id', post_id)
          .in('tag_id', tagIdsToRemove);

        if (removeMappingsError) {
          console.error('Error removing tag mappings:', removeMappingsError);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Unexpected error in updatePost:', error);
      return false;
    }
  }
}

export default SupabasePostEndpoint;
