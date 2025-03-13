import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

const supabaseUrl =
  process.env.EXPO_PUBLIC_NODE_ENV == 'test'
    ? String(process.env.EXPO_PUBLIC_TESTING_SUPABASE_URL)
    : String(process.env.EXPO_PUBLIC_SUPABASE_URL);
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_NODE_ENV == 'test'
    ? String(process.env.EXPO_PUBLIC_TESTING_SUPABASE_ANON_KEY)
    : String(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
