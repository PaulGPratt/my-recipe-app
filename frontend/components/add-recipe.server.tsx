import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDecodedTokenCookie } from "../lib/firebase-admin";
import AddRecipeClient from "./add-recipe.client";

export default async function AddRecipeServer() {
  // Get the Firebase token from cookies
  const cookieStore = await cookies();
  const firebaseToken = cookieStore.get("firebaseToken");

  if (!firebaseToken) {
    // Redirect to login if no token is found
    redirect("/login");
  }

  try {
      const idToken = await getDecodedTokenCookie();
      if (!idToken) {
          redirect(`/recipes`);
      }

    return <AddRecipeClient />;
  } catch (error) {
    console.error("Error validating token token:", error);
    redirect("/login");
  }
}
