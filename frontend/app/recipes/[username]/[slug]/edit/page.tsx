import EditRecipeServer from "../../../../../components/edit-recipe.server";

type Params = Promise<{ username: string; slug: string }>

export default async function EditRecipePage(props: {
  params: Params
}) {
  const {username, slug} = await props.params
  return <EditRecipeServer username={username} slug={slug} />;
}
