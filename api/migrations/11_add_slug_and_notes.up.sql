ALTER TABLE recipe
ADD COLUMN slug TEXT,
ADD COLUMN note TEXT;

CREATE UNIQUE INDEX idx_recipe_slug ON recipe (slug);

UPDATE recipe
SET slug = regexp_replace(lower(title), '[^a-z0-9]+', '-', 'g');