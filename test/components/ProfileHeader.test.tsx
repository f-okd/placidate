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

  it('renders correctly', () => {
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
  it('should navigate to inbox if user clicks to message other user option to follow user if not already following user', () => {
    render(<ProfileHeader {...mockProps} />);

    const messageButton = screen.getByTestId('message-button');
    fireEvent.press(messageButton);
    expect(mockNavigate).toHaveBeenCalledWith('/inbox');
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });
});
