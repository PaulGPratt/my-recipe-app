import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AddRecipeClient from "../../components/add-recipe.client";
import { getDecodedTokenCookie } from "../../lib/firebase-admin";

export const metadata: Metadata = {
  title: "Add Recipe",
};

export default async function AddRecipePage() {
  const cookieStore = await cookies();
  const firebaseToken = cookieStore.get("firebaseToken");
  const loginRedirect = `/login?redirect=${encodeURIComponent("/add-recipe")}`;

  if (!firebaseToken) {
    redirect(loginRedirect);
  }

  try {
    const idToken = await getDecodedTokenCookie();
    if (!idToken) {
      redirect(loginRedirect);
    }

    // Render the client-side component
    return <AddRecipeClient />;
  } catch (error) {
    console.error("Error validating token:", error);
    redirect(loginRedirect);
  }
}
