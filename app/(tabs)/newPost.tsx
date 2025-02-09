import Tag from '@/components/Tag';
import { useAuth } from '@/providers/AuthProvider';
import { showToast } from '@/utils/helpers';
import SupabasePostEndpoint from '@/utils/supabase/PostEndpoint';
import { TProfile } from '@/utils/types';
import { useMemo, useState } from 'react';
import { Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import RadioGroup, { RadioButtonProps } from 'react-native-radio-buttons-group';

export default function CreateNewPostScreen() {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [selectedPostTypeId, setSelectedPostTypeId] = useState<string>('1');
  const [body, setBody] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [newTag, setNewTag] = useState('');

  const wordLimit = selectedPostTypeId == '1' ? 175 : 1000;

  const { profile: uncastedProfile } = useAuth();
  const activeProfile = uncastedProfile as TProfile;

  const postEndpoint = new SupabasePostEndpoint();

  const resetAllFields = (): void => {
    setTitle('');
    setDescription('');
    setBody('');
    setTags([]);
  };

  const handleChangeText = (text: string) => {
    const words = text.split(' ');
    if (words.length < wordLimit) {
      setBody(text);
    }
  };

  const handleAddTag = (tag: string) => {
    if (tags.includes(tag)) {
      showToast('Tag already added');
      return false;
    }
    if (tags.length < 10) {
      setTags((currTags) => [...currTags, tag]);
    }
    return true;
  };

  const handleAddTagAndCloseModal = () => {
    if (newTag.trim()) {
      const success = handleAddTag(newTag.trim());
      setNewTag('');
      if (success) {
        setModalVisible(false);
      }
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags((currTags) => currTags.filter((currTag) => currTag != tag));
  };

  const handleCreatePost = () => {
    if (tags.length < 3) {
      showToast('Error: You need at least 3 tags to create a post');
      return;
    } else if (tags.length > 10) {
      showToast('Error: You can not add more than 10 tags to a post');
      return;
    } else if (!title) {
      showToast('Error: You need to add a title to create a post');
      return;
    } else if (!body) {
      showToast('Error: You need to add content to the post');
      return;
    }
    postEndpoint.createPost(
      activeProfile.id,
      title,
      description,
      String(postIdTypeMap.get(selectedPostTypeId)),
      body,
      tags
    );
    resetAllFields();
  };

  const radioButtons: RadioButtonProps[] = useMemo(
    () => [
      {
        id: '1',
        label: 'Poem',
        value: 'poem',
        containerStyle: { alignItems: 'flex-start', alignSelf: 'flex-start' },
      },
      {
        id: '2',
        label: 'Short Story',
        value: 'shortStory',
        containerStyle: { alignItems: 'flex-start', alignSelf: 'flex-start' },
      },
    ],
    []
  );

  return (
    <View className='flex-1 items-center bg-white p-4'>
      {/*Title:*/}
      <View className='flex flex-row w-full m-3 items-center'>
        <Text className='mr-2 text-base'>Title: </Text>
        <TextInput
          value={title}
          className='text-black text-lg border-b border-gray-300 flex-1 p-2'
          aria-label='Title'
          onChangeText={(text: string) => setTitle(text)}
          maxLength={20}
        />
      </View>

      {/*Description:*/}
      <View className='flex w-full m-3'>
        <Text className='mb-2 text-base'>Description: </Text>
        <TextInput
          value={description}
          className='text-black text-lg border border-gray-300 rounded-md p-2 h-32'
          aria-label='Description'
          onChangeText={(text: string) => setDescription(text)}
          maxLength={140}
          multiline
          numberOfLines={5}
          textAlignVertical='top'
        />
      </View>

      {/*Select Post type*/}
      <View className='flex w-full m-3 items-start'>
        <Text className='mb-2 text-base'>Post Type:</Text>
        <RadioGroup
          radioButtons={radioButtons}
          onPress={setSelectedPostTypeId}
          selectedId={selectedPostTypeId}
          containerStyle={{ alignItems: 'flex-start', width: '100%' }}
        />
      </View>

      {/*Post Content:*/}
      <View className='flex-1 w-full m-3'>
        <Text className='mb-2 text-base'>
          {selectedPostTypeId == '1' ? 'Poem' : 'Short Story'}: {wordLimit}{' '}
          words
        </Text>
        <TextInput
          value={body}
          className='text-black text-lg border border-gray-300 rounded-md p-2 flex-1'
          aria-label='post content'
          onChangeText={(text: string) => handleChangeText(text)}
          multiline
          numberOfLines={200}
          textAlignVertical='top'
        />
        <Text className='mt-4 mb-2 text-base'>
          Tags:{' '}
          {tags.map((tag, index) => (
            <Tag key={index} tagName={tag} onRemoveTag={handleRemoveTag} />
          ))}
        </Text>

        {/* Tag Modal */}
        <Modal
          animationType='slide'
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View className='flex-1 justify-center items-center bg-black/50'>
            <View className='bg-white p-6 rounded-lg w-[80%] shadow-lg'>
              <Text className='text-xl mb-4'>Add a Tag</Text>
              <Text className='text-sm mb-4'>Max 15 characters</Text>
              <TextInput
                value={newTag}
                onChangeText={setNewTag}
                className='border border-gray-300 rounded-md p-2 mb-4'
                placeholder='Enter tag name'
                maxLength={15}
              />
              <View className='flex-row justify-end gap-4'>
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible(false);
                    setNewTag('');
                  }}
                  className='bg-gray-400 py-2 px-4 rounded-lg'
                >
                  <Text className='text-white'>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleAddTagAndCloseModal}
                  className='bg-purple-200 py-2 px-4 rounded-lg'
                >
                  <Text className='text-white'>Add Tag</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/*Add tags and create post buttons*/}
        <View className='flex-row gap-4 justify-center'>
          {/*Add tags button*/}
          <TouchableOpacity
            className='bg-gray-500 rounded-lg py-3 px-6 mt-4 w-[108px]'
            onPress={() => {
              if (tags.length >= 10) {
                showToast('Maximum 10 tags allowed');
              } else {
                setModalVisible(true);
              }
            }}
          >
            <Text className='text-white text-lg font-semibold'>Add tags</Text>
          </TouchableOpacity>

          {/*Create post button */}
          <TouchableOpacity
            className='bg-purple-200 rounded-lg py-3 px-6 mt-4 w-[130px]'
            onPress={() => handleCreatePost()}
          >
            <Text className='text-white text-lg font-semibold'>
              Create Post
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const postIdTypeMap = new Map([
  ['1', 'poem'],
  ['2', 'story'],
]);
