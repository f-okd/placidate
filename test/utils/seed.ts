import { createClient } from '@supabase/supabase-js';
import { faker } from '@faker-js/faker';

const SUPABASE_URL = process.env.TESTING_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.TESTING_SUPABASE_SERVICE_KEY || '';
const seedingClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function seedData() {
  try {
    // Create users (profiles)
    const userIds: string[] = [];
    for (let i = 0; i < 10; i++) {
      const userId = generateUUID();
      const { error } = await seedingClient.from('profiles').insert({
        id: userId,
        username: `user${Math.floor(Math.random() * 1000)}`,
        bio: faker.lorem.paragraph({ min: 1, max: 3 }),
      });

      if (error) throw error;
      userIds.push(userId);
    }
    console.log('Users created:', userIds);

    // Create posts
    const postIds: string[] = [];
    for (let i = 0; i < 20; i++) {
      const postId = generateUUID();
      const { error } = await seedingClient.from('posts').insert({
        id: postId,
        author_id: userIds[Math.floor(Math.random() * userIds.length)],
        title: faker.lorem.sentence(4),
        body: faker.lorem.paragraphs(2),
        post_type: 'poem',
      });

      if (error) throw error;
      postIds.push(postId);
    }
    console.log('Posts created:', postIds);

    // Create comments
    for (let i = 0; i < 30; i++) {
      const { error } = await seedingClient.from('comments').insert({
        id: generateUUID(),
        post_id: postIds[Math.floor(Math.random() * postIds.length)],
        user_id: userIds[Math.floor(Math.random() * userIds.length)],
        body: faker.lorem.paragraph(),
      });

      if (error) throw error;
    }
    console.log('Comments created');

    // Create likes
    for (let i = 0; i < 40; i++) {
      const { error } = await seedingClient.from('likes').insert({
        post_id: postIds[Math.floor(Math.random() * postIds.length)],
        user_id: userIds[Math.floor(Math.random() * userIds.length)],
      });

      if (error && error.code !== '23505') throw error; // Ignore unique constraint violations
    }
    console.log('Likes created');

    // Create tags
    const tagIds: string[] = [];
    const tagNames = ['poetry', 'love', 'nature', 'life', 'art'];
    for (const tagName of tagNames) {
      const tagId = generateUUID();
      const { error } = await seedingClient.from('Tags').insert({
        id: tagId,
        name: tagName,
      });

      if (error && error.code !== '23505') throw error; // Ignore unique constraint violations
      tagIds.push(tagId);
    }
    console.log('Tags created');

    // Create post_tags
    for (let i = 0; i < 30; i++) {
      const { error } = await seedingClient.from('post_tags').insert({
        post_id: postIds[Math.floor(Math.random() * postIds.length)],
        tag_id: tagIds[Math.floor(Math.random() * tagIds.length)],
      });

      if (error && error.code !== '23505') throw error; // Ignore unique constraint violations
    }
    console.log('Post tags created');

    // Create follows
    for (let i = 0; i < 20; i++) {
      const followerId = userIds[Math.floor(Math.random() * userIds.length)];
      const followingId = userIds[Math.floor(Math.random() * userIds.length)];

      if (followerId === followingId) continue;

      const { error } = await seedingClient.from('follows').insert({
        follower_id: followerId,
        following_id: followingId,
        status: Math.random() > 0.2 ? 'accepted' : 'pending',
      });

      if (error && error.code !== '23505') throw error; // Ignore unique constraint violations
    }
    console.log('Follows created');

    // Create blocks
    for (let i = 0; i < 10; i++) {
      const blockerId = userIds[Math.floor(Math.random() * userIds.length)];
      const blockedId = userIds[Math.floor(Math.random() * userIds.length)];

      if (blockerId === blockedId) continue;

      const { error } = await seedingClient.from('blocks').insert({
        blocker_id: blockerId,
        blocked_id: blockedId,
      });

      if (error && error.code !== '23505') throw error; // Ignore unique constraint violations
    }
    console.log('Blocks created');

    // Create messages
    for (let i = 0; i < 50; i++) {
      const senderId = userIds[Math.floor(Math.random() * userIds.length)];
      const receiverId = userIds[Math.floor(Math.random() * userIds.length)];

      if (senderId === receiverId) continue;

      const { error } = await seedingClient.from('messages').insert({
        id: generateUUID(),
        sender_id: senderId,
        receiver_id: receiverId,
        body: faker.lorem.paragraph(),
      });

      if (error) throw error;
    }
    console.log('Messages created');

    // Create bookmarks
    for (let i = 0; i < 30; i++) {
      const { error } = await seedingClient.from('bookmarks').insert({
        user_id: userIds[Math.floor(Math.random() * userIds.length)],
        post_id: postIds[Math.floor(Math.random() * postIds.length)],
      });

      if (error && error.code !== '23505') throw error; // Ignore unique constraint violations
    }
    console.log('Bookmarks created');

    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

seedData();
