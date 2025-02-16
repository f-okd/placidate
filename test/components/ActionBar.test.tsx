// ActionBar.test.tsx
import { render, screen, fireEvent } from '@testing-library/react-native';
import ActionBar from '@/components/ActionBar';

// Mock the auth context
jest.mock('@/providers/AuthProvider', () => ({
  useAuth: () => ({
    profile: { id: 'current-user-id' },
  }),
}));

describe('ActionBar', () => {
  const mockProps = {
    authorId: 'test-author-id',
    liked: false,
    bookmarked: false,
    onLike: jest.fn(),
    onUnlike: jest.fn(),
    onBookmark: jest.fn(),
    onUnbookmark: jest.fn(),
    onDelete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all action buttons', () => {
    render(<ActionBar {...mockProps} />);

    expect(screen.getByTestId('like-button')).toBeTruthy();
    expect(screen.getByTestId('bookmark-button')).toBeTruthy();
    expect(screen.getByTestId('more-options-button')).toBeTruthy();
  });

  it('calls onLike when like button is pressed and post is not liked', () => {
    render(<ActionBar {...mockProps} />);

    fireEvent.press(screen.getByTestId('like-button'));
    expect(mockProps.onLike).toHaveBeenCalled();
    expect(mockProps.onUnlike).not.toHaveBeenCalled();
  });

  it('calls onUnlike when like button is pressed and post is liked', () => {
    render(<ActionBar {...{ ...mockProps, liked: true }} />);

    fireEvent.press(screen.getByTestId('like-button'));
    expect(mockProps.onUnlike).toHaveBeenCalled();
    expect(mockProps.onLike).not.toHaveBeenCalled();
  });

  it('calls onBookmark when bookmark button is pressed and post is not bookmarked', () => {
    render(<ActionBar {...mockProps} />);

    fireEvent.press(screen.getByTestId('bookmark-button'));
    expect(mockProps.onBookmark).toHaveBeenCalled();
    expect(mockProps.onUnbookmark).not.toHaveBeenCalled();
  });

  it('calls onUnbookmark when bookmark button is pressed and post is bookmarked', () => {
    render(<ActionBar {...{ ...mockProps, bookmarked: true }} />);

    fireEvent.press(screen.getByTestId('bookmark-button'));
    expect(mockProps.onUnbookmark).toHaveBeenCalled();
    expect(mockProps.onBookmark).not.toHaveBeenCalled();
  });

  it('opens modal when more options button is pressed', () => {
    render(<ActionBar {...mockProps} />);

    fireEvent.press(screen.getByTestId('more-options-button'));
    expect(screen.getByText('Cancel')).toBeTruthy();
  });

  it('shows delete option when author is current user', () => {
    render(<ActionBar {...{ ...mockProps, authorId: 'current-user-id' }} />);

    fireEvent.press(screen.getByTestId('more-options-button'));
    expect(screen.getByText('Delete post')).toBeTruthy();
    expect(screen.queryByText('Block User')).toBeFalsy();
  });

  it('shows block option when author is not current user', () => {
    render(<ActionBar {...mockProps} />);

    fireEvent.press(screen.getByTestId('more-options-button'));
    expect(screen.getByText('Block User')).toBeTruthy();
    expect(screen.queryByText('Delete post')).toBeFalsy();
  });

  it('calls onDelete when delete option is pressed', () => {
    render(<ActionBar {...{ ...mockProps, authorId: 'current-user-id' }} />);

    fireEvent.press(screen.getByTestId('more-options-button'));
    fireEvent.press(screen.getByText('Delete post'));
    expect(mockProps.onDelete).toHaveBeenCalled();
  });

  it('closes modal when cancel is pressed', () => {
    render(<ActionBar {...mockProps} />);

    fireEvent.press(screen.getByTestId('more-options-button'));
    fireEvent.press(screen.getByText('Cancel'));
    expect(screen.queryByText('Cancel')).toBeFalsy();
  });
});
