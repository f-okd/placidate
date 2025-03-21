import { AuthProvider } from '@/providers/AuthProvider';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import '../global.css';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name='(auth)' options={{ headerShown: false }} />
        <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
        <Stack.Screen name='chat' options={{ headerShown: false }} />
        <Stack.Screen name='recentFollowers' options={{ headerShown: false }} />
        <Stack.Screen name='activity' options={{ headerShown: false }} />
        <Stack.Screen name='followers' options={{ headerShown: false }} />
        <Stack.Screen name='following' options={{ headerShown: false }} />
        <Stack.Screen name='settings' options={{ headerShown: false }} />
        <Stack.Screen name='blockedUsers' options={{ headerShown: false }} />
        <Stack.Screen name='bookmarks' options={{ headerShown: false }} />
        <Stack.Screen name='editProfile' options={{ headerShown: false }} />
        <Stack.Screen name='post' options={{ headerShown: false }} />
        <Stack.Screen name='user' options={{ headerShown: false }} />
        <Stack.Screen name='+not-found' />
      </Stack>
    </AuthProvider>
  );
}
