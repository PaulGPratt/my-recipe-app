import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import EditRecipeClient from "../../../../../components/edit-recipe.client";
import { getDecodedTokenCookie } from "../../../../../lib/firebase-admin";
import getRequestClient from "../../../../../lib/get-request-client";

export const metadata: Metadata = {
  title: 'Edit Recipe',
};

export default async function EditRecipePage({ params }: { params: { username: string; slug: string } }) {
  const { username, slug } = await params;

  if (!username || !slug) {
    redirect("/");
  }

  const cookieStore = await cookies();
  const firebaseToken = cookieStore.get("firebaseToken");

  if (!firebaseToken) {
    redirect("/login");
  }

  const client = getRequestClient(firebaseToken.value);

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
