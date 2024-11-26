import RecipeListServer from "../../components/recipe-list.server";

function AllRecipes() {
    return (
      <RecipeListServer
        cacheKey="all_recipes_response"
        fetchRecipes={(client) => client.api.GetAllRecipes()}
      />
    );
  }

  export default AllRecipes;
