import RecipeListServer from "../../components/recipe-list.server";

function AllRecipes() {
    return (
      <RecipeListServer
        fetchRecipes={(client) => client.api.GetAllRecipes()}
      />
    );
  }

  export default AllRecipes;
