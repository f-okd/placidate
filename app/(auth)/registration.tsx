import { useAuth } from '@/providers/AuthProvider';
import { showToast } from '@/utils/helpers';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function RegistrationScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('a@a.com');
  const [username, setUsername] = useState('testAccount');
  const [password, setPassword] = useState('password123');
  const [confirmPassword, setConfirmPassword] = useState('password123');

  const { signUp } = useAuth();

  const handleSignUp = async () => {
    if (confirmPassword == password) {
      return signUp(email, password, username);
    }

    showToast('Error: Passwords must be the same');
  };

  return (
    <View className='flex-1 items-center justify-center bg-white'>
      <View className='w-full p-4'>
        <Text className='font-bold text-3xl text-center mb-4'>Register</Text>
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
          className='bg-white px-4 py-2 rounded-lg border border-gray-400 w-full  mb-4'
        />
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
