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

  it('successfully renders component with correct information (null avatar)', () => {
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
    expect(screen.getByTestId('avatar')).toBeTruthy();
  });
  it('successfully renders component with correct information (set avatar)', () => {
    render(
      <OwnProfileHeader
        {...{ ...mockProps, avatar: 'https://via.placeholder.com/150/92c952' }}
      />
    );

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
    expect(screen.getByTestId('avatar')).toBeTruthy();
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
  it('should show "Read more" button when bio exceeds 25 words', () => {
    const longBioProps = {
      ...mockProps,
      bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi. Proin porttitor, orci nec.',
    };

    render(<OwnProfileHeader {...longBioProps} />);

    expect(screen.getByText('Read more')).toBeTruthy();
    expect(screen.getByTestId('bio').props.children).toContain('...');
  });

  it('should expand bio when "Read more" is clicked', () => {
    const longBio =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi. Proin porttitor, orci nec.';

    const longBioProps = {
      ...mockProps,
      bio: longBio,
    };

    render(<OwnProfileHeader {...longBioProps} />);

    const readMoreButton = screen.getByText('Read more');
    fireEvent.press(readMoreButton);

    expect(screen.getByText('Show less')).toBeTruthy();
    expect(screen.getByTestId('bio').props.children).toBe(longBio);
  });

  it('should collapse bio when "Show less" is clicked after expanding', () => {
    const longBio =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi. Proin porttitor, orci nec.';

    const longBioProps = {
      ...mockProps,
      bio: longBio,
    };

    render(<OwnProfileHeader {...longBioProps} />);

    // First expand the bio
    const readMoreButton = screen.getByText('Read more');
    fireEvent.press(readMoreButton);

    // Then collapse it
    const showLessButton = screen.getByText('Show less');
    fireEvent.press(showLessButton);

    expect(screen.getByText('Read more')).toBeTruthy();
    expect(screen.getByTestId('bio').props.children).toContain('...');
  });

  it('should not show "Read more" button when bio is 25 words or less', () => {
    const shortBioProps = {
      ...mockProps,
      bio: 'This is a short bio with less than twenty-five words.',
    };

    render(<OwnProfileHeader {...shortBioProps} />);

    expect(screen.queryByText('Read more')).toBeNull();
    expect(screen.getByTestId('bio').props.children).toBe(shortBioProps.bio);
  });
});
