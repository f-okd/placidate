import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export type MessageData = {
  id: string;
  body: string;
  created_at: string;
  sender_id: string;
  receiver_id: string;
  postData?: any; // For messages with shared posts
};

type MessageProps = {
  message: MessageData;
  isMyMessage: boolean;
  navigateToPost?: (postId: string) => void;
};

// Regular expression to match post links in format {{post:POST_ID}}
const POST_LINK_REGEX = /\{\{post:([a-zA-Z0-9-]+)\}\}/;

const Message = ({ message, isMyMessage, navigateToPost }: MessageProps) => {
  const router = useRouter();

  // Render the message content
  const renderMessageContent = () => {
    const match = message.body.match(POST_LINK_REGEX);

    if (match && match[1]) {
      const postId = match[1];
      const post = message.postData;

      // Extract the text part before the post link
      const textContent = message.body.split(POST_LINK_REGEX)[0].trim();

      if (post) {
        return (
          <View>
            {textContent && <Text className='text-base'>{textContent}</Text>}
            <TouchableOpacity
              className='mt-1 p-2 bg-white rounded-lg border border-gray-200'
              onPress={() => navigateToPost && navigateToPost(postId)}
            >
              <View className='flex-row justify-between items-center mb-1'>
                <Text className='text-xs text-gray-500 uppercase'>
                  {post.post_type}
                </Text>
                <Ionicons name='open-outline' size={16} color='#666' />
              </View>
              <Text className='font-bold text-sm mb-1'>{post.title}</Text>
              <Text numberOfLines={2} className='text-xs text-gray-700'>
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
              className='p-2 bg-white rounded-lg border border-gray-200'
              onPress={() => navigateToPost && navigateToPost(postId)}
            >
              <Text className='text-base'>Shared post (tap to view)</Text>
            </TouchableOpacity>
          </View>
        );
      }
    }

    // Regular message
    return <Text className='text-base'>{message.body}</Text>;
  };

  return (
    <View
      className={`max-w-[80%] p-3 rounded-lg my-1 ${
        isMyMessage
          ? 'bg-purple-100 self-end rounded-br-none'
          : 'bg-gray-100 self-start rounded-bl-none'
      }`}
    >
      {renderMessageContent()}
      <Text className='text-xs text-gray-500 mt-1 self-end'>
        {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
      </Text>
    </View>
  );
};

export default Message;
