import EditRecipe from "../../../../../components/edit-recipe.server";

export default function EditRecipePage({ params }: { params: { username: string; slug: string } }) {
  return <EditRecipe params={params} />;
}
