package api

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"regexp"
	"strings"

	"encore.dev/beta/auth"
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
	ProfileId       string   `json:"profile_id"`
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
	Id       string   `json:"id"`
	Username string   `json:"username"`
	Slug     string   `json:"slug"`
	Title    string   `json:"title"`
	Tags     []string `json:"tags"`
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

type GenerateRecipeResponse struct {
	Username string `json:"username"`
	Slug     string `json:"slug"`
}

type IsSlugAvailableRequest struct {
	Slug string `json:"slug"`
}
type IsSlugAvailableResponse struct {
	Available bool `json:"available"`
}

type IsUsernameAvailableRequest struct {
	Username string `json:"username"`
}
type IsUsernameAvailableResponse struct {
	Available bool `json:"available"`
}

type Profile struct {
	Id       string `json:"id"`
	Username string `json:"username"`
}

//encore:api auth method=GET path=/api/profile
func GetMyProfile(ctx context.Context) (*Profile, error) {
	authResult, authBool := auth.UserID()
	if !authBool {
		err := fmt.Errorf("not authorized")
		return nil, err
	}

	pro := &Profile{Id: string(authResult)}

	err := db.QueryRow(ctx, `
	SELECT username
	FROM profile
	WHERE id = $1
	`, pro.Id).Scan(&pro.Username)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			pro.Username = ""
			return pro, nil
		}
		return nil, err
	}

	return pro, nil
}

//encore:api auth method=POST path=/api/profile
func SaveProfile(ctx context.Context, pro *Profile) (*Profile, error) {
	authResult, authBool := auth.UserID()
	if !authBool || string(authResult) != pro.Id {
		err := fmt.Errorf("not authorized")
		return nil, err
	}

	// Save the profile to the database.
	// If the profile already exists (i.e. CONFLICT), we update the profile info.
	_, err := db.Exec(ctx, `
		INSERT INTO profile (id, username)
		VALUES ($1, $2)
		ON CONFLICT (id) DO UPDATE SET username=$2
	`, pro.Id, pro.Username)

	// If there was an error saving to the database, then we return that error.
	if err != nil {
		return nil, err
	}

	return pro, nil
}

//encore:api public method=POST path=/api/username/available
func CheckIfUsernameIsAvailable(ctx context.Context, req IsUsernameAvailableRequest) (IsUsernameAvailableResponse, error) {
	exists, err := checkUsernameExists(ctx, req.Username)
	if err != nil {
		return IsUsernameAvailableResponse{}, err
	}

	return IsUsernameAvailableResponse{Available: !exists}, nil
}

func checkUsernameExists(ctx context.Context, username string) (bool, error) {
	var exists bool
	err := db.QueryRow(ctx, `
		SELECT EXISTS (
			SELECT 1
			FROM profile
			WHERE LOWER(username) = LOWER($1)
		)
	`, username).Scan(&exists)

	if err != nil {
		return false, err
	}

	return exists, nil
}

//encore:api public method=GET path=/api/recipes
func GetAllRecipes(ctx context.Context) (*RecipeListResponse, error) {
	rows, err := db.Query(ctx, `
		SELECT r.id, p.username, r.slug, r.title, r.tags
		FROM recipe r
		INNER JOIN profile p ON r.profile_id = p.id
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var recipeCards []*RecipeCard
	for rows.Next() {
		rc := &RecipeCard{}
		if err := rows.Scan(&rc.Id, &rc.Username, &rc.Slug, &rc.Title, &rc.Tags); err != nil {
			return nil, err
		}
		recipeCards = append(recipeCards, rc)
	}

	// Check if there were any errors during iteration.
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("could not iterate over rows: %v", err)
	}

	return &RecipeListResponse{Recipes: recipeCards}, nil
}

//encore:api public method=GET path=/api/recipes/:username
func GetRecipesByProfileId(ctx context.Context, username string) (*RecipeListResponse, error) {
	rows, err := db.Query(ctx, `
		SELECT r.id, p.username, r.slug, r.title, r.tags
		FROM recipe r
		INNER JOIN profile p ON r.profile_id = p.id
		WHERE LOWER(p.username) = LOWER($1)
	`, username)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var recipeCards []*RecipeCard
	for rows.Next() {
		rc := &RecipeCard{}
		if err := rows.Scan(&rc.Id, &rc.Username, &rc.Slug, &rc.Title, &rc.Tags); err != nil {
			return nil, err
		}
		recipeCards = append(recipeCards, rc)
	}

	// Check if there were any errors during iteration.
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("could not iterate over rows: %v", err)
	}

	return &RecipeListResponse{Recipes: recipeCards}, nil
}

//encore:api public method=GET path=/api/recipes/:username/:slug
func GetRecipe(ctx context.Context, username string, slug string) (*Recipe, error) {
	recipe := &Recipe{Slug: slug}

	// Use a JOIN to get the profile_id by username and retrieve recipe details in one query
	err := db.QueryRow(ctx, `
		SELECT r.id, r.profile_id, r.title, r.ingredients, r.instructions, r.notes, 
		       r.cook_temp_deg_f, r.cook_time_minutes, r.tags
		FROM recipe r
		INNER JOIN profile p ON r.profile_id = p.id
		WHERE LOWER(p.username) = LOWER($1) AND LOWER(r.slug) = LOWER($2)
	`, username, slug).Scan(
		&recipe.Id,
		&recipe.ProfileId,
		&recipe.Title,
		&recipe.Ingredients,
		&recipe.Instructions,
		&recipe.Notes,
		&recipe.CookTempDegF,
		&recipe.CookTimeMinutes,
		&recipe.Tags,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("recipe not found")
		}
		return nil, err
	}

	return recipe, nil
}

//encore:api auth method=POST path=/api/recipes
func SaveRecipe(ctx context.Context, recipe *Recipe) (*Recipe, error) {
	authResult, authBool := auth.UserID()
	if !authBool || string(authResult) != recipe.ProfileId {
		err := fmt.Errorf("not authorized")
		return nil, err
	}

	_, err := db.Exec(ctx, `
		INSERT INTO recipe (id, profile_id, slug, title, ingredients, instructions, notes, cook_temp_deg_f, cook_time_minutes, tags)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		ON CONFLICT (id) DO UPDATE SET profile_id=$2, slug=$3, title=$4, ingredients=$5, instructions=$6, notes=$7, cook_temp_deg_f=$8, cook_time_minutes=$9, tags=$10
	`, recipe.Id, recipe.ProfileId, recipe.Slug, recipe.Title, recipe.Ingredients, recipe.Instructions, recipe.Notes, recipe.CookTempDegF, recipe.CookTimeMinutes, recipe.Tags)

	// If there was an error saving to the database, then we return that error.
	if err != nil {
		return nil, err
	}

	// Otherwise, we return the recipe to indicate that the save was successful.
	return recipe, nil
}

//encore:api auth method=DELETE path=/api/recipes/:id
func DeleteRecipe(ctx context.Context, id string) error {
	authResult, authBool := auth.UserID()
	if !authBool {
		return fmt.Errorf("not authorized")
	}

	var recipeProfileId string
	err := db.QueryRow(ctx, `
		SELECT profile_id
		FROM recipe
		WHERE id = $1
	`, id).Scan(&recipeProfileId)

	if err != nil {
		if err == sql.ErrNoRows {
			return fmt.Errorf("recipe not found")
		}
		return fmt.Errorf("error retrieving recipe: %w", err)
	}

	if recipeProfileId != string(authResult) {
		return fmt.Errorf("not authorized to delete this recipe")
	}

	_, err = db.Exec(ctx, `DELETE FROM recipe WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("error deleting recipe: %w", err)
	}

	return nil
}

//encore:api auth method=POST path=/api/add-recipe/copy/:id
func CopyRecipe(ctx context.Context, id string) (*GenerateRecipeResponse, error) {
	authResult, authBool := auth.UserID()
	if !authBool {
		err := fmt.Errorf("not authorized")
		return nil, err
	}

	authProfileId := string(authResult)
	newRecipeId, err := uuid.NewV4()
	if err != nil {
		return nil, fmt.Errorf("error generating new recipe ID: %w", err)
	}

	var title string
	err = db.QueryRow(ctx, `SELECT title FROM recipe WHERE id = $1`, id).Scan(&title)
	if err != nil {
		return nil, fmt.Errorf("error finding existing recipe: %w", err)
	}

	var slug string
	slug, err = createUniqueSlug(ctx, title, string(authResult))
	if err != nil {
		return nil, fmt.Errorf("error generating slug: %w", err)
	}

	// Step 3: Perform the recipe duplication in a single query
	_, err = db.Exec(ctx, `
        INSERT INTO recipe (
            id, profile_id, slug, title, ingredients, instructions, notes, cook_temp_deg_f, cook_time_minutes, tags
        )
        SELECT 
            $1, -- New UUID
            $2, -- New profile_id
            $3, -- New slug 
            title, 
            ingredients, 
            instructions, 
            notes, 
            cook_temp_deg_f, 
            cook_time_minutes, 
            tags
        FROM recipe
        WHERE id = $4
    `, newRecipeId.String(), authProfileId, slug, id)
	if err != nil {
		return nil, fmt.Errorf("failed to copy recipe in database: %w", err)
	}

	response, err := getAddRecipeResponse(ctx, newRecipeId.String())
	if err != nil {
		return nil, fmt.Errorf("error generating recipe response: %w", err)
	}

	return response, nil
}

//encore:api auth method=POST path=/api/add-recipe/from-images
func GenerateFromImages(ctx context.Context, req FileUploadRequest) (*GenerateRecipeResponse, error) {
	authResult, authBool := auth.UserID()
	if !authBool {
		return nil, fmt.Errorf("not authorized")
	}

	recipe, err := AnalyzeImageToRecipe(ctx, req.Files)
	if err != nil {
		return nil, fmt.Errorf("error analyzing images: %w", err)
	}

	recipe.ProfileId = string(authResult)
	recipeId, err := uuid.NewV4()
	if err != nil {
		return nil, fmt.Errorf("error generating uuid: %w", err)
	}
	recipe.Id = recipeId.String()

	recipe.Slug, err = createUniqueSlug(ctx, recipe.Title, string(authResult))
	if err != nil {
		return nil, fmt.Errorf("error generating slug: %w", err)
	}

	savedRecipe, err := SaveRecipe(ctx, recipe)
	if err != nil {
		return nil, fmt.Errorf("error saving recipe to database: %w", err)
	}

	response, err := getAddRecipeResponse(ctx, savedRecipe.Id)
	if err != nil {
		return nil, fmt.Errorf("error generating recipe response: %w", err)
	}

	return response, nil
}

//encore:api auth method=POST path=/api/add-recipe/from-text
func GenerateFromText(ctx context.Context, req GenerateFromTextRequest) (*GenerateRecipeResponse, error) {
	authResult, authBool := auth.UserID()
	if !authBool {
		return nil, fmt.Errorf("not authorized")
	}

	recipe, err := AnalyzeTextToRecipe(ctx, req.Text)
	if err != nil {
		return nil, fmt.Errorf("error analyzing text: %w", err)
	}

	recipe.ProfileId = string(authResult)
	recipeId, err := uuid.NewV4()
	if err != nil {
		return nil, fmt.Errorf("error generating uuid: %w", err)
	}
	recipe.Id = recipeId.String()

	recipe.Slug, err = createUniqueSlug(ctx, recipe.Title, string(authResult))
	if err != nil {
		return nil, fmt.Errorf("error generating slug: %w", err)
	}

	// Save the recipe
	savedRecipe, err := SaveRecipe(ctx, recipe)
	if err != nil {
		return nil, fmt.Errorf("error saving recipe to database: %w", err)
	}

	response, err := getAddRecipeResponse(ctx, savedRecipe.Id)
	if err != nil {
		return nil, fmt.Errorf("error generating recipe response: %w", err)
	}

	return response, nil
}

func getAddRecipeResponse(ctx context.Context, recipeId string) (*GenerateRecipeResponse, error) {
	recipe := &GenerateRecipeResponse{}

	err := db.QueryRow(ctx, `
		SELECT p.username, r.slug
		FROM recipe r
		INNER JOIN profile p ON r.profile_id = p.id
		WHERE r.id = $1
	`, recipeId).Scan(
		&recipe.Username,
		&recipe.Slug,
	)

	if err != nil {
		return nil, fmt.Errorf("error getting added recipe: %w", err)
	}

	return recipe, nil
}

//encore:api auth method=POST path=/api/slug/available
func CheckIfSlugIsAvailable(ctx context.Context, req IsSlugAvailableRequest) (IsSlugAvailableResponse, error) {
	authResult, authBool := auth.UserID()
	if !authBool {
		err := fmt.Errorf("not authorized")
		return IsSlugAvailableResponse{}, err
	}

	exists, err := checkSlugExists(ctx, req.Slug, string(authResult))
	if err != nil {
		return IsSlugAvailableResponse{}, err
	}

	return IsSlugAvailableResponse{Available: !exists}, nil
}

func createUniqueSlug(ctx context.Context, title string, profileId string) (string, error) {
	// Step 1: Slugify the title
	reg := regexp.MustCompile(`[^a-z0-9]+`)
	slugCandidate := reg.ReplaceAllString(strings.ToLower(title), "-")

	// Step 2: Check if the plain slug already exists
	exists, err := checkSlugExists(ctx, slugCandidate, profileId)
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

func checkSlugExists(ctx context.Context, slug string, profileId string) (bool, error) {
	var exists bool
	err := db.QueryRow(ctx, `
		SELECT EXISTS (
			SELECT 1
			FROM recipe
			WHERE LOWER(slug) = LOWER($1) AND profile_id = $2
		)
	`, slug, profileId).Scan(&exists)

	if err != nil {
		return false, err
	}

	return exists, nil
}
