import EditRecipeServer from "../../../../../components/edit-recipe.server";

export default async function EditRecipePage({
  params,
}: {
  params: { username: string; slug: string };
}) {
  return <EditRecipeServer params={params} />;
}
