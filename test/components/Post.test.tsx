// import { render, screen, fireEvent } from '../__utils__/customRenderer.ts';
import { render, screen, fireEvent } from '@/utils/customRenderer';
import Post from '../../components/Post';
import { TGetHomePagePost } from '@/utils/types';

const mockNavigate = jest.fn();

// Mock the router
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

  it('renders post content correctly', () => {
    render(<Post post={mockPost} />);

    expect(screen.getByText('testauthor')).toBeTruthy();
    expect(screen.getByText('Test post body content')).toBeTruthy();
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

    expect(mockNavigate).toHaveBeenCalledWith('/post?post_id=test-post-id');
  });
});
