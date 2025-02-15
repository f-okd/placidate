import { TProfile, TCommentsAndAuthors } from '@/utils/types';
import { fireEvent, render, screen } from '../__utils__/customRenderer';
import Comment from '@/components/Comment';

const mockUser: TProfile = {
  avatar_url: null,
  bio: null,
  id: 'test-id',
  is_private: null,
  updated_at: null,
  username: 'commentTest-user',
};

const mockDelete = jest.fn();

const mockComment: TCommentsAndAuthors = {
  body: 'test comment',
  created_at: '2024-02-15T14:30:45.123Z',
  id: 'test-comment-id',
  post_id: 'test-post-id',
  user_id: 'test-user-id',
  profiles: mockUser,
  deletable: true,
};

describe('comment', () => {
  const mockProps = {
    comment: mockComment,
    onDelete: mockDelete,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<Comment {...mockProps} />);

    expect(screen.getByTestId('clickable-username')).toHaveTextContent(
      'commentTest-user:'
    );
    expect(screen.getByTestId('delete-button')).toBeTruthy();
  });
  it('does not show delete button if that comment should not be delatable current user', () => {
    const mockProps2 = {
      ...mockProps,
      comment: { ...mockProps.comment, deletable: false },
    };
    console.log(mockProps2);
    render(<Comment {...mockProps2} />);

    expect(screen.queryByTestId('delete-button')).toBeNull();
  });
  it('should call delete handler function with comment id as argument, when delete button clicked', () => {
    render(<Comment {...mockProps} />);

    const deleteButton = screen.getByTestId('delete-button');
    fireEvent.press(deleteButton);
    expect(mockDelete).toHaveBeenCalledWith('test-comment-id');
  });
});
