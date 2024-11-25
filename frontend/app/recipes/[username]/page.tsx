import RecipeListBase from '../../../components/recipe-list-base';

export default async function UserRecipes({
  params,
}: {
  params: { username: string };
}) {
  
  return (
    <RecipeListBase
      cacheKey={`user_recipes_${params.username}`}
      fetchRecipes={(client) => client.api.GetRecipesByProfileId(params.username!)}
      username={params.username}
    />
  );
}