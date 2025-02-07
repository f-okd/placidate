-- Insert test users
INSERT INTO profiles (id, username, avatar_url, bio) VALUES
    ('uuid-1', 'testuser1', 'https://example.com/avatar1.png', 'Test user 1 bio'),
    ('uuid-2', 'testuser2', 'https://example.com/avatar2.png', 'Test user 2 bio');

-- Insert test posts
INSERT INTO posts (id, author_id, title, body, post_type, description) VALUES
    ('post-1', 'uuid-1', 'Test Post 1', 'This is the body of test post 1.', 'poem', 'A poem about nature'),
    ('post-2', 'uuid-2', 'Test Post 2', 'This is the body of test post 2.', 'short story', 'A short story about adventure');

-- Insert test comments
INSERT INTO comments (id, post_id, user_id, body) VALUES
    ('comment-1', 'post-1', 'uuid-2', 'Great post!'),
    ('comment-2', 'post-2', 'uuid-1', 'Interesting story!');

-- Insert test follows
INSERT INTO follows (follower_id, following_id, status) VALUES
    ('uuid-1', 'uuid-2', 'accepted');