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
  bookmark_visibility: 'private',
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

const mockNavigate = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockNavigate,
  }),
}));

describe('comment', () => {
  const mockProps = {
    comment: mockComment,
    onDelete: mockDelete,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('successfully renders component with correct information', () => {
    render(<Comment {...mockProps} />);

    expect(screen.getByTestId('clickable-username')).toHaveTextContent(
      mockComment.profiles?.username + ':'
    );
    expect(screen.getByTestId('comment-body')).toHaveTextContent(
      mockComment.body
    );
    expect(screen.getByTestId('delete-button')).toBeTruthy();
  });
  it('does not show delete button if that comment should not be delatable current user', () => {
    const mockProps2 = {
      ...mockProps,
      comment: { ...mockProps.comment, deletable: false },
    };
    render(<Comment {...mockProps2} />);

    expect(screen.queryByTestId('delete-button')).toBeNull();
  });
  it('should call delete handler function with comment id as argument, when delete button clicked', () => {
    render(<Comment {...mockProps} />);

    const deleteButton = screen.getByTestId('delete-button');
    fireEvent.press(deleteButton);
    expect(mockDelete).toHaveBeenCalledWith(mockComment.id);
  });
  it('should navigate to comment authors profile when their username is clicked', () => {
    render(<Comment {...mockProps} />);

    const username = screen.getByTestId('clickable-username');
    fireEvent.press(username);
    expect(mockNavigate).toHaveBeenCalledWith(
      `/user?user_id=${mockComment.user_id}`
    );
  });
});
