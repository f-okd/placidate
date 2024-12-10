import Header from '@/components/Header';
import { Profile, useAuth } from '@/providers/AuthProvider';
import { getProfile } from '@/utils/userUserInteractions';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

export default function OtherUsersProfileScreen() {
  const { user_id } = useLocalSearchParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile(String(user_id));
        if (!data) {
          return console.error('Could not find profile:', user_id);
        }
        setProfile(data);
        setLoading(false);
      } catch (error) {
        return console.error('Error fetching profile:', error);
      }
    };
    fetchProfile();
  }, [user_id]);

  if (loading) {
    return (
      <View>
        <Text>Loading</Text>
      </View>
    );
  }
  if (!profile) {
    console.error('No profile set');
    return router.back();
  }
  return (
    <View className=''>
      <Header title={profile.username} showBackIcon />

      <Text className='text-black font-bold text-l'>
        {JSON.stringify(profile)}
      </Text>
    </View>
  );
}
