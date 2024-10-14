UPDATE recipe
SET cook_temp_deg_f = 0
WHERE cook_temp_deg_f IS NULL;

UPDATE recipe
SET cook_time_minutes = 0
WHERE cook_time_minutes IS NULL;

ALTER TABLE recipe
ALTER COLUMN cook_temp_deg_f SET NOT NULL;

ALTER TABLE recipe
ALTER COLUMN cook_time_minutes SET NOT NULL;
