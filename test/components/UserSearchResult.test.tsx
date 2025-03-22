import UserSearchResult from '@/components/UserSearchResult';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '../__utils__/customRenderer';
import { Router } from 'expo-router';
import { mockAuthContext } from '../__mocks__/providers/AuthProvider';
import { getMockSupabaseUserUserInteractionEndpoint } from '../__mocks__/supabase/UserUserInteractionEndpoint';

jest.mock('@/providers/AuthProvider', () => ({
  useAuth: () => mockAuthContext,
}));

const mockNavigate = jest.fn();
const mockRouter = {
  push: mockNavigate,
} as unknown as Router;

const mockUserIsFollowing = jest.fn().mockResolvedValue(true);
const mockEndpoint = getMockSupabaseUserUserInteractionEndpoint();

jest.mock('@/lib/supabase/UserUserInteractionEndpoint', () => {
  return jest.fn().mockImplementation(() => ({
    ...mockEndpoint,
    userIsFollowing: mockUserIsFollowing,
  }));
});

const mockProps = {
  id: 'test-OtherUserId',
  username: 'test-OtherUsername',
  avatarUrl: 'https://via.placeholder.com/150/92c952',
  router: mockRouter,
};

describe('UserSearchResult component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('successfully renders component with correct information', async () => {
    render(<UserSearchResult {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByTestId('search-result')).toBeTruthy();
    });

    expect(screen.getByTestId('username')).toHaveTextContent(
      mockProps.username
    );
    expect(screen.getByTestId('follow-button')).toBeTruthy();
    expect(screen.getByTestId('avatar')).toBeTruthy();
  });

  it('successfully renders component with correct information (null avatar)', async () => {
    render(<UserSearchResult {...{ ...mockProps, avatarUrl: null }} />);

    await waitFor(() => {
      expect(screen.getByTestId('search-result')).toBeTruthy();
    });

    expect(screen.getByTestId('username')).toHaveTextContent(
      mockProps.username
    );
    expect(screen.getByTestId('follow-button')).toBeTruthy();
    expect(screen.getByTestId('avatar')).toBeTruthy();
  });

  it('navigates to /users route when search result is pressed and its another users profile', async () => {
    render(<UserSearchResult {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByTestId('search-result')).toBeTruthy();
    });

    const searchResult = screen.getByTestId('search-result');
    fireEvent.press(searchResult);
    expect(mockNavigate).toHaveBeenCalledWith(`/user?user_id=${mockProps.id}`);
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });

  it("navigates to /profile route when search result is pressed and its the logged in user's own profile", async () => {
    render(<UserSearchResult {...{ ...mockProps, id: 'test-user-id' }} />);

    await waitFor(() => {
      expect(screen.getByTestId('search-result')).toBeTruthy();
    });

    const searchResult = screen.getByTestId('search-result');
    fireEvent.press(searchResult);
    expect(mockNavigate).toHaveBeenCalledWith('/(tabs)/profile');
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });
});
