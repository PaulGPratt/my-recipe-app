import { useParams } from 'react-router-dom';
import RecipeListBase from '../components/recipe-list-base';

function UserRecipes() {
  const { username } = useParams();
  
  return (
    <RecipeListBase
      title={`${username}'s recipes`}
      cacheKey={`user_recipes_${username}`}
      fetchRecipes={(client) => client.api.GetRecipesByProfileId(username!)}
    />
  );
}

export default UserRecipes;