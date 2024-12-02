import Recipe from "../../../../components/recipe.server";

type Params = Promise<{ username: string; slug: string }>

export default async function RecipePage(props: {
  params: Params
}) {
  const {username, slug} = await props.params
  return <Recipe username={username} slug={slug} />;
}
