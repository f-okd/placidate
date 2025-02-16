import { TPost } from '@/utils/types';
import { fireEvent, render, screen } from '../__utils__/customRenderer';
import PostPreview from '@/components/PostPreview';

const mockNavigate = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockNavigate,
  }),
}));

const mockPost: TPost = {
  id: 'test-post-id',
  author_id: 'test-author-id',
  title: 'Test Post Title',
  body: 'Test post body content',
  description: 'Test post description',
  post_type: 'story',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe('PostPreview', () => {
  it('renders correctly', () => {
    render(<PostPreview post={mockPost} />);

    expect(screen.getByTestId('post-view')).toBeTruthy();
    expect(screen.getByTestId('post-title')).toHaveTextContent(mockPost.title);
    expect(screen.getByTestId('post-body')).toHaveTextContent(mockPost.body);
  });
  it('should navigate to view the full post after clicking the preview', () => {
    render(<PostPreview post={mockPost} />);

    const postPreview = screen.getByTestId('post-view');
    fireEvent.press(postPreview);

    expect(mockNavigate).toHaveBeenCalledWith(`/post?post_id=${mockPost.id}`);
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });
});
