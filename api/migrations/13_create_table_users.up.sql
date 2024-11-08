-- Create users table with username defaulting to an empty string
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    firebase_uid VARCHAR(128) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    username VARCHAR(128) DEFAULT '' NOT NULL
);

-- Alter recipe table to add user_id with cascading delete
ALTER TABLE recipe
ADD COLUMN user_id INT REFERENCES users(id) ON DELETE CASCADE;

-- Insert seed users
INSERT INTO users (firebase_uid, email)
VALUES 
    ('KEWr8Dr9FOPK1Ka3KNt40WJ3uqn1', 'kopfnatalie@gmail.com'),
    ('KhkCP3CeGPT1HkGdtk0gr63H2hy2', 'paulaug804@gmail.com');

-- Assign all existing recipes without a user_id to kopfnatalie@gmail.com
UPDATE recipe
SET user_id = (SELECT id FROM users WHERE email = 'kopfnatalie@gmail.com')
WHERE user_id IS NULL;