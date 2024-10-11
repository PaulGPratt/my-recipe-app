package api

import (
	"context"
	"database/sql"
	"fmt"

	"encore.dev/storage/sqldb"
)

// Define a database named 'recipe', using the database migrations
// in the "./migrations" folder. Encore automatically provisions,
// migrates, and connects to the database.
// Learn more: https://encore.dev/docs/primitives/databases
var db = sqldb.NewDatabase("recipe", sqldb.DatabaseConfig{
	Migrations: "./migrations",
})

type Recipe struct {
	Id              string        `json:"id"`
	Title           string        `json:"title"`
	Ingredients     string        `json:"ingredients"`
	Instructions    string        `json:"instructions"`
	CookTempDegF    sql.NullInt16 `json:"cook_temp_deg_f"`
	CookTimeMinutes sql.NullInt16 `json:"cook_time_minutes"`
}

type RecipeListResponse struct {
	Recipes []*Recipe
}

// type RecipeListItem struct {
// 	Id    string `json:"id"`
// 	Title string `json:"title"`
// }

//encore:api public method=GET path=/api/recipes/:id
func GetRecipe(ctx context.Context, id string) (*Recipe, error) {
	recipe := &Recipe{Id: id}

	err := db.QueryRow(ctx, `
		SELECT title, ingredients, instructions, cook_temp_deg_f, cook_time_minutes
		FROM recipe
		WHERE id = $1
	`, id).Scan(&recipe.Title, &recipe.Ingredients, &recipe.Instructions, &recipe.CookTempDegF, &recipe.CookTimeMinutes)

	if err != nil {
		return nil, err
	}

	return recipe, nil
}

//encore:api public method=GET path=/api/recipes
func GetRecipes(ctx context.Context) (*RecipeListResponse, error) {
	rows, err := db.Query(ctx, `
		SELECT id, title, ingredients, instructions, cook_temp_deg_f, cook_time_minutes
		FROM recipe
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var recipes []*Recipe
	for rows.Next() {
		recipe := &Recipe{}
		if err := rows.Scan(&recipe.Id, &recipe.Title, &recipe.Ingredients, &recipe.Instructions, &recipe.CookTempDegF, &recipe.CookTimeMinutes); err != nil {
			return nil, err
		}
		recipes = append(recipes, recipe)
	}

	// Check if there were any errors during iteration.
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("could not iterate over rows: %v", err)
	}

	return &RecipeListResponse{Recipes: recipes}, nil
}
