import { Suspense } from "react";
import getRequestClient from "../lib/get-request-client";
import { api } from "../lib/client";
import RecipeListClient from "./recipe-list.client";

interface RecipeListServerProps {
  username?: string;
  fetchRecipes: (client: any) => Promise<api.RecipeListResponse>;
}

export default async function RecipeListServer({ username, fetchRecipes }: RecipeListServerProps) {
  const client = getRequestClient(undefined);
  const recipeListResponse = await fetchRecipes(client);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RecipeListClient
        recipeCards={recipeListResponse.Recipes}
        username={username}
      />
    </Suspense>
  );
}
