import { supabase } from './supabase/supabase';
import { Tables } from './supabase/types';
import { TProfile } from './users';
export { TProfile };

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
  try {
    // First get blocks
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
          commentAndProfileObject.profiles?.id === currentlyAuthenticatedUser ||
          commentAndProfileObject.user_id === currentlyAuthenticatedUser,
      }));
  } catch (error) {
    console.error('Error in getCommentsAndAuthors:', error);
    return null;
  }
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

export const getFollowingPosts = async (
  currentlyAuthenticatedUser: string
): Promise<TGetHomePagePost[] | null> => {
  try {
    // First, get the blocked relationships
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

    // Get posts
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
      .order('created_at', { ascending: false });

    if (postsError) {
      console.error('Error fetching posts:', postsError);
      return null;
    }

    // Filter out posts from blocked users
    return posts.filter(
      (post) =>
        !blockedUsers.has(post.author_id) && !blockedByUsers.has(post.author_id)
    );
  } catch (error) {
    console.error('Error in getPosts:', error);
    return null;
  }
};

export const getRecommendedPosts = async (
  currentlyAuthenticatedUser: string
): Promise<TGetHomePagePost[] | null> => {
  try {
    // First, get the blocked relationships
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

    // Get posts
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
      .order('created_at', { ascending: false });

    if (postsError) {
      console.error('Error fetching posts:', postsError);
      return null;
    }

    // Filter out posts from blocked users
    return posts.filter(
      (post) =>
        !blockedUsers.has(post.author_id) && !blockedByUsers.has(post.author_id)
    );
  } catch (error) {
    console.error('Error in getPosts:', error);
    return null;
  }
};

export const searchForPosts = async (
  currentlyAuthenticatedUser: string,
  searchTerm: string
): Promise<TPost[] | []> => {
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
};

export const searchForPostsByTag = async (
  currentlyAuthenticatedUser: string,
  searchTerm: string
): Promise<TPost[] | []> => {
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
};

export const deletePost = async (postId: string): Promise<boolean> => {
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
};

export const createPost = async (
  authorId: string,
  title: string,
  description: string | undefined,
  postType: string,
  body: string,
  tagNames: string[]
): Promise<boolean> => {
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
};
