package api

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"encore.dev/storage/sqldb"
)

// Define a database named 'recipe', using the database migrations
// in the "./migrations" folder. Encore automatically provisions,
// migrates, and connects to the database.
// Learn more: https://encore.dev/docs/primitives/databases
var db = sqldb.NewDatabase("recipe", sqldb.DatabaseConfig{
	Migrations: "./migrations",
})

var secrets struct {
	OpenApiKey string
}

type Recipe struct {
	Id              string   `json:"id"`
	Title           string   `json:"title"`
	Ingredients     string   `json:"ingredients"`
	Instructions    string   `json:"instructions"`
	CookTempDegF    int16    `json:"cook_temp_deg_f"`
	CookTimeMinutes int16    `json:"cook_time_minutes"`
	Tags            []string `json:"tags"`
}

type RecipeCard struct {
	Id    string   `json:"id"`
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

type OpenAIRequest struct {
	Model          string         `json:"model"`
	Messages       []Message      `json:"messages"`
	MaxTokens      int            `json:"max_tokens"`
	ResponseFormat ResponseFormat `json:"response_format"`
}

type ResponseFormat struct {
	Type       string     `json:"type"` // e.g., "json_schema"
	JSONSchema JSONSchema `json:"json_schema"`
}

type JSONSchema struct {
	Name   string `json:"name"` // e.g., "math_response"
	Schema Schema `json:"schema"`
	Strict bool   `json:"strict"`
}

type Schema struct {
	Type                 string              `json:"type"` // e.g., "object"
	Properties           map[string]Property `json:"properties"`
	Required             []string            `json:"required"`
	AdditionalProperties bool                `json:"additionalProperties"`
}

type Property struct {
	Type                 string              `json:"type"`            // e.g., "array", "object", "string"
	Items                *Property           `json:"items,omitempty"` // Pointer for nested structure
	Properties           map[string]Property `json:"properties,omitempty"`
	Required             []string            `json:"required,omitempty"`
	AdditionalProperties bool                `json:"additionalProperties,omitempty"`
}

type Message struct {
	Role    string    `json:"role"`
	Content []Content `json:"content"`
}

type Content struct {
	Type     string    `json:"type"`
	Text     string    `json:"text,omitempty"`
	ImageURL *ImageURL `json:"image_url,omitempty"`
}

type ImageURL struct {
	URL string `json:"url"`
}

type OpenAIResponse struct {
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
}

//encore:api public method=GET path=/api/recipes/:id
func GetRecipe(ctx context.Context, id string) (*Recipe, error) {
	recipe := &Recipe{Id: id}

	err := db.QueryRow(ctx, `
		SELECT title, ingredients, instructions, cook_temp_deg_f, cook_time_minutes, tags
		FROM recipe
		WHERE id = $1
	`, id).Scan(&recipe.Title, &recipe.Ingredients, &recipe.Instructions, &recipe.CookTempDegF, &recipe.CookTimeMinutes, &recipe.Tags)

	if err != nil {
		return nil, err
	}

	return recipe, nil
}

//encore:api public method=GET path=/api/recipes
func GetRecipes(ctx context.Context) (*RecipeListResponse, error) {
	rows, err := db.Query(ctx, `
		SELECT id, title, tags
		FROM recipe
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var recipes []*RecipeCard
	for rows.Next() {
		recipe := &RecipeCard{}
		if err := rows.Scan(&recipe.Id, &recipe.Title, &recipe.Tags); err != nil {
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
		INSERT INTO recipe (id, title, ingredients, instructions, cook_temp_deg_f, cook_time_minutes, tags)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		ON CONFLICT (id) DO UPDATE SET title=$2, ingredients=$3, instructions=$4, cook_temp_deg_f=$5, cook_time_minutes=$6, tags=$7
	`, recipe.Id, recipe.Title, recipe.Ingredients, recipe.Instructions, recipe.CookTempDegF, recipe.CookTimeMinutes, recipe.Tags)

	// If there was an error saving to the database, then we return that error.
	if err != nil {
		return nil, err
	}

	// Otherwise, we return the recipe to indicate that the save was successful.
	return recipe, nil
}

func analyzeImageToRecipe(ctx context.Context, file FileUpload) (*Recipe, error) {
	// Convert image to base64
	dataURL := fmt.Sprintf("data:%s;base64,%s", file.MimeType, file.Content)

	// Construct the request body
	reqBody := OpenAIRequest{
		Model: "gpt-4o-mini",
		Messages: []Message{
			{
				Role: "user",
				Content: []Content{
					{
						Type: "text",
						Text: "Please analyze this recipe image. Extract the details in the form of the provided schema.",
					},
					{
						Type: "image_url",
						ImageURL: &ImageURL{
							URL: dataURL,
						},
					},
				},
			},
		},
		MaxTokens: 1000,
		ResponseFormat: ResponseFormat{
			Type: "json_schema",
			JSONSchema: JSONSchema{
				Name: "recipe_response",
				Schema: Schema{
					Type: "object",
					Properties: map[string]Property{
						"id": {
							Type: "string",
						},
						"title": {
							Type: "string",
						},
						"ingredients": {
							Type: "string",
						},
						"instructions": {
							Type: "string",
						},
						"cook_temp_deg_f": {
							Type: "integer",
						},
						"cook_time_minutes": {
							Type: "integer",
						},
						"tags": {
							Type: "array",
							Items: &Property{
								Type: "string",
							},
						},
					},
					Required:             []string{"id", "title", "ingredients", "instructions", "cook_temp_deg_f", "cook_time_minutes", "tags"},
					AdditionalProperties: false,
				},
				Strict: true,
			},
		},
	}

	// Convert request to JSON
	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("error marshaling request: %w", err)
	}

	// Create HTTP request
	req, err := http.NewRequestWithContext(ctx, "POST", "https://api.openai.com/v1/chat/completions", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("error creating request: %w", err)
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", secrets.OpenApiKey))

	// Make the request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("error making request: %w", err)
	}
	defer resp.Body.Close()

	// Read response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("error reading response: %w", err)
	}

	// Check if status code is not 200
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API request failed with status %d: %s", resp.StatusCode, string(body))
	}

	// Parse response
	var openAIResp OpenAIResponse
	if err := json.Unmarshal(body, &openAIResp); err != nil {
		return nil, fmt.Errorf("error parsing response: %w", err)
	}

	if len(openAIResp.Choices) == 0 {
		return nil, fmt.Errorf("no response from OpenAI API")
	}

	fmt.Printf("%+v\n", openAIResp)

	// Parse the response into a Recipe struct
	recipe, err := parseRecipeResponse(openAIResp)

	return SaveRecipe(ctx, &recipe)
}

//encore:api public method=POST path=/recipes/upload
func UploadRecipe(ctx context.Context, ru FileUploadRequest) (*Recipe, error) {
	var recipe *Recipe

	for _, file := range ru.Files {

		// Analyze the image
		recipe, err := analyzeImageToRecipe(ctx, file)
		if err != nil {
			return nil, fmt.Errorf("error analyzing image: %w", err)
		}

		// Save the recipe
		savedRecipe, err := SaveRecipe(ctx, recipe)
		if err != nil {
			return nil, fmt.Errorf("error saving recipe to database: %w", err)
		}

		recipe = savedRecipe
	}

	return recipe, nil
}

func parseRecipeResponse(response OpenAIResponse) (Recipe, error) {
	// Assuming the recipe data is in the first choice
	content := response.Choices[0].Message.Content

	// Create an instance of Recipe to hold the parsed data
	var recipe Recipe

	// Parse JSON content into the Recipe struct
	err := json.Unmarshal([]byte(content), &recipe)
	if err != nil {
		return Recipe{}, fmt.Errorf("error parsing recipe: %v", err)
	}

	return recipe, nil
}
