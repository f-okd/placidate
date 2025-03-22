import { render, screen, fireEvent } from '../__utils__/customRenderer';
import InboxChatPreview from '@/components/InboxChatPreview';
import { TProfile } from '@/utils/types';

const mockNavigate = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockNavigate,
  }),
}));

describe('InboxChatPreview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockUser: TProfile = {
    id: 'user-123',
    username: 'testuser',
    avatar_url: 'https://example.com/avatar.jpg',
    bio: 'Test bio',
    is_private: false,
    updated_at: null,
  };

  it('should render correctly', () => {
    render(<InboxChatPreview user={mockUser} />);

    expect(screen.getByTestId('username')).toHaveTextContent('testuser');
    expect(screen.getByTestId('avatar')).toBeTruthy();
    expect(screen.getByTestId('message-preview')).toHaveTextContent(
      'Say hi 👋'
    );
    expect(screen.getByTestId('forward-button')).toBeTruthy();
  });

  it('should render correctly (null avatar)', () => {
    const userWithAvatar = {
      ...mockUser,
      avatar_url: null,
    };

    render(<InboxChatPreview user={userWithAvatar} />);
    expect(screen.getByTestId('username')).toHaveTextContent('testuser');
    expect(screen.getByTestId('avatar')).toBeTruthy();
    expect(screen.getByTestId('message-preview')).toHaveTextContent(
      'Say hi 👋'
    );
    expect(screen.getByTestId('forward-button')).toBeTruthy();
  });

  it('should navigate to chat when preview component ispressed', () => {
    render(<InboxChatPreview user={mockUser} />);

    const chatPreview = screen.getByTestId('chat-preview-component');
    fireEvent.press(chatPreview);

    expect(mockNavigate).toHaveBeenCalledWith(`/chat?user_id=${mockUser.id}`);
  });
});
