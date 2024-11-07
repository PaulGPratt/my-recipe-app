package api

import (
	"context"
	"fmt"
	"regexp"
	"strings"

	"encore.dev/storage/sqldb"
	"encore.dev/types/uuid"
)

// Define a database named 'recipe', using the database migrations
// in the "./migrations" folder. Encore automatically provisions,
// migrates, and connects to the database.
// Learn more: https://encore.dev/docs/primitives/databases
var db = sqldb.NewDatabase("recipe", sqldb.DatabaseConfig{
	Migrations: "./migrations",
})

type Recipe struct {
	Id              string   `json:"id"`
	Slug            string   `json:"slug"`
	Title           string   `json:"title"`
	Ingredients     string   `json:"ingredients"`
	Instructions    string   `json:"instructions"`
	Notes           string   `json:"notes"`
	CookTempDegF    int16    `json:"cook_temp_deg_f"`
	CookTimeMinutes int16    `json:"cook_time_minutes"`
	Tags            []string `json:"tags"`
}

type RecipeCard struct {
	Id    string   `json:"id"`
	Slug  string   `json:"slug"`
	Title string   `json:"title"`
	Tags  []string `json:"tags"`
}

type RecipeListResponse struct {
	Recipes []*RecipeCard
}

type FileUpload struct {
	Filename string `json:"filename"`
	Content  string `json:"content"` // base64 encoded file content
	MimeType string `json:"mime_type"`
}

type FileUploadRequest struct {
	Files []FileUpload `json:"files"`
}

type GenerateFromTextRequest struct {
	Text string `json:"text"`
}

//encore:api public method=GET path=/api/recipes/:slug
func GetRecipe(ctx context.Context, slug string) (*Recipe, error) {
	recipe := &Recipe{Slug: slug}

	err := db.QueryRow(ctx, `
		SELECT id, title, ingredients, instructions, notes, cook_temp_deg_f, cook_time_minutes, tags
		FROM recipe
		WHERE slug = $1
	`, slug).Scan(&recipe.Id, &recipe.Title, &recipe.Ingredients, &recipe.Instructions, &recipe.Notes, &recipe.CookTempDegF, &recipe.CookTimeMinutes, &recipe.Tags)

	if err != nil {
		return nil, err
	}

	return recipe, nil
}

//encore:api public method=GET path=/api/recipes
func GetRecipes(ctx context.Context) (*RecipeListResponse, error) {
	rows, err := db.Query(ctx, `
		SELECT id, slug, title, tags
		FROM recipe
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var recipes []*RecipeCard
	for rows.Next() {
		recipe := &RecipeCard{}
		if err := rows.Scan(&recipe.Id, &recipe.Slug, &recipe.Title, &recipe.Tags); err != nil {
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

//encore:api public method=POST path=/recipes
func SaveRecipe(ctx context.Context, recipe *Recipe) (*Recipe, error) {
	// Save the recipe to the database.
	// If the recipe already exists (i.e. CONFLICT), we update the recipe info.
	_, err := db.Exec(ctx, `
		INSERT INTO recipe (id, slug, title, ingredients, instructions, notes, cook_temp_deg_f, cook_time_minutes, tags)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		ON CONFLICT (id) DO UPDATE SET slug=$2, title=$3, ingredients=$4, instructions=$5, notes=$6, cook_temp_deg_f=$7, cook_time_minutes=$8, tags=$9
	`, recipe.Id, recipe.Slug, recipe.Title, recipe.Ingredients, recipe.Instructions, recipe.Notes, recipe.CookTempDegF, recipe.CookTimeMinutes, recipe.Tags)

	// If there was an error saving to the database, then we return that error.
	if err != nil {
		return nil, err
	}

	// Otherwise, we return the recipe to indicate that the save was successful.
	return recipe, nil
}

//encore:api public method=DELETE path=/api/recipes/:id
func DeleteRecipe(ctx context.Context, id string) error {
	_, err := db.Exec(ctx, `DELETE FROM recipe WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("error deleting recipe: %w", err)
	}

	return nil
}

//encore:api public method=POST path=/recipes/generate-from-images
func GenerateFromImages(ctx context.Context, req FileUploadRequest) (*Recipe, error) {
	var recipe *Recipe

	recipe, err := AnalyzeImageToRecipe(ctx, req.Files)
	if err != nil {
		return nil, fmt.Errorf("error analyzing images: %w", err)
	}

	recipeId, err := uuid.NewV4()
	if err != nil {
		return nil, fmt.Errorf("error generating uuid: %w", err)
	}
	recipe.Id = recipeId.String()

	recipe.Slug, err = createUniqueSlug(ctx, recipe.Title)
	if err != nil {
		return nil, fmt.Errorf("error generating slug: %w", err)
	}

	// Save the recipe
	savedRecipe, err := SaveRecipe(ctx, recipe)
	if err != nil {
		return nil, fmt.Errorf("error saving recipe to database: %w", err)
	}

	return savedRecipe, nil
}

//encore:api public method=POST path=/recipes/generate-from-text
func GenerateFromText(ctx context.Context, req GenerateFromTextRequest) (*Recipe, error) {
	var recipe *Recipe

	recipe, err := AnalyzeTextToRecipe(ctx, req.Text)
	if err != nil {
		return nil, fmt.Errorf("error analyzing text: %w", err)
	}

	recipeId, err := uuid.NewV4()
	if err != nil {
		return nil, fmt.Errorf("error generating uuid: %w", err)
	}
	recipe.Id = recipeId.String()

	recipe.Slug, err = createUniqueSlug(ctx, recipe.Title)
	if err != nil {
		return nil, fmt.Errorf("error generating slug: %w", err)
	}

	// Save the recipe
	savedRecipe, err := SaveRecipe(ctx, recipe)
	if err != nil {
		return nil, fmt.Errorf("error saving recipe to database: %w", err)
	}

	return savedRecipe, nil
}

func createUniqueSlug(ctx context.Context, title string) (string, error) {
	// Step 1: Slugify the title
	reg := regexp.MustCompile(`[^a-z0-9]+`)
	slugCandidate := reg.ReplaceAllString(strings.ToLower(title), "-")

	// Step 2: Check if the plain slug already exists
	exists, err := checkSlugExists(ctx, slugCandidate)
	if err != nil {
		return "", err
	}
	if !exists {
		return slugCandidate, nil
	}

	// Step 3: Query for the highest suffix if the plain slug exists
	var maxSuffix int
	err = db.QueryRow(ctx, `
	WITH existing_slugs AS (
		SELECT slug 
		FROM recipe 
		WHERE slug = $1 OR slug LIKE $2
	)
	SELECT COALESCE(MAX(CAST(NULLIF(SUBSTRING(slug FROM LENGTH($1) + 2), '') AS INT)), 0) AS max_suffix
	FROM existing_slugs
`, slugCandidate, slugCandidate+"-%").Scan(&maxSuffix)

	if err != nil {
		return "", err
	}

	return fmt.Sprintf("%s-%d", slugCandidate, maxSuffix+1), nil
}

func checkSlugExists(ctx context.Context, slug string) (bool, error) {
	var exists bool
	err := db.QueryRow(ctx, `
		SELECT EXISTS (
			SELECT 1
			FROM recipe
			WHERE slug = $1
		)
	`, slug).Scan(&exists)

	if err != nil {
		return false, err
	}

	return exists, nil
}
