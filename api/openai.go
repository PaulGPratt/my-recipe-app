package api

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

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

var secrets struct {
	OpenApiKey string
}

const analyzeRecipePrompt = `Analyze the attached recipe images. Respond with the provided schema using the following guidelines:

Preserve as much of the original text of the recipe as possible except where it violates these formatting guidelines.

Use **bold** for emphasis where indicated by the recipe image.

Ingredients: Formatted in Markdown as one or more unordered lists (some recipes have multiple ingredient lists)
Each ingredient should:
Begin with an asterisk followed by a space '* '
End with a newline (press 'Enter' after each ingredient)

Instructions: Formatted in Markdown as one or more ordered lists (some recipes have multiple instruction lists)
Each instruction should:
Begin with an incrementing number followed by a period and a space (e.g., '1. ')
End with a newline (press 'Enter' after each instruction)

Tags: Assign a single tag from the following list, if relevant: [Bread, Breakfast, Dessert, Dinner, Dressing, Mix, Snack]. If none apply, leave the tag field empty.`

func AnalyzeImageToRecipe(ctx context.Context, files []FileUpload) (*Recipe, error) {

	var messagesContent []Content

	promptContent := Content{
		Type: "text",
		Text: analyzeRecipePrompt,
	}
	messagesContent = append(messagesContent, promptContent)

	for _, file := range files {
		imageContent := Content{
			Type: "image_url",
			ImageURL: &ImageURL{
				URL: fmt.Sprintf("data:%s;base64,%s", file.MimeType, file.Content),
			},
		}
		messagesContent = append(messagesContent, imageContent)
	}

	// Construct the request body
	reqBody := OpenAIRequest{
		Model: "gpt-4o-mini",
		Messages: []Message{
			{
				Role:    "user",
				Content: messagesContent,
			},
		},
		MaxTokens: 2000,
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

	recipe, err := parseRecipeResponse(openAIResp)
	if err != nil {
		return nil, fmt.Errorf("error parsing recipe: %v", err)
	}

	return &recipe, nil
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

	return recipe, err
}
