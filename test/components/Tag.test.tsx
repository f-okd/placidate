import Tag from '@/components/Tag';
import { fireEvent, render, screen } from '../__utils__/customRenderer';

const mockProps = {
  tagName: 'test-tag',
};

describe('Tag', () => {
  it('successfully renders component with correct information', () => {
    render(<Tag {...mockProps} />);

    expect(screen.getByTestId('tag')).toHaveTextContent('test-tag');
  });
  it('calls delete function of parent when argument is provided', () => {
    const mockDelete = jest.fn();
    render(<Tag {...{ ...mockProps, onRemoveTag: mockDelete }} />);

    const tag = screen.getByTestId('tag');
    fireEvent.press(tag);
    expect(mockDelete).toHaveBeenCalledTimes(1);
  });
});
