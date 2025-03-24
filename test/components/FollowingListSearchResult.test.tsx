import FollowingListSearchResult from '@/components/FollowingListSearchResult';
import { fireEvent, render, screen } from '../__utils__/customRenderer';
import { Router } from 'expo-router';
import { TProfile } from '@/utils/types';

const mockNavigate = jest.fn();
const mockRouter = {
  push: mockNavigate,
} as unknown as Router;

const mockUnfollow = jest.fn();
const mockProfile: TProfile = {
  id: 'test-user-id',
  bio: 'test bio',
  username: 'test user',
  avatar_url: null,
  is_private: null,
  updated_at: null,
  bookmark_visibility: 'private',
};
const mockProps = {
  profile: mockProfile,
  router: mockRouter,
  onUnfollow: mockUnfollow,
  ownList: false,
};

describe('FollowingListSearchResult', () => {
  it('successfully renders component with correct information (null avatar)', () => {
    render(<FollowingListSearchResult {...mockProps} />);

    expect(screen.getByTestId('search-result')).toBeTruthy();
    expect(screen.getByTestId('avatar')).toBeTruthy();
    expect(screen.getByTestId('username')).toHaveTextContent('test user');

    expect(screen.queryByTestId('unfollow-button')).toBeNull();
  });

  it('successfully renders component with correct information (set avatar)', () => {
    const mockProps = {
      profile: {
        ...mockProfile,
        avatar_url: 'https://via.placeholder.com/150/92c952',
      },
      router: mockRouter,
      onUnfollow: mockUnfollow,
      ownList: false,
    };
    render(<FollowingListSearchResult {...mockProps} />);

    expect(screen.getByTestId('search-result')).toBeTruthy();
    expect(screen.getByTestId('avatar')).toBeTruthy();
    expect(screen.getByTestId('username')).toHaveTextContent('test user');

    expect(screen.queryByTestId('unfollow-button')).toBeNull();
  });

  it('shows unfollow button when user is viewing their own list', () => {
    render(<FollowingListSearchResult {...{ ...mockProps, ownList: true }} />);

    expect(screen.getByTestId('unfollow-button')).toBeTruthy();
  });

  it('calls the onUnfollow prop function when the unfollow button is pressed', () => {
    render(<FollowingListSearchResult {...{ ...mockProps, ownList: true }} />);

    const unfollowButton = screen.getByTestId('unfollow-button');
    fireEvent.press(unfollowButton);
    expect(mockUnfollow).toHaveBeenCalledWith(mockProfile.id);
    expect(mockUnfollow).toHaveBeenCalledTimes(1);
  });
});
