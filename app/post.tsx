import ActionBar from '@/components/ActionBar';
import Comment from '@/components/Comment';
import Tag from '@/components/Tag';
import Header from '@/components/TopLevelHeader';
import { useAuth } from '@/providers/AuthProvider';
import { showToast } from '@/utils/helpers';
import { supabase } from '@/lib/supabase/client';
import SupabasePostEndpoint from '@/lib/supabase/PostEndpoint';
import SupabaseUserEndpoint from '@/lib/supabase/UserEndpoint';
import SupabaseUserPostInteractionEndpoint from '@/lib/supabase/UserPostInteractionEndpoint';
import { TCommentsAndAuthors, TGetHomePagePost, TProfile } from '@/utils/types';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Share,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ViewPostScreen() {
  const [post, setPost] = useState<TGetHomePagePost>();
  const [comments, setComments] = useState<TCommentsAndAuthors[]>([]);
  const [text, setText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [liked, setLiked] = useState<boolean>(false);
  const [bookmarked, setBookmarked] = useState<boolean>(false);
  const [showChatModal, setShowChatModal] = useState<boolean>(false);
  const [friends, setFriends] = useState<TProfile[]>([]);

  const router = useRouter();
  const params = useLocalSearchParams();
  const post_id = params.post_id as string;

  const postEndpoint = new SupabasePostEndpoint();
  const userPostEndpoint = new SupabaseUserPostInteractionEndpoint();
  const userEndpoint = new SupabaseUserEndpoint();

  const { profile: uncastedProfile } = useAuth();
  const activeProfile = uncastedProfile as TProfile;

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      getPost();
      loadComments();
      setLikedAndBookmarkedStatus();
      loadFriends();
      setLoading(false);
    }, [])
  );

  const loadFriends = async (): Promise<void> => {
    const friends = await userEndpoint.getFriends(activeProfile.id);
    setFriends(friends);
  };

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
    const comments = await postEndpoint.getCommentsAndAuthors(
      activeProfile.id,
      String(post_id)
    );
    if (!comments) {
      return console.error('Error fetching comments');
    }
    setComments(comments);
  };

  const handleAddComment = async (): Promise<void> => {
    await userPostEndpoint.addComment(activeProfile.id, String(post_id), text);
    setText('');
    await loadComments();
  };

  const handleDeleteComment = async (
    commentToDelete: string
  ): Promise<void> => {
    const successfulDelete = await userPostEndpoint.deleteComment(
      commentToDelete
    );
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
    const liked = await userPostEndpoint.postIsLikedByUser(
      post_id,
      activeProfile.id
    );
    const bookmarked = await userPostEndpoint.postIsBookmarkedByUser(
      post_id,
      activeProfile.id
    );
    setLiked(liked);
    setBookmarked(bookmarked);
  };

  const handleLike = async () => {
    await userPostEndpoint.likePost(post_id, activeProfile.id);
    setLiked(true);
  };
  const handleUnlike = async () => {
    await userPostEndpoint.unlikePost(post_id, activeProfile.id);
    setLiked(false);
  };

  const handleUnbookmark = async (): Promise<void> => {
    await userPostEndpoint.unbookmarkPost(activeProfile.id, post_id);
    setBookmarked(false);
  };
  const handleBookmark = async (): Promise<void> => {
    await userPostEndpoint.bookmarkPost(activeProfile.id, post_id);
    setBookmarked(true);
  };

  const handleDelete = async (): Promise<void> => {
    const success = await postEndpoint.deletePost(post_id);
    if (!success) {
      showToast(`Failed to delete post, please try again later`);
    } else {
      showToast('Post successfully deleted');
      router.replace('/(tabs)');
    }
  };

  const handleEdit = async (): Promise<void> => {
    router.push(`/editPost?post_id=${post_id}`);
  };

  const handleSendToChat = (): void => {
    if (friends.length === 0) {
      return showToast("You don't have any friends to share with");
    }
    setShowChatModal(true);
    return;
  };

  const sendPostToChat = async (recipientId: string): Promise<void> => {
    try {
      if (!post) return;

      const postLink = `{{post:${post_id}}}`;

      const sent = await supabase.from('messages').insert({
        sender_id: activeProfile.id,
        receiver_id: recipientId,
        body: postLink,
      });

      if (sent.error) {
        throw sent.error;
      }

      setShowChatModal(false);
      showToast('Post shared successfully!');
    } catch (error) {
      console.error('Error sending post to chat:', error);
      showToast('Failed to share post');
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

  const handleShare = async (): Promise<void> => {
    try {
      await Share.share({
        message: formatPostForSharing(post.post_type, post.title, post.body),
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const {
    profiles: { id, username, avatar_url },
  } = post;
  const { description } = post;

  const renderHeader = () => (
    <>
      {/* Attribution section */}
      <TouchableOpacity
        className='flex-row items-center p-2'
        onPress={() => router.push(`/user?user_id=${id}`)}
      >
        <Image
          source={
            avatar_url
              ? { uri: avatar_url }
              : require('@/assets/images/default-avatar.jpg')
          }
          style={profilePictureImageStyle}
        />
        <Text className='p-2 font-bold'>{username}</Text>
      </TouchableOpacity>

      {/* Post body section */}
      <View className='min-h-[20%] p-4 border-y border-gray-200'>
        <Text className='font-bold text-2xl mb-2 text-center'>
          {post?.title}
        </Text>
        <Text
          className={`text-base ${
            post?.post_type === 'poem' ? 'text-center' : ''
          }`}
        >
          {post?.body}
        </Text>
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
            {post.post_tags?.map((tag: any) => (
              <Tag key={tag.tag_id} tagName={tag.tags?.name ?? ''} />
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
          onEdit={handleEdit}
          onShare={handleShare}
          onSendInChat={handleSendToChat}
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
            <Comment comment={item} onDelete={handleDeleteComment} />
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

        {/* Chat Selection Modal */}
        <Modal
          visible={showChatModal}
          transparent={true}
          animationType='slide'
          onRequestClose={() => setShowChatModal(false)}
        >
          <View className='flex-1 justify-center items-center bg-black/50'>
            <View className='bg-white p-4 rounded-lg w-5/6 max-h-96'>
              <Text className='text-xl font-bold mb-4'>Share with</Text>

              <FlatList
                data={friends}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className='flex-row items-center p-3 border-b border-gray-200'
                    onPress={() => sendPostToChat(item.id)}
                  >
                    <Image
                      source={
                        item.avatar_url
                          ? { uri: item.avatar_url }
                          : require('@/assets/images/default-avatar.jpg')
                      }
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        marginRight: 10,
                      }}
                    />
                    <Text className='text-lg'>{item.username}</Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={() => (
                  <Text className='p-4 text-center'>
                    No friends to share with
                  </Text>
                )}
              />

              <TouchableOpacity
                className='bg-gray-200 p-3 rounded-lg mt-4'
                onPress={() => setShowChatModal(false)}
              >
                <Text className='text-center font-semibold'>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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

const formatPostForSharing = (
  postType: string,
  postTitle: string,
  postText: string
): string => {
  return `Hey, check out this ${postType} called ${postTitle}:\n\n${postText}`;
};
