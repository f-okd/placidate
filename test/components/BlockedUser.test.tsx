import { TProfile } from '@/utils/types';
import { fireEvent, render, screen } from '../__utils__/customRenderer';

import BlockedUser from '@/components/BlockedUser';
const mockUser: TProfile = {
  avatar_url: null,
  bio: null,
  id: 'test-id',
  is_private: null,
  updated_at: null,
  username: 'test-user',
  bookmark_visibility: 'private',
};

describe('BlockedUser', () => {
  const mockProps = {
    profile: mockUser,
    onUnblock: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('successfully renders component with correct information (null avatar)', () => {
    render(<BlockedUser {...mockProps} />);

    expect(screen.getByTestId('blocked-user-avatar')).toBeTruthy();
    expect(screen.getByTestId('blocked-user-username')).toHaveTextContent(
      'test-user'
    );
    expect(screen.getByTestId('unblock-button')).toBeTruthy();
  });
  it('successfully renders component with correct information (set avatar)', () => {
    const mockProps = {
      profile: {
        ...mockUser,
        avatar_url: 'https://via.placeholder.com/150/92c952',
      },
      onUnblock: jest.fn(),
    };
    render(<BlockedUser {...mockProps} />);

    expect(screen.getByTestId('blocked-user-avatar')).toBeTruthy();
    expect(screen.getByTestId('blocked-user-username')).toHaveTextContent(
      'test-user'
    );
    expect(screen.getByTestId('unblock-button')).toBeTruthy();
  });

  it('calls unblock function with correct userId when user clicks unblock button', () => {
    render(<BlockedUser {...mockProps} />);

    const unblockButton = screen.getByTestId('unblock-button');

    fireEvent.press(unblockButton);

    expect(mockProps.onUnblock).toHaveBeenCalledWith('test-id');
  });
});
