import { AuthProvider } from '@/test/__mocks__/providers/AuthProvider';
import { render } from '@testing-library/react-native';

const customRender = (ui: React.ReactElement, options = {}) =>
  render(ui, { wrapper: AuthProvider, ...options });

export * from '@testing-library/react-native';
export { customRender as render };
