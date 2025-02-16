import { TProfile } from '@/utils/types';
import { act, fireEvent, render, screen } from '../__utils__/customRenderer';
import Header from '@/components/OtherUserTopLevelHeader';
import { getMockSupabaseUserUserInteractionEndpoint } from '../__mocks__/supabase/UserUserInteractionEndpoint';

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

const mockOtherUser: TProfile = {
  avatar_url: null,
  bio: null,
  id: 'test-otherUserId',
  is_private: null,
  updated_at: null,
  username: 'headerTest-otherUser',
};

const mockCurrentlyLoggedInUser: TProfile = {
  avatar_url: null,
  bio: null,
  id: 'test-userId',
  is_private: null,
  updated_at: null,
  username: 'headerTest-user',
};

describe('comment', () => {
  const mockProps = {
    currentlyLoggedInUser: mockCurrentlyLoggedInUser,
    currentlyViewedUser: mockOtherUser,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('successfully renders component with correct information', () => {
    render(<Header {...mockProps} />);

    expect(screen.getByTestId('username')).toHaveTextContent(
      mockOtherUser.username
    );
    expect(screen.getByTestId('back-button')).toBeTruthy();
    expect(screen.getByTestId('options-button')).toBeTruthy();
    expect(screen.queryByTestId('options-modal')).toBeNull();
    expect(screen.queryByTestId('block-button')).toBeNull();
  });
  it('renders options modal correctly when user clicks options button', () => {
    render(<Header {...mockProps} />);

    const optionsButton = screen.getByTestId('options-button');
    fireEvent.press(optionsButton);

    expect(screen.getByTestId('options-modal')).toBeTruthy();
    expect(screen.getByTestId('block-button')).toBeTruthy();
  });
  it('calls supabase endpoint to block currently viewed user and navigates to home screen', async () => {
    render(<Header {...mockProps} />);

    await act(async () => {
      fireEvent.press(screen.getByTestId('options-button'));
    });

    await act(async () => {
      fireEvent.press(screen.getByTestId('block-button'));
    });

    expect(mockBlockUser).toHaveBeenCalledWith(
      mockCurrentlyLoggedInUser.id,
      mockOtherUser.id
    );
    expect(mockBlockUser).toHaveBeenCalledTimes(1);

    expect(mockNavigate).toHaveBeenCalledWith('/(tabs)');
    expect(mockNavigate).toHaveBeenCalledTimes(1);

    expect(screen.queryByTestId('options-modal')).toBeNull();
  });
});
