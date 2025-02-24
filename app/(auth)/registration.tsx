import { useAuth } from '@/providers/AuthProvider';
import { showToast } from '@/utils/helpers';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function RegistrationScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('a@a.com');
  const [username, setUsername] = useState('testAccount');
  const [password, setPassword] = useState('password12345678');
  const [confirmPassword, setConfirmPassword] = useState('password12345678');
  const [image, setImage] = useState<string | null>(null);

  const { signUp } = useAuth();

  const handleSignUp = async () => {
    if (confirmPassword == password) {
      return signUp(email, password, username, image);
    }

    showToast('Error: Passwords must be the same');
  };

  const imageToDisplay = image
    ? image
    : require('@/assets/images/default-avatar.jpg');

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      cameraType: ImagePicker.CameraType.front,
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0].fileName) {
      const photo = result.assets[0];
      setImage(photo.uri);
    } else {
      showToast('Error setting your profile picture');
    }
  };

  return (
    <View className='flex-1 items-center justify-center bg-white'>
      <View className='w-full p-4'>
        <Text className='font-bold text-3xl text-center mb-4'>Register</Text>
        {/*Avatar section */}
        <View className='mb-6 items-center'>
          {image ? (
            <Image
              source={{ uri: image }}
              className='w-[150] h-[150] rounded-full'
            />
          ) : (
            <Image
              source={imageToDisplay}
              className='w-[150] h-[150] rounded-full'
            />
          )}
          <TouchableOpacity
            className='text-xl mt-1 text-gray-600 mb-2'
            onPress={pickImage}
          >
            <Text>Upload new avatar</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder='Email'
          className='bg-white px-4 py-2 rounded-lg border border-gray-400 w-full  mb-4'
        />
        <TextInput
          value={username}
          onChangeText={setUsername}
          placeholder='Username'
          className='bg-white px-4 py-2 rounded-lg border border-gray-400 w-full  mb-4'
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
          placeholder='Password'
          className='bg-white px-4 py-2 rounded-lg border border-gray-400 w-full  mb-4'
        />
        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={true}
          placeholder='Confirm password'
          className='bg-white px-4 py-2 rounded-lg border border-gray-400 w-full'
        />
        <Text className=' text-sm italic text-center mb-6'>
          * Password must be at least 16 characters long. Try a memorable phrase
        </Text>
        <TouchableOpacity
          className='px-4 py-2 rounded-lg bg-black'
          onPress={handleSignUp}
        >
          <Text className='text-white font-bold text-lg text-center'>
            Register
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/')} className='m-2'>
          <Text className='text-black text-center'>
            Already have an account? Click here to sign in
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
