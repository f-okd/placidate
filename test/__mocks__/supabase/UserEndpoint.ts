class MockSupabaseUserEndpoint {
  getUserFollowCounts = jest.fn();
  searchForUsers = jest.fn();
  changeUsername = jest.fn();
  updateBio = jest.fn();
  changePassword = jest.fn();
  deleteAccount = jest.fn();
  saveProfilePicture = jest.fn();
  removeProfilePicture = jest.fn();
  getFollowers = jest.fn();
  getFollowing = jest.fn();
  getProfile = jest.fn();
}

export default MockSupabaseUserEndpoint;
