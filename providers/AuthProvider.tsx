import { supabase } from '@/lib/supabase/client';
import { Database } from '@/lib/supabase/types';
import SupabaseUserEndpoint from '@/lib/supabase/UserEndpoint';
import { showToast } from '@/utils/helpers';
import { useRouter } from 'expo-router';
import { createContext, ReactNode, useContext, useState } from 'react';
import * as EmailValidator from 'email-validator';

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

  const userEndpoint = new SupabaseUserEndpoint();

  const signIn = async (email: string, password: string) => {
    if (!email) return showToast('Missing email');
    if (!password) return showToast('Missing password');
    if (!EmailValidator.validate(email)) return showToast('Invalid email');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error?.message == 'Invalid login credentials')
      return showToast('Invalid login credentials');
    if (error) return console.error(error);

    const profile = await userEndpoint.getProfile(data.user.id);

    if (!profile)
      return console.error(
        'Error signing in: Could not fetch profile for user ID'
      );

    setProfile(profile);
    router.push('/(tabs)');
  };

  const refreshProfile = async (): Promise<void> => {
    const prof = await userEndpoint.getProfile(String(profile?.id));

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
    if (!email) return showToast('Missing email');
    if (!password) return showToast('Missing password');
    if (!username) return showToast('Missing password');

    if (!EmailValidator.validate(email)) return showToast('Invalid email');

    if (password.length < 16)
      return showToast(
        'Password too short: Must be 16 characters long. Try a memorable phrase'
      );
    if (username.length < 3)
      return showToast(
        'Username too short: Must be at least 5 characters long.'
      );
    if (username.length > 12)
      return showToast(
        'Username too long: Must be less than 13 characters long.'
      );

    const userEndpoint = new SupabaseUserEndpoint();
    const usernameUnavailable = await userEndpoint.userExists(username);

    if (usernameUnavailable) return showToast('Username is taken');

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

    let profile = await userEndpoint.getProfile(data.user.id);

    if (!profile)
      return console.error(
        'Error signing in: Could not fetch profile for user ID'
      );

    if (avatarUri) {
      await userEndpoint.saveProfilePicture(profile.id, avatarUri);
      profile = await userEndpoint.getProfile(data.user.id);

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
