import UserSearchResult from '@/components/UserSearchResult';
import { fireEvent, render, screen } from '../__utils__/customRenderer';
import { Router } from 'expo-router';
import { mockAuthContext } from '../__mocks__/providers/AuthProvider';

jest.mock('@/providers/AuthProvider', () => ({
  useAuth: () => mockAuthContext,
}));

const mockNavigate = jest.fn();
const mockRouter = {
  push: mockNavigate,
} as unknown as Router;

const mockProps = {
  id: 'test-OtherUserId',
  username: 'test-OtherUsername',
  avatarUrl: null,
  router: mockRouter,
};

describe('UserSearchResult component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('successfully renders component with correct information', () => {
    render(<UserSearchResult {...mockProps} />);

    expect(screen.getByTestId('username')).toHaveTextContent(
      mockProps.username
    );
    expect(screen.getByTestId('search-result')).toBeTruthy();
    expect(screen.getByTestId('avatar')).toBeTruthy();
  });
  it('navigates to /users route when search result is pressed and its another users profile', () => {
    render(<UserSearchResult {...mockProps} />);

    const searchResult = screen.getByTestId('search-result');
    fireEvent.press(searchResult);
    expect(mockNavigate).toHaveBeenCalledWith(`/user?user_id=${mockProps.id}`);
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });
  it("navigates to /profile route when search result is pressed and its the logged in user's own profile", () => {
    render(<UserSearchResult {...{ ...mockProps, id: 'test-user-id' }} />);

    const searchResult = screen.getByTestId('search-result');
    fireEvent.press(searchResult);
    expect(mockNavigate).toHaveBeenCalledWith('/(tabs)/profile');
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });
});
