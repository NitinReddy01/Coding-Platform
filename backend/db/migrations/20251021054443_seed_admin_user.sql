-- +goose Up
-- +goose StatementBegin

-- Insert admin user
INSERT INTO users (id, email, name, is_active, created_at)
VALUES (
    gen_random_uuid(),
    'nitin@gmail.com',
    'Admin User',
    true,
    now()
)
ON CONFLICT (email) DO NOTHING;

-- Insert authentication record for admin user
INSERT INTO authentication (id, user_id, provider, password_hash, last_login, created_at, updated_at)
SELECT
    gen_random_uuid(),
    u.id,
    'email',
    '$2a$10$DWWyXSzPuvddFCAbsoLI8OWeEBxl.Kjw8m4QUgFOpqsNhqYbtH8xO',
    now(),
    now(),
    now()
FROM users u
WHERE u.email = 'nitingogula@gmail.com'
ON CONFLICT DO NOTHING;

-- Assign admin role to admin user
INSERT INTO user_roles (id, user_id, role_id)
SELECT
    gen_random_uuid(),
    u.id,
    r.id
FROM users u
CROSS JOIN roles r
WHERE u.email = 'nitingogula@gmail.com'
AND r.name = 'admin'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

-- Remove admin role assignment
DELETE FROM user_roles
WHERE user_id IN (
    SELECT id FROM users WHERE email = 'nitingogula@gmail.com'
);

-- Remove authentication record
DELETE FROM authentication
WHERE user_id IN (
    SELECT id FROM users WHERE email = 'nitingogula@gmail.com'
);

-- Remove admin user
DELETE FROM users WHERE email = 'nitingogula@gmail.com';

-- +goose StatementEnd
