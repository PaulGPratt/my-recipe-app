import RecipeListServer from '../../../components/recipe-list.server';

export default async function UserRecipes({
  params,
}: {
  params: { username: string };
}) {
  const { username } = await params;

  return (
    <RecipeListServer
      username={username}
      fetchRecipes={(client) => client.api.GetRecipesByProfileId(username)}
    />
  );
}