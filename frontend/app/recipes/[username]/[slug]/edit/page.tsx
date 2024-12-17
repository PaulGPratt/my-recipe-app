import { Metadata } from "next";
import { redirect } from "next/navigation";
import EditRecipeClient from "../../../../../components/edit-recipe.client";
import { getDecodedTokenCookie } from "../../../../../lib/firebase-admin";
import getRequestClient from "../../../../../lib/get-request-client";
import { cookies } from "next/headers";

type Params = Promise<{ username: string; slug: string }>

export const metadata: Metadata = {
  title: 'Edit Recipe',
};

export default async function EditRecipePage(props: { params: Params }) {
  const { username, slug } = await props.params;

  if (!username || !slug) {
    redirect("/home");
  }

  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("firebaseToken");
  
  // If there's a cookie, they're probably logged in, no guarantees the cookie hasn't expired though
  if (!tokenCookie) {
    return {
      redirect: {
        destination: `/login?redirect=${encodeURIComponent(`/recipes/${username}/${slug}/edit`)}`,
        permanent: false,
      },
    };
  }

  const client = getRequestClient(tokenCookie?.value);

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
