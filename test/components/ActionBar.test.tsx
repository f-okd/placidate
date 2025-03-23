// ActionBar.test.tsx
import { render, screen, fireEvent, act } from '../__utils__/customRenderer';
import ActionBar from '@/components/ActionBar';
import { getMockSupabaseUserUserInteractionEndpoint } from '../__mocks__/supabase/UserUserInteractionEndpoint';

// Mock the auth context
jest.mock('@/providers/AuthProvider', () => ({
  useAuth: () => ({
    profile: { id: 'current-user-id' },
  }),
}));

const mockNavigate = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockNavigate,
  }),
}));

const mockBlockUser = jest.fn();
const mockEndpoint = getMockSupabaseUserUserInteractionEndpoint();
jest.mock('@/lib/supabase/UserUserInteractionEndpoint', () => {
  return jest.fn().mockImplementation(() => ({
    ...mockEndpoint,
    blockUser: mockBlockUser,
  }));
});

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
    onEdit: jest.fn(),
    onShare: jest.fn(),
    onSendInChat: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all action buttons', () => {
    render(<ActionBar {...mockProps} />);

    expect(screen.getByTestId('like-button')).toBeTruthy();
    expect(screen.getByTestId('bookmark-button')).toBeTruthy();
    expect(screen.getByTestId('more-options-button')).toBeTruthy();
  });

  it('should call onLike when like button is pressed and post is not liked', async () => {
    render(<ActionBar {...mockProps} />);

    await act(async () => {
      fireEvent.press(screen.getByTestId('like-button'));
    });

    expect(mockProps.onLike).toHaveBeenCalled();
    expect(mockProps.onUnlike).not.toHaveBeenCalled();
  });

  it('should call onUnlike when like button is pressed and post is liked', async () => {
    render(<ActionBar {...{ ...mockProps, liked: true }} />);

    await act(async () => {
      fireEvent.press(screen.getByTestId('like-button'));
    });

    expect(mockProps.onUnlike).toHaveBeenCalled();
    expect(mockProps.onLike).not.toHaveBeenCalled();
  });

  it('should call onBookmark when bookmark button is pressed and post is not bookmarked', async () => {
    render(<ActionBar {...mockProps} />);

    await act(async () => {
      fireEvent.press(screen.getByTestId('bookmark-button'));
    });

    expect(mockProps.onBookmark).toHaveBeenCalled();
    expect(mockProps.onUnbookmark).not.toHaveBeenCalled();
  });

  it('should call onUnbookmark when bookmark button is pressed and post is bookmarked', async () => {
    render(<ActionBar {...{ ...mockProps, bookmarked: true }} />);

    await act(async () => {
      fireEvent.press(screen.getByTestId('bookmark-button'));
    });

    expect(mockProps.onUnbookmark).toHaveBeenCalled();
    expect(mockProps.onBookmark).not.toHaveBeenCalled();
  });

  it('should open options modal when more options button is pressed', async () => {
    render(<ActionBar {...mockProps} />);

    await act(async () => {
      fireEvent.press(screen.getByTestId('more-options-button'));
    });

    expect(screen.getByText('Cancel')).toBeTruthy();
    expect(screen.queryByTestId('modal')).toBeTruthy();
  });

  it('should show share post, send as message, block, and report buttons after pressing options button when author is not current user', async () => {
    render(<ActionBar {...mockProps} />);

    await act(async () => {
      fireEvent.press(screen.getByTestId('more-options-button'));
    });

    expect(screen.queryByTestId('edit-button')).toBeNull();
    expect(screen.queryByTestId('delete-button')).toBeNull();
    expect(screen.getByTestId('send-button')).toBeTruthy();
    expect(screen.getByTestId('share-button')).toBeTruthy();
    expect(screen.getByTestId('report-button')).toBeTruthy();
    expect(screen.getByTestId('block-button')).toBeTruthy();
  });

  it('should call onShare when share button is pressed', async () => {
    render(<ActionBar {...mockProps} />);

    await act(async () => {
      fireEvent.press(screen.getByTestId('more-options-button'));
    });

    fireEvent.press(screen.getByTestId('share-button'));

    expect(mockProps.onShare).toHaveBeenCalled();
  });

  it('should call onSendInChat when "Send as Message" button is pressed', async () => {
    render(<ActionBar {...mockProps} />);

    await act(async () => {
      fireEvent.press(screen.getByTestId('more-options-button'));
    });

    fireEvent.press(screen.getByTestId('send-button'));

    expect(mockProps.onSendInChat).toHaveBeenCalled();
  });

  it('should call UserUserEndpoint to block user when block button is pressed', async () => {
    render(<ActionBar {...mockProps} />);

    await act(async () => {
      fireEvent.press(screen.getByTestId('more-options-button'));
    });
    await act(async () => {
      fireEvent.press(screen.getByTestId('block-button'));
    });

    expect(mockBlockUser).toHaveBeenCalledTimes(1);
    expect(mockBlockUser).toHaveBeenCalledWith(
      'current-user-id',
      mockProps.authorId
    );
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/(tabs)');
  });

  it('should call UserUserEndpoint to block user when report button is pressed', async () => {
    render(<ActionBar {...mockProps} />);

    await act(async () => {
      fireEvent.press(screen.getByTestId('more-options-button'));
    });
    await act(async () => {
      fireEvent.press(screen.getByTestId('report-button'));
    });

    expect(mockBlockUser).toHaveBeenCalledTimes(1);
    expect(mockBlockUser).toHaveBeenCalledWith(
      'current-user-id',
      mockProps.authorId
    );
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/(tabs)');
  });

  it('should show share post, send as message, edit post and delete post buttons after pressing the options button when author is current user', async () => {
    render(<ActionBar {...{ ...mockProps, authorId: 'current-user-id' }} />);

    await act(async () => {
      fireEvent.press(screen.getByTestId('more-options-button'));
    });

    expect(screen.getByTestId('send-button')).toBeTruthy();
    expect(screen.getByTestId('share-button')).toBeTruthy();
    expect(screen.getByTestId('edit-button')).toBeTruthy();
    expect(screen.getByTestId('delete-button')).toBeTruthy();
    expect(screen.queryByTestId('report-button')).toBeNull();
    expect(screen.queryByTestId('block-button')).toBeNull();
  });

  it('should call onDelete when delete button is pressed', async () => {
    render(<ActionBar {...{ ...mockProps, authorId: 'current-user-id' }} />);

    await act(async () => {
      fireEvent.press(screen.getByTestId('more-options-button'));
    });
    await act(async () => {
      fireEvent.press(screen.getByText('Delete post'));
    });

    expect(mockProps.onDelete).toHaveBeenCalled();
  });

  it('should call onEdit when edit post button is pressed', async () => {
    render(<ActionBar {...{ ...mockProps, authorId: 'current-user-id' }} />);

    await act(async () => {
      fireEvent.press(screen.getByTestId('more-options-button'));
    });
    await act(async () => {
      fireEvent.press(screen.getByText('Edit post'));
    });

    expect(mockProps.onEdit).toHaveBeenCalled();
  });

  it('should close modal when cancel is pressed', async () => {
    render(<ActionBar {...mockProps} />);

    await act(async () => {
      fireEvent.press(screen.getByTestId('more-options-button'));
    });

    expect(screen.queryByTestId('modal')).toBeTruthy();

    await act(async () => {
      fireEvent.press(screen.getByText('Cancel'));
    });

    expect(screen.queryByTestId('modal')).toBeNull();
  });
});
