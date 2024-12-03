-- Create profile table with username defaulting to an empty string
CREATE TABLE profile (
    id VARCHAR(128) PRIMARY KEY,
    username VARCHAR(128) DEFAULT '' NOT NULL UNIQUE
);

-- Alter recipe table to add profile_id with cascading delete
ALTER TABLE recipe
ADD COLUMN profile_id VARCHAR(128) REFERENCES profile(id) ON DELETE CASCADE;

-- Insert seed profiles
INSERT INTO profile (id, username)
VALUES ('KEWr8Dr9FOPK1Ka3KNt40WJ3uqn1', 'natalie')
ON CONFLICT (id) DO NOTHING;

-- Assign all existing recipes without a profile_id to kopfnatalie@gmail.com
UPDATE recipe
SET profile_id = 'KEWr8Dr9FOPK1Ka3KNt40WJ3uqn1'
WHERE profile_id IS NULL;

ALTER TABLE recipe
ALTER COLUMN profile_id SET NOT NULL;

-- Drop the existing index on slug
DROP INDEX IF EXISTS idx_recipe_slug;

CREATE UNIQUE INDEX idx_recipe_profile_id_slug ON recipe(profile_id, slug);