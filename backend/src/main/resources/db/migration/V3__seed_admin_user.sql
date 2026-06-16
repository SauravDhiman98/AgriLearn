-- Seed default admin user
-- Email   : admin@agrilearn.com
-- Password: Admin@AgriLearn2024
-- Role    : ADMIN
--
-- This user is created on first startup if it does not already exist.
-- Change the password immediately after first login in production!

INSERT INTO users (
    first_name,
    last_name,
    email,
    password,
    role,
    enabled,
    created_at,
    updated_at
)
SELECT
    'AgriLearn',
    'Admin',
    'admin@agrilearn.com',
    '$2b$10$.rLpy1u/RELFOf6Mbt7b5OMg4QYq7NxhaLnd2jslcpFYgbsTyYxY6',
    'ADMIN',
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'admin@agrilearn.com'
);
