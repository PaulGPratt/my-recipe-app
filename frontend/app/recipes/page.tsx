import { Metadata } from "next";
import RecipeListServer from "../../components/recipe-list.server";

export const metadata: Metadata = {
  title: 'All Recipes',
}

function AllRecipes() {
    return (
      <RecipeListServer
        fetchRecipes={(client) => client.api.GetAllRecipes()}
      />
    );
  }

  export default AllRecipes;
