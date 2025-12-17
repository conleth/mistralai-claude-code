-- Seed script to create default admin user
-- Run this after initializing the database

-- Check if admin user already exists
SELECT id FROM users WHERE email = 'admin@example.com';

-- If not exists, create admin user
INSERT OR IGNORE INTO users (id, name, email, password_hash, role, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Admin User',
  'admin@example.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq1F.33X/fdP2PJmYJfQ1zI7hJVzNq',
  'security-lead',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Note: The password hash is for "password123"
-- You can generate your own hash using: bcrypt.hash('password123', 10)

-- Add a comment to the code noting that registration needs to be fixed
