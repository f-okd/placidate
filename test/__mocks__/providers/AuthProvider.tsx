import { TProfile } from '@/utils/types';
import { createContext, ReactNode, useContext } from 'react';

export const mockProfile: TProfile = {
  id: 'test-user-id',
  username: 'testuser',
  bio: 'Test user bio',
  avatar_url: null,
  updated_at: new Date().toISOString(),
  is_private: false,
};

export const mockAuthContext = {
  profile: mockProfile,
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
  refreshProfile: jest.fn(),
};

export const AuthContext = createContext(mockAuthContext);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  return (
    <AuthContext.Provider value={mockAuthContext}>
      {children}
    </AuthContext.Provider>
  );
};
