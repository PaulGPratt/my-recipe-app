import { SetStateAction, useEffect, useState } from "react";
import Client, { Environment, Local, api } from "../client";
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search } from "lucide-react";
import { Input } from "../components/ui/input";
import RecipeCardButton from "../components/recipe-card-button";
import TopNav from "../components/top-nav";

/**
 * Returns the Encore request client for either the local or staging environment.
 * If we are running the frontend locally (dev mode) we assume that our Encore backend is also running locally
 * and make requests to that, otherwise we use the staging client.
 */
const getRequestClient = () => {
  return import.meta.env.DEV
    ? new Client(Local)
    : new Client(Environment("staging"));
};

function Recipes() {
  // Get the request client to make requests to the Encore backend
  const client = getRequestClient();

  const [recipeList, setRecipeList] = useState<api.RecipeListResponse>();

  // State for search query and filtered recipes
  const [searchQuery, setSearchQuery] = useState('');

  // Handler for search input change
  const handleSearchChange = (event: { target: { value: SetStateAction<string>; }; }) => {
    setSearchQuery(event.target.value);
  };

  // Filter recipes based on search query
  const filteredRecipes = recipeList?.Recipes.filter((recipe) =>
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.tags?.some((tag) =>
      tag.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const recipeResponse = await client.api.GetRecipes();
        setRecipeList(recipeResponse)
      } catch (err) {
        console.error(err);
      }
    };
    fetchRecipes();
  }, []);


  return (
    <div className="h-full mx-auto max-w-4xl flex flex-col ">
      <TopNav></TopNav>
      <div className="flex px-4 pb-4 ">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-3 h-6 w-6 text-muted-foreground" />
          <Input placeholder="Search" className="pl-11 h-12 text-2xl" value={searchQuery}
            onChange={handleSearchChange} />
        </div>
        {/* <ModeToggle /> */}
      </div>
      <ScrollArea className="h-full w-full">
        <div className="px-4 mb-4 gap-2 flex flex-col">
          {filteredRecipes?.map((item) => (
            <RecipeCardButton
              key={item.id}
              item={item}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

export default Recipes;
