import RecipeListBase from "../components/recipe-list-base";

function AllRecipes() {
    return (
      <RecipeListBase
        title="All recipes"
        cacheKey="all_recipes_response"
        fetchRecipes={(client) => client.api.GetAllRecipes()}
      />
    );
  }

  export default AllRecipes;
