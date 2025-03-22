import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import React, { useCallback, useState, useRef, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { MessageRecord, TProfile } from '@/utils/types';
import SupabaseUserUserInteractionEndpoint from '@/lib/supabase/UserUserInteractionEndpoint';
import SupabaseUserEndpoint from '@/lib/supabase/UserEndpoint';
import SupabasePostEndpoint from '@/lib/supabase/PostEndpoint';
import { showToast } from '@/utils/helpers';
import Header from '@/components/ChatTopLevelHeader';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase/client';
import Message, { MessageData } from '@/components/Message';

// Regular expression to match post links in format {{post:POST_ID}}
const POST_LINK_REGEX = /\{\{post:([a-zA-Z0-9-]+)\}\}/;

// Enhanced MessageRecord type with post data
type EnhancedMessageRecord = MessageRecord & {
  postData?: any;
};

export default function Chat() {
  const [recipient, setRecipient] = useState<TProfile | null>(null);
  const [messages, setMessages] = useState<EnhancedMessageRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [text, setText] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);
  const flatListRef = useRef<FlatList>(null);

  const params = useLocalSearchParams();
  const user_id = params.user_id as string;

  const { profile: uncastedProfile } = useAuth();
  const activeProfile = uncastedProfile as TProfile;

  const router = useRouter();
  const userUserEndpoint = new SupabaseUserUserInteractionEndpoint();
  const userEndpoint = new SupabaseUserEndpoint();
  const postEndpoint = new SupabasePostEndpoint();

  const fetchAndLoadChat = async (): Promise<void> => {
    // Get chat messages
    const chatMessages = await userUserEndpoint.getChat(
      activeProfile.id,
      user_id
    );

    // Enhance messages with post data if needed
    const enhancedMessages = await enhanceMessagesWithPostData(chatMessages);
    setMessages(enhancedMessages);
  };

  // Function to add post data to messages
  const enhanceMessagesWithPostData = async (
    messages: MessageRecord[]
  ): Promise<EnhancedMessageRecord[]> => {
    const postIds = new Set<string>();
    const postData: Record<string, any> = {};
    const messagePostMap: Record<string, string> = {}; // Maps message ID to post ID

    // Collect all post IDs and track which messages contain which posts
    messages.forEach((message) => {
      const match = message.body.match(POST_LINK_REGEX);
      if (match && match[1]) {
        const postId = match[1];
        postIds.add(postId);
        messagePostMap[message.id] = postId;
      }
    });

    // Fetch post data for all IDs
    for (const postId of postIds) {
      try {
        const postDetails = await postEndpoint.getPostDetails(postId);
        if (postDetails) {
          postData[postId] = postDetails;
        }
      } catch (error) {
        console.error(`Error fetching post ${postId}:`, error);
      }
    }

    // Attach post data to messages using our map
    return messages.map((message) => {
      const postId = messagePostMap[message.id];
      if (postId && postData[postId]) {
        return {
          ...message,
          postData: postData[postId],
        };
      }
      return message;
    });
  };

  const fetchAndSetUser = async (): Promise<void> => {
    const user = await userEndpoint.getProfile(user_id);
    if (!user) {
      showToast('Could not load message details, try again later');
      return router.back();
    }
    setRecipient(user);
  };

  const sendMessage = async (): Promise<void> => {
    if (!text.trim()) return;

    setSending(true);
    const success = await userUserEndpoint.sendMessage(
      activeProfile.id,
      user_id,
      text.trim()
    );
    setSending(false);

    if (success) {
      // Add the message locally to avoid refetching
      const newMessage = {
        id: Date.now().toString(), // Temporary ID
        body: text.trim(),
        created_at: new Date().toISOString(),
        sender_id: activeProfile.id,
        receiver_id: user_id,
      };

      setMessages((prev) => [...prev, newMessage]);
      setText('');

      // Scroll to the bottom
      scrollToBottom();
    } else {
      showToast('Failed to send message. Please try again.');
    }
  };

  const scrollToBottom = (animated = true) => {
    setTimeout(() => {
      if (flatListRef.current && messages.length > 0) {
        flatListRef.current.scrollToEnd({ animated });
      }
    }, 100);
  };

  // Real-time subscription for new messages
  useEffect(() => {
    if (!activeProfile.id || !user_id) return;

    const subscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${activeProfile.id}`,
        },
        async (payload) => {
          const newMessage = payload.new as MessageRecord;

          // Check if this is a post share message
          let enhancedMessage = newMessage as EnhancedMessageRecord;

          const match = newMessage.body.match(POST_LINK_REGEX);

          if (match && match[1]) {
            try {
              const postDetails = await postEndpoint.getPostDetails(match[1]);
              if (postDetails) {
                enhancedMessage = {
                  ...newMessage,
                  postData: postDetails,
                };
              }
            } catch (error) {
              console.error(`Error fetching post data:`, error);
            }
          }

          setMessages((prev) => [...prev, enhancedMessage]);
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [activeProfile.id, user_id]);

  // Set up keyboard listeners to scroll when keyboard appears
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        scrollToBottom();
      }
    );

    return () => {
      keyboardDidShowListener.remove();
    };
  }, [messages]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      Promise.all([fetchAndSetUser(), fetchAndLoadChat()]).finally(() => {
        setLoading(false);
        scrollToBottom(false);
      });
    }, [])
  );

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom(false);
    }
  }, [messages.length]);

  // Navigate to a post
  const navigateToPost = (postId: string) => {
    router.push(`/post?post_id=${postId}`);
  };

  if (loading) {
    return (
      <View className='flex-1 items-center justify-center bg-white'>
        <ActivityIndicator size='large' color='#000' />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className='flex-1 bg-white'
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View className='flex-1'>
        <Header
          username={recipient?.username || 'Chat'}
          userId={recipient?.id as string}
        />

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={({ item }) => (
            <Message
              message={item as MessageData}
              isMyMessage={item.sender_id === activeProfile.id}
              navigateToPost={navigateToPost}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: 10,
            paddingVertical: 10,
            flexGrow: 1,
          }}
          onLayout={() => scrollToBottom}
        />

        <View className='border-t border-gray-200 p-2 bg-white flex-row items-center'>
          <TextInput
            className='flex-1 bg-gray-100 rounded-full px-4 py-2 mr-2'
            placeholder='Type a message...'
            value={text}
            onChangeText={setText}
            multiline
            onFocus={() => scrollToBottom()}
          />
          <TouchableOpacity
            disabled={sending || !text.trim()}
            onPress={sendMessage}
            className='bg-purple-300 w-10 h-10 rounded-full items-center justify-center'
          >
            {sending ? (
              <ActivityIndicator size='small' color='#fff' />
            ) : (
              <Ionicons name='send' size={20} color='#fff' />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
