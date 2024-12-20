INSERT INTO recipe (id, title, ingredients, instructions, cook_temp_deg_f, cook_time_minutes, tags)
VALUES (
  gen_random_uuid(),
  'Skillet Flatbreads',
  '1. 3 cups (360g) all-purpose flour
* 2 teaspoons baking powder
* 1 1/2 teaspoons table salt
* 3 tablespoons (35g) olive oil or vegetable oil
* 1 cup (227g) ice water
* 2 to 3 tablespoons (25g to 35g) additional vegetable oil for frying',
  '1. Place the flour, baking powder, and salt in a large mixing bowl and stir to combine.
2. Add the oil and ice water, mixing to form a soft, cohesive dough. Adjust with flour or water as needed. The dough should be moist but not sticky. Cover with plastic wrap, and let rest for 10 minutes.
3. Preheat a heavy-bottomed skillet on the stovetop. Add 1 tablespoon oil and heat until shimmering.
4. Divide the dough into 10 to 12 equal pieces, each about the size of a large egg. Dredge each piece in flour and roll to a rough circle or oval about 1/4 inch thick, or flatten by hand.
5. In batches, fry the flatbreads in the hot oil for 2 to 3 minutes, or until golden brown. Flip and fry on the second side for another 2 minutes. Transfer to a rack to cool slightly before serving. Add more oil as needed for frying successive batches.',
  0,
  30,
  '{}'
);

INSERT INTO recipe (id, title, ingredients, instructions, cook_temp_deg_f, cook_time_minutes, tags)
VALUES (
  gen_random_uuid(),
  'Buttermilk-Marinated Roast Chicken',
  '1. 3 1/2 to 4-pound whole chicken
* Salt (2 tablespoons kosher salt or 4 teaspoons fine sea salt for marinade)
* 2 cups buttermilk',
  '1. The day before cooking, remove wingtips from the chicken and reserve for stock. Season the chicken generously with salt and let it sit for 30 minutes.
2. Stir salt into the buttermilk until it dissolves. Place the chicken in a resealable plastic bag and pour in the buttermilk. Seal the bag, squish the buttermilk around the chicken, place on a rimmed plate, and refrigerate overnight.
3. Remove the chicken from the fridge an hour before cooking. Preheat the oven to 425°F with a rack in the center position.
4. Remove chicken from the bag and scrape off excess buttermilk. Tie the legs together and place the chicken in a cast iron skillet or shallow roasting pan.
5. Position the chicken with the legs toward the rear left corner of the oven and breast toward the center. Roast for 20 minutes, then reduce heat to 400°F and continue roasting for 10 minutes.
6. Rotate the pan to have the legs face the back right corner. Continue roasting for another 30 minutes or until juices run clear when a knife is inserted into the thigh.
7. Let the chicken rest for 10 minutes before carving and serving.',
  425,
  60,
  '{}'
);
