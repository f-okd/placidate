import ActionBar from '@/components/ActionBar';
import Comment from '@/components/Comment';
import Header from '@/components/Header';
import Tag from '@/components/Tag';
import { useAuth } from '@/providers/AuthProvider';
import {
  deletePost,
  getCommentsAndAuthors,
  TCommentsAndAuthors,
} from '@/utils/posts';
import { supabase } from '@/utils/supabase/supabase';
import {
  addComment,
  bookmarkPost,
  deleteComment,
  likePost,
  postIsBookmarkedByUser,
  postIsLikedByUser,
  unbookmarkPost,
  unlikePost,
} from '@/utils/userPostInteractions';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import { TGetPosts } from './(tabs)';
import { showToast } from '@/utils/helpers';

interface IViewPostProps {
  post: TGetPosts;
}

export default function ViewPostScreen() {
  const [post, setPost] = useState<TGetPosts[number]>();
  const [comments, setComments] = useState<TCommentsAndAuthors[]>([]);
  const [text, setText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [liked, setLiked] = useState<boolean>(false);
  const [bookmarked, setBookmarked] = useState<boolean>(false);

  const { profile } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  const post_id = params.post_id as string;

  if (!profile) {
    console.error(
      'Error showing post: Couldnt load profile from  auth context'
    );
    return router.back();
  }

  useEffect(() => {
    setLoading(true);
    getPost();
    loadComments();
    setLikedAndBookmarkedStatus();
    setLoading(false);
  }, []);

  const getPost = async (): Promise<void> => {
    const { data, error } = await supabase
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
      .eq('id', post_id)
      .order('created_at', { ascending: false })
      .single();

    if (error) {
      console.error('Error fetching posts:', error);
      return;
    }
    setPost(data);
  };

  const loadComments = async (): Promise<void> => {
    const comments = await getCommentsAndAuthors(profile.id, String(post_id));
    if (!comments) {
      return console.error('Error fetching comments');
    }
    setComments(comments);
  };

  const handleAddComment = async (): Promise<void> => {
    await addComment(profile.id, String(post_id), text);
    setText('');
    await loadComments();
  };

  const handleDeleteComment = async (
    commentToDelete: string
  ): Promise<void> => {
    const successfulDelete = await deleteComment(commentToDelete);
    if (successfulDelete) {
      const newComments = comments.filter(
        (comment) => comment.id != commentToDelete
      );
      setComments(newComments);
    } else {
      showToast(" 'Error: Could not delete comment, try again later'");
    }
  };

  const setLikedAndBookmarkedStatus = async (): Promise<void> => {
    const liked = await postIsLikedByUser(post_id, profile.id);
    const bookmarked = await postIsBookmarkedByUser(post_id, profile.id);
    setLiked(liked);
    setBookmarked(bookmarked);
  };

  const handleLike = async () => {
    await likePost(post_id, profile.id);
    setLiked(true);
  };
  const handleUnlike = async () => {
    await unlikePost(post_id, profile.id);
    setLiked(false);
  };

  const handleUnbookmark = async (): Promise<void> => {
    await unbookmarkPost(profile.id, post_id);
    setBookmarked(false);
  };
  const handleBookmark = async (): Promise<void> => {
    await bookmarkPost(profile.id, post_id);
    setBookmarked(true);
  };

  const handleDelete = async (): Promise<void> => {
    const success = await deletePost(post_id);
    if (!success) {
      showToast(`Failed to delete post, please try again later`);
    } else {
      showToast('Post successfully deleted');
      router.replace('/(tabs)');
    }
  };

  if (loading) {
    return (
      <View className='flex-1 bg-white items-center justify-center'>
        <ActivityIndicator size={'large'} />
      </View>
    );
  }

  if (!post) {
    return (
      <View>
        <Text>Error: Post is missing</Text>
      </View>
    );
  } else if (!post.profiles) {
    return (
      <View>
        <Text>Error: Profile is missing</Text>
      </View>
    );
  }
  const {
    profiles: { id, username },
  } = post;
  const { description } = post;

  const renderHeader = () => (
    <>
      {/* Attribution section */}
      <TouchableOpacity
        className='flex-row items-center p-2'
        onPress={() => router.push(`/profile?user_id=${id}`)}
      >
        <Image
          src={'https://picsum.photos/200'}
          style={profilePictureImageStyle}
        />
        <Text className='p-2 font-bold'>{username}</Text>
      </TouchableOpacity>

      {/* Post body section */}
      <View className='min-h-[20%] p-4 border-y border-gray-200'>
        <Text className='font-bold text-2xl mb-2'>{post?.title}</Text>
        <Text className='text-base'>{post?.body}</Text>
      </View>

      {/* Description */}
      {description && (
        <View className='px-4 py-2'>
          <Text>{description}</Text>
        </View>
      )}

      {/* Tags */}
      {post.post_tags && (
        <View className='px-4 py-2'>
          <View className='flex-row flex-wrap gap-1'>
            {post.post_tags?.map((tag) => (
              <Tag
                key={tag.tag_id}
                isForNewPost={false}
                onRemoveTag={() => {}}
                tagName={tag.tags?.name ?? ''}
              />
            ))}
          </View>
        </View>
      )}

      <View className='px-4 py-2'>
        <ActionBar
          authorId={post.author_id}
          bookmarked={bookmarked}
          liked={liked}
          onLike={handleLike}
          onUnlike={handleUnlike}
          onBookmark={handleBookmark}
          onUnbookmark={handleUnbookmark}
          onDelete={handleDelete}
        />
      </View>

      <View className='border-t border-gray-200' />
    </>
  );

  return (
    <KeyboardAvoidingView
      className='flex-1 bg-white '
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View className='flex-1'>
        <Header title='' showBackIcon showNotificationIcon={false} />

        <FlatList
          data={comments}
          renderItem={({ item }) => (
            <Comment comment={item} handleDelete={handleDeleteComment} />
          )}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={{ flexGrow: 1 }}
          ListEmptyComponent={() => (
            <Text className='text-gray-500 p-4'>No comments yet</Text>
          )}
          showsVerticalScrollIndicator={true}
        />

        {/* Comment input*/}
        <View className='px-4 py-3 border-t border-gray-200 bg-white'>
          <View className='flex-row gap-2 items-center'>
            <TextInput
              className='flex-1 bg-gray-100 px-4 py-2 rounded-full'
              placeholder='Add a comment'
              value={text}
              onChange={(e) => setText(e.nativeEvent.text)}
            />
            <TouchableOpacity onPress={handleAddComment} className='p-2'>
              <Ionicons
                name='arrow-forward-circle-outline'
                size={32}
                color='black'
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const profilePictureImageStyle = {
  width: 40,
  height: 40,
  borderRadius: 20,
  borderWidth: 2,
  borderColor: 'black',
  margin: 4,
};
