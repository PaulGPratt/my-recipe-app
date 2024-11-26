import RecipeListServer from '../../../components/recipe-list.server';

export default async function UserRecipes({
  params,
}: {
  params: { username: string };
}) {
  
  return (
    <RecipeListServer
      cacheKey={`user_recipes_${params.username}`}
      fetchRecipes={(client) => client.api.GetRecipesByProfileId(params.username!)}
    />
  );
}