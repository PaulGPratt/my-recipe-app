import RecipeListServer from '../../../components/recipe-list.server';

type Params = Promise<{ username: string }>

export default async function UserRecipesRecipePage(props: {
  params: Params
}) {
  const {username} = await props.params

  return (
    <RecipeListServer
      username={username}
      fetchRecipes={(client) => client.api.GetRecipesByProfileId(username)}
    />
  );
}