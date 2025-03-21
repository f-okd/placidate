import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.TESTING_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.TESTING_SUPABASE_SERVICE_KEY || '';
const resetClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function resetDatabase() {
  try {
    // List of tables to truncate
    const tablesToTruncate = [
      'bookmarks',
      'messages',
      'blocks',
      'follows',
      'post_tags',
      'tags',
      'likes',
      'comments',
      'posts',
    ];

    // Truncate tables in reverse order
    for (const tableName of tablesToTruncate.reverse()) {
      const { error } = await resetClient
        .from(tableName)
        .delete()
        .neq('created_at', '1900-01-01T00:00:00Z');
      if (error) {
        console.error(`Error truncating table ${tableName}:`, error);
        return;
      }
      console.log(`Truncated table ${tableName}`);
    }

    // Delete profiles excluding Alice and Bob
    const { error } = await resetClient
      .from('profiles')
      .delete()
      .not('username', 'in', '(Alice,Bob)');

    if (error) {
      console.error(`Error truncating table profiles:`, error);
      return;
    }
    console.log('Truncated table profiles (excluding Alice and Bob)');

    console.log('Database reset successful.');
  } catch (error) {
    console.error('Error resetting database:', error);
  }
}
