import Header from '@/components/Header';
import { supabase } from '@/utils/supabase/supabase';
import {
  addComment,
  getCommentsAndAuthors,
  TComments,
  TCommentsAndAuthors,
} from '@/utils/userPostInteractions';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  Keyboard,
} from 'react-native';
import { HomePagePosts } from './(tabs)';
import { FlatList } from 'react-native';
import Comment from '@/components/Comment';
import { useAuth } from '@/providers/AuthProvider';
import Ionicons from '@expo/vector-icons/Ionicons';

interface IViewPostProps {
  post: HomePagePosts;
}

export default function ViewPostScreen() {
  const [post, setPost] = useState<HomePagePosts>();
  const [comments, setComments] = useState<TCommentsAndAuthors[]>([]);
  const [text, setText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const { profile } = useAuth();
  const router = useRouter();
  const { post_id } = useLocalSearchParams();

  if (!profile) {
    console.log('Error showing post: Couldnt load profile from  auth context');
    return router.back();
  }

  useEffect(() => {
    setLoading(true);
    getPost();
    loadComments();
    setLoading(false);
  }, []);

  const getPost = async (): Promise<void> => {
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles!posts_author_id_fkey(id, username, avatar_url)')
      .eq('id', post_id)
      .single();

    if (error) {
      console.error('Error fetching posts:', error);
      return;
    }
    setPost(data);
  };

  const loadComments = async (): Promise<void> => {
    const comments = await getCommentsAndAuthors(String(post_id));
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

  if (loading) {
    return (
      <View>
        <Text>LOADING</Text>
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

  return (
    <KeyboardAvoidingView
      className='flex-1'
      behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className='flex-1 bg-white'>
          <Header title='Placidate' showBackIcon showNotificationIcon={false} />
          <TouchableOpacity
            className='flex-row items-center border-b border-black'
            onPress={() => router.push(`/profile?user_id=${id}`)}
          >
            <Image
              src={'https://picsum.photos/200'}
              style={profilePictureImageStyle}
            />
            <Text className='p-2 font-bold'>{username}</Text>
          </TouchableOpacity>
          <View className='border-b h-[150px] p-3'>
            <Text>{post.body}</Text>
          </View>

          <View className='p-2 border-b h-[80px]'>
            <Text>
              <Text className='font-bold'>{username + ': '}</Text>
              {description && <Text>{description}</Text>}
            </Text>
          </View>

          <View className='p-2 border-b h-[80px]'>
            {comments.length > 0 ? (
              <FlatList
                inverted
                data={comments}
                renderItem={({ item }) => <Comment comment={item}></Comment>}
              />
            ) : (
              <Text>No comments yet </Text>
            )}
          </View>
          <View className='flex-row gap-2 items-start justify-start w-full px-3 my-2'>
            <TextInput
              className='flex-1 bg-white p-4 rounded-3xl border border-gray-300'
              placeholder='Add a comment'
              onChange={(e) => setText(e.nativeEvent.text)}
              value={text}
            />
            <TouchableOpacity onPress={handleAddComment}>
              <Ionicons name='arrow-forward-circle-outline' size={40} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
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
