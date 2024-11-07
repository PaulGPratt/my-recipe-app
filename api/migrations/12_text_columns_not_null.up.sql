-- Step 1: Update NULL values to empty strings (to avoid constraint violations)
UPDATE recipe
SET title = COALESCE(title, ''),
    ingredients = COALESCE(ingredients, ''),
    instructions = COALESCE(instructions, ''),
    slug = COALESCE(slug, ''),
    notes = COALESCE(notes, '');

-- Step 2: Alter columns to set default and make non-nullable
ALTER TABLE recipe
ALTER COLUMN title SET DEFAULT '',
ALTER COLUMN title SET NOT NULL,
ALTER COLUMN ingredients SET DEFAULT '',
ALTER COLUMN ingredients SET NOT NULL,
ALTER COLUMN instructions SET DEFAULT '',
ALTER COLUMN instructions SET NOT NULL,
ALTER COLUMN slug SET DEFAULT '',
ALTER COLUMN slug SET NOT NULL,
ALTER COLUMN notes SET DEFAULT '',
ALTER COLUMN notes SET NOT NULL;