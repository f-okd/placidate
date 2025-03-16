import { render, screen, fireEvent } from '@/test/__utils__/customRenderer';
import Post from '../../components/Post';
import { TGetHomePagePost } from '@/utils/types';

const mockNavigate = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockNavigate,
  }),
}));

describe('Post Component', () => {
  const mockPost: TGetHomePagePost = {
    id: 'test-post-id',
    author_id: 'test-author-id',
    title: 'Test Post Title',
    body: 'Test post body content',
    description: 'Test post description',
    post_type: 'story',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    profiles: {
      id: 'test-author-id',
      username: 'testauthor',
      avatar_url: null,
    },
    post_tags: [
      {
        tag_id: 'tag1',
        tags: {
          name: 'test-tag',
        },
      },
    ],
  };

  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('successfully renders component with correct information', () => {
    render(<Post post={mockPost} />);

    expect(screen.getByTestId('username')).toHaveTextContent('testauthor');
    expect(screen.getByTestId('post-title')).toHaveTextContent(
      'Test Post Title'
    );
    expect(screen.getByTestId('post-body')).toHaveTextContent(
      'Test post body content'
    );
    expect(screen.getByText('test-tag')).toBeTruthy();
  });

  it('navigates to user profile when username is clicked', () => {
    render(<Post post={mockPost} />);

    const usernameButton = screen.getByText('testauthor');
    fireEvent.press(usernameButton);

    expect(mockNavigate).toHaveBeenCalledWith('/user?user_id=test-author-id');
  });

  it('navigates to post detail when post content is clicked', () => {
    render(<Post post={mockPost} />);

    const postContent = screen.getByText('Test post body content');
    fireEvent.press(postContent);

    expect(mockNavigate).toHaveBeenCalledWith(`/post?post_id=${mockPost.id}`);
  });
  it('should display error message when post is null', () => {
    // @ts-ignore - Intentionally passing null to test error handling
    render(<Post post={null} />);

    expect(screen.getByText('Error: Post is missing')).toBeTruthy();
  });

  it('should display error message when profile is missing', () => {
    const postWithoutProfile: TGetHomePagePost = {
      ...mockPost,
      profiles: null,
    };

    // @ts-ignore - Intentionally passing invalid data to test error handling
    render(<Post post={postWithoutProfile} />);

    expect(screen.getByText('Error: Profile is missing')).toBeTruthy();
  });
});
