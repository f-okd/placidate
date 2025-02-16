import Header from '@/components/TopLevelHeader';
import { fireEvent, render, screen } from '../__utils__/customRenderer';

const mockNavigateTo = jest.fn();
const mockNavigateBack = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockNavigateTo,
    back: mockNavigateBack,
  }),
}));

const mockProps = {
  title: 'test-header',
  showBackIcon: false,
  showNotificationIcon: false,
  isProfilePage: false,
};

describe('TopLevelHeader', () => {
  it('renders correctly', () => {
    render(<Header {...mockProps} />);
    expect(screen.getByTestId('title')).toHaveTextContent('test-header');
    expect(screen.queryByTestId('back-button')).toBeNull();
    expect(screen.queryByTestId('notifications-button')).toBeNull();
    expect(screen.queryByTestId('settings-button')).toBeNull();
  });
  it('shows back button when option enabled', () => {
    render(<Header {...{ ...mockProps, showBackIcon: true }} />);
    expect(screen.getByTestId('back-button')).toBeTruthy();
  });
  it('navigates to the previos page when back button clicked', () => {
    render(<Header {...{ ...mockProps, showBackIcon: true }} />);
    const backButton = screen.getByTestId('back-button');
    fireEvent.press(backButton);
    expect(mockNavigateBack).toHaveBeenCalledTimes(1);
  });
  it('shows notification button when option enabled', () => {
    render(<Header {...{ ...mockProps, showNotificationIcon: true }} />);
    expect(screen.getByTestId('notifications-button')).toBeTruthy();
  });
  it('shows settings button when viewing self profile (option enabled)', () => {
    render(<Header {...{ ...mockProps, isProfilePage: true }} />);
    expect(screen.getByTestId('settings-button')).toBeTruthy();
  });
  it('navigates to the settings page when settings button is clicked', () => {
    render(<Header {...{ ...mockProps, isProfilePage: true }} />);

    const settingsIcon = screen.getByTestId('settings-button');
    fireEvent.press(settingsIcon);
    expect(mockNavigateTo).toHaveBeenCalledWith('/settings');
    expect(mockNavigateTo).toHaveBeenCalledTimes(1);
  });
});
