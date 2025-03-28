import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('a@a.com');
  const [password, setPassword] = useState('password12345678');
  const { signIn } = useAuth();

  return (
    <View className='flex-1 items-center justify-center bg-white'>
      <View className='w-full p-4'>
        <Text className='font-bold text-3xl text-center mb-4'>Log in</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder='Email'
          className='bg-white px-4 py-2 rounded-lg border border-gray-400 w-full  mb-4'
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
          placeholder='Password'
          className='bg-white px-4 py-2 rounded-lg border border-gray-400 w-full  mb-4'
        />
        <TouchableOpacity
          className='px-4 py-2 rounded-lg bg-black'
          onPress={() => signIn(email, password)}
        >
          <Text className='text-white font-bold text-lg text-center'>
            Sign In
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push('/registration')}
          className='m-2'
        >
          <Text className='text-black text-center'>
            Don't have an account? Click here to sign up
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
