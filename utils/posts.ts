import { supabase } from './supabase/supabase';
import { Tables } from './supabase/types';
import { TProfile } from './users';

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
  return data.map((commentAndProfileObject) => ({
    ...commentAndProfileObject,
    deletable:
      commentAndProfileObject.profiles?.id == currentlyAuthenticatedUser ||
      commentAndProfileObject.user_id == currentlyAuthenticatedUser,
  }));
};

export const searchForPosts = async (
  searchTerm: string
): Promise<TPost[] | []> => {
  const { data, error } = await supabase
    .from('posts')
    .select()
    .ilike('title', `%${searchTerm}%`);

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
    return posts || [];
  } catch (error) {
    console.error('Error searching for posts by tag:', error);
    return [];
  }
};
export { TProfile };

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
