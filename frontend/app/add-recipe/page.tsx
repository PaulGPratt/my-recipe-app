import { Metadata } from "next";
import AddRecipeServer from "../../components/add-recipe.server";

export const metadata: Metadata = {
  title: 'Add Recipe',
}

export default async function AddRecipePage() {
  return <AddRecipeServer />;
}
