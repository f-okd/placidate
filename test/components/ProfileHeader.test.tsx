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
  isFollowedBy: true,
  followerCount: 50,
  followingCount: 45,
  onFollow: mockOnFollow,
  onUnfollow: mockOnUnfollow,
  canViewContent: true,
};

describe('ProfileHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('successfully renders component with correct information (null avatar)', () => {
    render(<ProfileHeader {...mockProps} />);

    expect(screen.getByTestId('follower-count')).toHaveTextContent('50');
    expect(screen.getByTestId('follower-label')).toHaveTextContent('Followers');
    expect(screen.getByTestId('following-count')).toHaveTextContent('45');
    expect(screen.getByTestId('following-label')).toHaveTextContent(
      'Following'
    );
    expect(screen.getByTestId('follow-button')).toHaveTextContent('Unfollow');
    expect(screen.getByTestId('message-button')).toHaveTextContent('Message');
    expect(screen.getByTestId('avatar')).toBeTruthy();
  });

  it('successfully renders component with correct information (set avatar)', () => {
    const mockProps = {
      profile: {
        ...mockOtherUser,
        avatar_url: 'https://via.placeholder.com/150/92c952',
      },
      postCount: 25,
      isFollowing: true,
      isFollowedBy: true,
      followerCount: 50,
      followingCount: 45,
      onFollow: mockOnFollow,
      onUnfollow: mockOnUnfollow,
      canViewContent: true,
    };
    render(<ProfileHeader {...mockProps} />);

    expect(screen.getByTestId('follower-count')).toHaveTextContent('50');
    expect(screen.getByTestId('follower-label')).toHaveTextContent('Followers');
    expect(screen.getByTestId('following-count')).toHaveTextContent('45');
    expect(screen.getByTestId('following-label')).toHaveTextContent(
      'Following'
    );
    expect(screen.getByTestId('follow-button')).toHaveTextContent('Unfollow');
    expect(screen.getByTestId('message-button')).toHaveTextContent('Message');
    expect(screen.getByTestId('avatar')).toBeTruthy();
  });

  it('shows option to follow user if not already following user', () => {
    render(<ProfileHeader {...{ ...mockProps, isFollowing: false }} />);

    expect(screen.getByTestId('follow-button')).toHaveTextContent('Follow');
  });

  it('does not show the option to message user if not following user', () => {
    render(<ProfileHeader {...{ ...mockProps, isFollowing: false }} />);

    expect(screen.queryByTestId('message-button')).toBeNull();
  });

  it('does not show the option to message user if following user but user does not follow you', () => {
    render(<ProfileHeader {...{ ...mockProps, isFollowedBy: false }} />);

    expect(screen.queryByTestId('message-button')).toBeNull();
  });

  it('should navigate to chat if user presses the message button', () => {
    render(<ProfileHeader {...mockProps} />);

    const messageButton = screen.getByTestId('message-button');
    fireEvent.press(messageButton);
    expect(mockNavigate).toHaveBeenCalledWith(
      `/chat?user_id=${mockOtherUser.id}`
    );
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });

  it('should navigate to the user’s follower list after pressing follower count or label if mutuals ', () => {
    render(<ProfileHeader {...mockProps} />);

    const followersButton = screen.getByTestId('followers-section');
    fireEvent.press(followersButton);
    expect(mockNavigate).toHaveBeenCalledWith(
      `/followers?user_id=${mockProps.profile.id}&username=${mockProps.profile.username}`
    );
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });

  it('should navigate to the user’s following list after pressing following count or label if mutuals', () => {
    render(<ProfileHeader {...mockProps} />);

    const followingButton = screen.getByTestId('following-section');
    fireEvent.press(followingButton);
    expect(mockNavigate).toHaveBeenCalledWith(
      `/following?user_id=${mockProps.profile.id}&username=${mockProps.profile.username}`
    );
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });

  it("should not navigate to user's follower list if not mutuals ", () => {
    render(<ProfileHeader {...{ ...mockProps, canViewContent: false }} />);

    const followersButton = screen.getByTestId('followers-section');
    fireEvent.press(followersButton);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("should not navigate to user's following list if not mutuals", () => {
    render(<ProfileHeader {...{ ...mockProps, canViewContent: false }} />);

    const followingButton = screen.getByTestId('following-section');
    fireEvent.press(followingButton);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should show "Read more" button when bio exceeds 25 words', () => {
    const longBioProps = {
      ...mockProps,
      profile: {
        ...mockOtherUser,
        bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi. Proin porttitor, orci nec.',
      },
    };

    render(<ProfileHeader {...longBioProps} />);

    expect(screen.getByText('Read more')).toBeTruthy();
  });

  it('should expand bio when "Read more" is clicked', () => {
    const longBio =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi. Proin porttitor, orci nec.';

    const longBioProps = {
      ...mockProps,
      profile: {
        ...mockOtherUser,
        bio: longBio,
      },
    };

    render(<ProfileHeader {...longBioProps} />);

    const readMoreButton = screen.getByText('Read more');
    fireEvent.press(readMoreButton);

    expect(screen.getByText('Show less')).toBeTruthy();
  });

  it('should handle follow action when follow button is pressed', () => {
    render(<ProfileHeader {...{ ...mockProps, isFollowing: false }} />);

    const followButton = screen.getByTestId('follow-button');
    fireEvent.press(followButton);

    expect(mockOnFollow).toHaveBeenCalledTimes(1);
  });

  it('should handle unfollow action when unfollow button is pressed', () => {
    render(<ProfileHeader {...mockProps} />);

    const unfollowButton = screen.getByTestId('follow-button');
    fireEvent.press(unfollowButton);

    expect(mockOnUnfollow).toHaveBeenCalledTimes(1);
  });
});
