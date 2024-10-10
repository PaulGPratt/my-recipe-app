CREATE TABLE recipe (
	id TEXT PRIMARY KEY,
    title TEXT,
    ingredients TEXT,
    instructions TEXT,
    cook_temp_deg_f SMALLINT CHECK (cook_temp_deg_f >= 0) NULL,
    cook_time_minutes SMALLINT CHECK (cook_time_minutes >= 0) NULL
);
