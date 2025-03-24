import { render, screen, fireEvent } from '../__utils__/customRenderer';
import ActivityItem from '@/components/ActivityItem';
import { ActivityRecord, TProfile } from '@/utils/types';

const mockNavigate = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockNavigate,
  }),
}));

const mockUser: TProfile = {
  id: 'user-123',
  username: 'testuser',
  avatar_url: 'https://via.placeholder.com/150/92c952',
  bio: null,
  is_private: false,
  updated_at: null,
  bookmark_visibility: 'private',
};

const mockPost = {
  id: 'post-123',
  title: 'Test Post',
  post_type: 'poem',
  author_id: 'author-123',
};

const mockActivityBase = {
  id: 'activity-123',
  created_at: new Date().toISOString(),
  user: mockUser,
  post: mockPost,
};

describe('ActivityItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders like activity correctly', () => {
    const mockLikeActivity: ActivityRecord = {
      ...mockActivityBase,
      type: 'like',
    };

    render(<ActivityItem item={mockLikeActivity} />);

    expect(screen.getByTestId('activity-text')).toHaveTextContent(
      `${mockUser.username} liked your ${mockPost.post_type}: "${mockPost.title}"`
    );
    expect(screen.getByTestId('avatar')).toBeTruthy();
    expect(screen.getByTestId('timestamp')).toBeTruthy();
    expect(screen.getByTestId('timestamp')).toHaveTextContent(
      'less than a minute ago'
    );
  });

  it('renders comment activity correctly', () => {
    const mockCommentActivity: ActivityRecord = {
      ...mockActivityBase,
      type: 'comment',
      body: 'This is a comment',
    };

    render(<ActivityItem item={mockCommentActivity} />);

    expect(screen.getByTestId('activity-text')).toHaveTextContent(
      `${mockUser.username} commented on your ${mockPost.post_type}: "${mockPost.title}"`
    );
    expect(screen.getByTestId('comment-body')).toHaveTextContent(
      `"${mockCommentActivity.body as string}"`
    );
  });

  it('renders bookmark activity correctly', () => {
    const mockBookmarkActivity: ActivityRecord = {
      ...mockActivityBase,
      type: 'bookmark',
    };

    render(<ActivityItem item={mockBookmarkActivity} />);

    expect(screen.getByTestId('activity-text')).toHaveTextContent(
      `${mockUser.username} bookmarked your ${mockPost.post_type}: "${mockPost.title}"`
    );
  });

  it('It should render activity with default avatar when one is not provided', () => {
    const activityWithAvatar: ActivityRecord = {
      ...mockActivityBase,
      type: 'like',
      user: {
        ...mockUser,
        avatar_url: null,
      },
    };

    render(<ActivityItem item={activityWithAvatar} />);

    const avatar = screen.getByTestId('avatar');
    expect(avatar).toBeTruthy();
  });

  it('navigates to user profile when user section is pressed', () => {
    render(<ActivityItem item={{ ...mockActivityBase, type: 'like' }} />);

    const userSection = screen.getByTestId('user-section');
    fireEvent.press(userSection);

    expect(mockNavigate).toHaveBeenCalledWith(`/user?user_id=${mockUser.id}`);
  });

  it('navigates to post when activity item is clicked', () => {
    render(<ActivityItem item={{ ...mockActivityBase, type: 'like' }} />);

    const activityItem = screen.getByTestId('activity-item-component');
    fireEvent.press(activityItem);

    expect(mockNavigate).toHaveBeenCalledWith(`/post?post_id=${mockPost.id}`);
  });

  it('displays formatted time', () => {
    const fixedDate = new Date();
    fixedDate.setHours(fixedDate.getHours() - 3); // 3 hours ago

    const activityWithTime: ActivityRecord = {
      ...mockActivityBase,
      type: 'like',
      created_at: fixedDate.toISOString(),
    };

    render(<ActivityItem item={activityWithTime} />);
    expect(screen.getByTestId('timestamp')).toBeTruthy();
    expect(screen.getByTestId('timestamp')).toHaveTextContent(
      'about 3 hours ago'
    );
  });
});
