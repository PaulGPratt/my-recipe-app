import { redirect } from "next/navigation";
import getRequestClient from "../lib/get-request-client";
import { getDecodedTokenCookie } from "../lib/firebase-admin";
import EditRecipeClient from "./edit-recipe.client";

interface EditRecipeProps {
  params: { username: string; slug: string };
}

export default async function EditRecipeServer({ params }: EditRecipeProps) {
  const { username, slug } = await params;

  if (!username || !slug) {
    redirect("/");
  }

  const client = getRequestClient(undefined);

  try {
    const recipe = await client.api.GetRecipe(username, slug);

    const idToken = await getDecodedTokenCookie();
    if (!idToken || !(idToken.uid === recipe.profile_id)) {
      redirect(`/recipes/${username}/${slug}`);
    }

    return <EditRecipeClient recipe={recipe} username={username} />;
  } catch (error) {
    console.error("Error fetching recipe or validating token:", error);
    redirect(`/recipes/${username}/${slug}`);
  }
}
