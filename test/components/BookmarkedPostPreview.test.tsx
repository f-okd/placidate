//@ts-nocheck

// BookmarkedPostPreview.test.tsx
import { render, screen, fireEvent } from '@testing-library/react-native';
import BookmarkedPostPreview from '@/components/BookmarkedPostPreview';
import { TPost } from '@/utils/types';

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons/Ionicons', () => 'Ionicons');

// Mock the UserPostInteractionEndpoint module
jest.mock('@/lib/supabase/UserPostInteractionEndpoint', () => {
  return jest.fn().mockImplementation(() => ({
    unbookmarkPost: jest.fn().mockResolvedValue(undefined),
  }));
});

// Mock the PostPreview component
jest.mock('@/components/PostPreview', () => {
  return jest
    .fn()
    .mockImplementation(({ post }) => (
      <div testID='mocked-post-preview'>{post.title}</div>
    ));
});

describe('BookmarkedPostPreview', () => {
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

  const mockProps = {
    userId: 'test-user-id',
    post: mockPost,
    onRemoveBookmark: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<BookmarkedPostPreview {...mockProps} />);

    expect(screen.getByTestId('bookmarked-post-container')).toBeTruthy();
    expect(screen.getByTestId('post-preview-container')).toBeTruthy();
    expect(screen.getByTestId('unbookmark-button')).toBeTruthy();
  });

  it('calls onRemoveBookmark when unbookmark button is pressed', async () => {
    render(<BookmarkedPostPreview {...mockProps} />);

    const unbookmarkButton = screen.getByTestId('unbookmark-button');
    fireEvent.press(unbookmarkButton);

    // Wait for the async operation to complete
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockProps.onRemoveBookmark).toHaveBeenCalledWith(mockPost.id);
  });
});
