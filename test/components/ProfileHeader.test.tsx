import ProfileHeader from '@/components/ProfileHeader';
import { TProfile } from '@/utils/types';
import { fireEvent, render, screen } from '../__utils__/customRenderer';

const mockNavigate = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockNavigate,
  }),
}));

const mockOtherUser: TProfile = {
  avatar_url: null,
  bio: null,
  id: 'test-otherUserId',
  is_private: null,
  updated_at: null,
  username: 'headerTest-otherUser',
};

const mockOnFollow = jest.fn();
const mockOnUnfollow = jest.fn();

const mockProps = {
  profile: mockOtherUser,
  postCount: 25,
  isFollowing: true,
  followerCount: 50,
  followingCount: 45,
  onFollow: mockOnFollow,
  onUnfollow: mockOnUnfollow,
};

describe('ProfileHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('successfully renders component with correct information', () => {
    render(<ProfileHeader {...mockProps} />);

    expect(screen.getByTestId('follower-count')).toHaveTextContent('50');
    expect(screen.getByTestId('follower-label')).toHaveTextContent('Followers');
    expect(screen.getByTestId('following-count')).toHaveTextContent('45');
    expect(screen.getByTestId('following-label')).toHaveTextContent(
      'Following'
    );
    expect(screen.getByTestId('follow-button')).toHaveTextContent('Unfollow');
    expect(screen.getByTestId('message-button')).toHaveTextContent('Message');
  });
  it('shows option to follow user if not already following user', () => {
    render(<ProfileHeader {...{ ...mockProps, isFollowing: false }} />);

    expect(screen.getByTestId('follow-button')).toHaveTextContent('Follow');
  });
  it('does not show the option to message user if not following user', () => {
    render(<ProfileHeader {...{ ...mockProps, isFollowing: false }} />);

    expect(screen.queryByTestId('message-button')).toBeNull();
  });
  it('should navigate to inbox if user clicks to message other user option to follow user if not already following user', () => {
    render(<ProfileHeader {...mockProps} />);

    const messageButton = screen.getByTestId('message-button');
    fireEvent.press(messageButton);
    expect(mockNavigate).toHaveBeenCalledWith('/inbox');
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });
  it('should navigate to own follower list if user presses followers ', () => {
    render(<ProfileHeader {...mockProps} />);

    const followersButton = screen.getByTestId('followers-section');
    fireEvent.press(followersButton);
    expect(mockNavigate).toHaveBeenCalledWith(
      `/followers?user_id=${mockProps.profile.id}&username=${mockProps.profile.username}`
    );
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });
  it('should navigate to own following list if user presses following ', () => {
    render(<ProfileHeader {...mockProps} />);

    const followingButton = screen.getByTestId('following-section');
    fireEvent.press(followingButton);
    expect(mockNavigate).toHaveBeenCalledWith(
      `/following?user_id=${mockProps.profile.id}&username=${mockProps.profile.username}`
    );
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });
});
