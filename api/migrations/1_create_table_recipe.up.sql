CREATE TABLE recipe (
	id TEXT PRIMARY KEY,
    title TEXT,
    ingredients TEXT,
    instructions TEXT,
    cook_temp_deg_f SMALLINT CHECK (cook_temp_deg_f >= 0) NULL,
    cook_time_minutes SMALLINT CHECK (cook_time_minutes >= 0) NULL
);

INSERT INTO recipe (
    id,
    title,
    ingredients,
    instructions,
    cook_temp_deg_f,
    cook_time_minutes
) VALUES (
    '799e7e97-f4eb-4671-a119-c97a4b6c558c',
    'Country Farmhouse White',
    '* 65g (1/3 cup) bubbly, active starter
* 300g (1 1/4 cups) warm water
* 12g (1 tbsp) sugar
* 15g (1 tbsp) oil, plus more for coating the pan
* 400g (3 1/3 cups) bread flour
* 100g (3/4 cup plus 1 tbsp) all-purpose flour
* 9g (1 1/2 tsp) fine sea salt
',
    '1. Mix starter, water, sugar, and oil. Add flours and salt to form a rough dough. Let rest for 30 minutes to 1 hour.
2. Cover with a damp towel and let rise for 8 to 10 hours at room temperature (70°F/21°C).
3. Deflate the dough, roll into a log, place in a lightly oiled 9x5-inch loaf pan, and let rest.
4. Cover and let rise until 1 inch above the rim of the pan, about 1-2 hours.
5. Preheat oven to 375°F (190°C). Bake for 40-45 minutes until golden brown. Cool before slicing.
',
    375,
    45
);
