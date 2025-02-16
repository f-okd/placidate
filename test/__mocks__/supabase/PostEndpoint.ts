class MockSupabasePostEndpoint {
  getCommentsAndAuthors = jest.fn();
  getFollowingPosts = jest.fn();
  getRecommendedPosts = jest.fn();
  searchForPosts = jest.fn();
  searchForPostsByTag = jest.fn();
  deletePost = jest.fn();
  createPost = jest.fn();
  getPostsCreatedByUser = jest.fn();
}

export default MockSupabasePostEndpoint;
