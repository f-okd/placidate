import OwnProfileHeader from '@/components/OwnProfileHeader';
import { TProfile } from '@/utils/types';
import { fireEvent, render, screen } from '../__utils__/customRenderer';

const mockNavigate = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockNavigate,
  }),
}));

const mockUserId = 'test-user-id';
const mockProps = {
  id: mockUserId,
  avatar: null,
  bio: 'test bio',
  postCount: 25,
  isFollowing: true,
  followerCount: 50,
  followingCount: 45,
};

describe('ProfileHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('successfully renders component with correct information', () => {
    render(<OwnProfileHeader {...mockProps} />);

    expect(screen.getByTestId('follower-count')).toHaveTextContent('50');
    expect(screen.getByTestId('followers-label')).toHaveTextContent(
      'Followers'
    );
    expect(screen.getByTestId('following-count')).toHaveTextContent('45');
    expect(screen.getByTestId('following-label')).toHaveTextContent(
      'Following'
    );
    expect(screen.getByTestId('edit-profile-button')).toHaveTextContent(
      'Edit profile'
    );
    expect(screen.getByTestId('bio')).toHaveTextContent('test bio');
  });

  it('should navigate to own follower list if user presses followers ', () => {
    render(<OwnProfileHeader {...mockProps} />);

    const followersButton = screen.getByTestId('followers-section');
    fireEvent.press(followersButton);
    expect(mockNavigate).toHaveBeenCalledWith(
      `/followers?user_id=${mockUserId}`
    );
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });

  it('should navigate to own following list if user presses following ', () => {
    render(<OwnProfileHeader {...mockProps} />);

    const followingButton = screen.getByTestId('following-section');
    fireEvent.press(followingButton);
    expect(mockNavigate).toHaveBeenCalledWith(
      `/following?user_id=${mockUserId}`
    );
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });

  it('should navigate to edit profile page if user presses edit profile button ', () => {
    render(<OwnProfileHeader {...mockProps} />);

    const editProfileButton = screen.getByTestId('edit-profile-button');
    fireEvent.press(editProfileButton);
    expect(mockNavigate).toHaveBeenCalledWith('/editProfile');
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });
});
