import EditRecipeServer, { EditRecipeProps } from "../../../../../components/edit-recipe.server";

export default async function EditRecipePage({ params }: EditRecipeProps) {
  return <EditRecipeServer params={params} />;
}
