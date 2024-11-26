import getRequestClient from "../lib/get-request-client";
import RecipeClient from "./recipe.client";


interface RecipeServerProps {
  params: { username: string; slug: string };
}

export default async function Recipe({ params }: RecipeServerProps) {
  if (!params.username || !params.slug) {
    throw new Error("Missing required parameters.");
  }

  const client = getRequestClient(undefined);
  const recipe = await client.api.GetRecipe(params.username, params.slug);

  return <RecipeClient recipe={recipe} username={params.username} />;
}
