class MockSupabaseUserPostInteractionEndpoint {
  addComment = jest.fn();
  deleteComment = jest.fn();
  postIsLikedByUser = jest.fn();
  likePost = jest.fn();
  unlikePost = jest.fn();
  getBookmarks = jest.fn();
  postIsBookmarkedByUser = jest.fn();
  bookmarkPost = jest.fn();
  unbookmarkPost = jest.fn();
}

export default MockSupabaseUserPostInteractionEndpoint;
