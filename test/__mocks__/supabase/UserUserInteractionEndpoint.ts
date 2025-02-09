class MockSupabaseUserUserInteractionEndpoint {
  followUser = jest.fn();
  unfollowUser = jest.fn();
  userIsFollowing = jest.fn();
  blockUser = jest.fn();
  unblockUser = jest.fn();
  getBlockedUsers = jest.fn();
}

export default MockSupabaseUserUserInteractionEndpoint;
