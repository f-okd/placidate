// test/jest.setup.js
jest.mock('@expo/vector-icons/Ionicons', () => 'Ionicons');

// Mock the endpoints
jest.mock('@/lib/supabase/UserUserInteractionEndpoint', () => {
  const MockSupabaseUserUserInteractionEndpoint =
    require('../test/__mocks__/supabase/UserUserInteractionEndpoint').default;
  return jest
    .fn()
    .mockImplementation(() => new MockSupabaseUserUserInteractionEndpoint());
});

jest.mock('@/lib/supabase/UserPostInteractionEndpoint', () => {
  const MockSupabaseUserPostInteractionEndpoint =
    require('../test/__mocks__/supabase/UserPostInteractionEndpoint').default;
  return jest
    .fn()
    .mockImplementation(() => new MockSupabaseUserPostInteractionEndpoint());
});

jest.mock('@/lib/supabase/UserEndpoint', () => {
  const MockSupabaseUserEndpoint =
    require('../test/__mocks__/supabase/UserEndpoint').default;
  return jest.fn().mockImplementation(() => new MockSupabaseUserEndpoint());
});

jest.mock('@/lib/supabase/PostEndpoint', () => {
  const MockSupabasePostEndpoint =
    require('../test/__mocks__/supabase/PostEndpoint').default;
  return jest.fn().mockImplementation(() => new MockSupabasePostEndpoint());
});

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));
