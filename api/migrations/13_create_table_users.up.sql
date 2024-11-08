-- Create profile table with username defaulting to an empty string
CREATE TABLE profile (
    id VARCHAR(128) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    username VARCHAR(128) DEFAULT '' NOT NULL
);

-- Alter recipe table to add profile_id with cascading delete
ALTER TABLE recipe
ADD COLUMN profile_id VARCHAR(128) REFERENCES profile(id) ON DELETE CASCADE;

-- Insert seed profiles
INSERT INTO profile (id, email)
VALUES 
    ('KEWr8Dr9FOPK1Ka3KNt40WJ3uqn1', 'kopfnatalie@gmail.com'),
    ('KhkCP3CeGPT1HkGdtk0gr63H2hy2', 'paulaug804@gmail.com');

-- Assign all existing recipes without a profile_id to kopfnatalie@gmail.com
UPDATE recipe
SET profile_id = (SELECT id FROM profile WHERE email = 'kopfnatalie@gmail.com')
WHERE profile_id IS NULL;