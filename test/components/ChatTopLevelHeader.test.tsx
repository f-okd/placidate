import { render, screen, fireEvent } from '../__utils__/customRenderer';
import ChatTopLevelHeader from '@/components/ChatTopLevelHeader';

const mockNavigateBack = jest.fn();
const mockNavigateTo = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: mockNavigateBack,
    push: mockNavigateTo,
  }),
}));

describe('ChatTopLevelHeader', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with username and back button', () => {
    render(<ChatTopLevelHeader username='testuser' userId='user-123' />);

    expect(screen.getByText('testuser')).toBeTruthy();
    expect(screen.getByTestId('back-button')).toBeTruthy();
  });

  test('navigates back when back button is pressed', () => {
    render(<ChatTopLevelHeader username='testuser' userId='user-123' />);

    const backButton = screen.getByTestId('back-button');
    fireEvent.press(backButton);

    expect(mockNavigateBack).toHaveBeenCalledTimes(1);
  });

  test('navigates to user profile when username is pressed', () => {
    render(<ChatTopLevelHeader username='testuser' userId='user-123' />);

    const username = screen.getByTestId('username');
    fireEvent.press(username);

    expect(mockNavigateTo).toHaveBeenCalledWith('/user?user_id=user-123');
  });
});
