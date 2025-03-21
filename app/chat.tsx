import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
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
import Header from '@/components/TopLevelHeader';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase/client';
import { formatDistanceToNow } from 'date-fns';

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

  // Render the message content
  const renderMessageContent = (message: EnhancedMessageRecord) => {
    const match = message.body.match(POST_LINK_REGEX);

    if (match && match[1]) {
      const postId = match[1];
      const post = message.postData;

      // Extract the text part before the post link
      const textContent = message.body.split(POST_LINK_REGEX)[0].trim();

      if (post) {
        return (
          <View>
            {textContent && (
              <Text style={styles.messageText}>{textContent}</Text>
            )}
            <TouchableOpacity
              style={styles.sharedPostContainer}
              onPress={() => navigateToPost(postId)}
            >
              <View style={styles.sharedPostHeader}>
                <Text style={styles.sharedPostType}>{post.post_type}</Text>
                <Ionicons name='open-outline' size={16} color='#666' />
              </View>
              <Text style={styles.sharedPostTitle}>{post.title}</Text>
              <Text numberOfLines={2} style={styles.sharedPostPreview}>
                {post.body.substring(0, 100)}
                {post.body.length > 100 ? '...' : ''}
              </Text>
            </TouchableOpacity>
          </View>
        );
      } else {
        // Post not loaded or doesn't exist
        return (
          <View>
            <TouchableOpacity
              style={styles.sharedPostContainer}
              onPress={() => navigateToPost(postId)}
            >
              <Text style={styles.messageText}>Shared post (tap to view)</Text>
            </TouchableOpacity>
          </View>
        );
      }
    }

    // Regular message
    return <Text style={styles.messageText}>{message.body}</Text>;
  };

  const renderMessage = ({ item }: { item: EnhancedMessageRecord }) => {
    const isMyMessage = item.sender_id === activeProfile.id;

    return (
      <View
        style={[
          styles.messageBubble,
          isMyMessage ? styles.myMessage : styles.theirMessage,
        ]}
      >
        {renderMessageContent(item)}
        <Text style={styles.timestampText}>
          {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
        </Text>
      </View>
    );
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
          title={recipient?.username || 'Chat'}
          showBackIcon={true}
          showNotificationIcon={false}
        />

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
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

const styles = StyleSheet.create({
  messageBubble: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 15,
    marginVertical: 5,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
    borderBottomRightRadius: 0,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0F0F0',
    borderBottomLeftRadius: 0,
  },
  messageText: {
    fontSize: 16,
  },
  timestampText: {
    fontSize: 10,
    color: '#999',
    marginTop: 5,
    alignSelf: 'flex-end',
  },
  sharedPostContainer: {
    marginTop: 5,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sharedPostHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sharedPostType: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
  },
  sharedPostTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  sharedPostPreview: {
    fontSize: 12,
    color: '#333',
  },
});
