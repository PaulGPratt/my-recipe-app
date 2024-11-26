import { redirect } from "next/navigation";
import getRequestClient from "../lib/get-request-client";
import { getDecodedTokenCookie as getIdToken } from "../lib/profile-utils";
import EditRecipeClient from "./edit-recipe.client";

interface EditRecipeProps {
  params: { username: string; slug: string };
}

export default async function EditRecipe({ params }: EditRecipeProps) {
  const { username, slug } = params;

  if (!username || !slug) {
    throw new Error("Missing required parameters.");
  }

  const client = getRequestClient(undefined);
  const recipe = await client.api.GetRecipe(username, slug);

  const idToken = await getIdToken();
  if(!idToken || !(idToken.uid === recipe.profile_id)) {
    redirect(`/recipes/${username}/${slug}`);
  }

  return (
    <EditRecipeClient
      recipe={recipe}
      username={username}
    />
  );
}
