import { supabase } from '@/utils/supabase/supabase';
import { Database } from '@/utils/supabase/types';
import { useRouter } from 'expo-router';
import { createContext, ReactNode, useContext, useState } from 'react';

export type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  profile: Profile | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  profile: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] =
    useState<Database['public']['Tables']['profiles']>();
  const router = useRouter();

  const getProfile = async (id: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return console.error(error);
    setProfile(data);
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return console.error(error);
    getProfile(data.user.id);
    router.push('/(tabs)');
  };

  const signUp = async (email: string, password: string, username: string) => {
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
    if (!data.user) return console.error('no user');

    getProfile(data.user.id);
    router.push('/(tabs)');
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) return console.error(error);
  };

  return (
    <AuthContext.Provider value={{ profile, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
