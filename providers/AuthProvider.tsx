import { supabase } from '@/utils/supabase/client';
import { Database } from '@/utils/supabase/types';
import { saveImage } from '@/utils/users';
import { getProfile } from '@/utils/userUserInteractions';
import { useRouter } from 'expo-router';
import { createContext, ReactNode, useContext, useState } from 'react';

export type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  profile: Profile | undefined | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    username: string,
    avatarUri: string | null
  ) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  profile: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] =
    useState<Database['public']['Tables']['profiles']['Row']>();
  const router = useRouter();

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return console.error(error);

    const profile = await getProfile(data.user.id);

    if (!profile)
      return console.error(
        'Error signing in: Could not fetch profile for user ID'
      );

    setProfile(profile);
    router.push('/(tabs)');
  };

  const refreshProfile = async (): Promise<void> => {
    const prof = await getProfile(String(profile?.id));

    if (!prof)
      return console.error(
        'Error signing in: Could not fetch profile for user ID'
      );

    setProfile(prof);
    router.push('/(tabs)/profile');
  };

  const signUp = async (
    email: string,
    password: string,
    username: string,
    avatarUri: string | null
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          avatar_url: null,
        },
      },
    });
    if (error) return console.error(error);

    if (!data.user)
      return console.error(
        'Error Signing Up: Could not update user and session'
      );

    let profile = await getProfile(data.user.id);

    if (!profile)
      return console.error(
        'Error signing in: Could not fetch profile for user ID'
      );

    if (avatarUri) {
      await saveImage(profile.id, avatarUri);
      profile = await getProfile(data.user.id);

      if (!profile)
        return console.error(
          'Error signing in: Could not fetch profile for user ID'
        );
    }

    setProfile(profile);
    router.push('/(tabs)');
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) return console.error(error);
    router.dismissAll();
    router.replace('/(auth)');
    setProfile(undefined);
  };

  return (
    <AuthContext.Provider
      value={{ profile, signIn, signUp, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};
