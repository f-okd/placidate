import FollowerListSearchResult from '@/components/FollowerListSearchResult';
import { fireEvent, render, screen } from '../__utils__/customRenderer';
import { Router } from 'expo-router';
import { TProfile } from '@/utils/types';

const mockNavigate = jest.fn();
const mockRouter = {
  push: mockNavigate,
} as unknown as Router;

const mockRemoveFollower = jest.fn();
const mockProfile: TProfile = {
  id: 'test-user-id',
  bio: 'test bio',
  username: 'test user',
  avatar_url: null,
  is_private: null,
  updated_at: null,
};
const mockProps = {
  profile: mockProfile,
  router: mockRouter,
  onRemoveFollower: mockRemoveFollower,
  ownList: false,
};

describe('FollowerListSearchResult', () => {
  it('successfully renders component with correct information', () => {
    render(<FollowerListSearchResult {...mockProps} />);

    expect(screen.getByTestId('search-result')).toBeTruthy();
    expect(screen.getByTestId('avatar')).toBeTruthy();
    expect(screen.getByTestId('username')).toHaveTextContent('test user');

    expect(screen.queryByTestId('remove-follower-button-button')).toBeNull();
  });
  it('shows remove follower button when user is viewing their own list', () => {
    render(<FollowerListSearchResult {...{ ...mockProps, ownList: true }} />);

    expect(screen.getByTestId('remove-follower-button')).toBeTruthy();
  });
  it('calls the onRemoveFollower prop function when the remove follower button is pressed', () => {
    render(<FollowerListSearchResult {...{ ...mockProps, ownList: true }} />);

    const removeFollowerButton = screen.getByTestId('remove-follower-button');
    fireEvent.press(removeFollowerButton);
    expect(mockRemoveFollower).toHaveBeenCalledWith(mockProfile.id);
    expect(mockRemoveFollower).toHaveBeenCalledTimes(1);
  });
});
