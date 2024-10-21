import { SetStateAction, useEffect, useState } from "react";
import Client, { Environment, Local, api } from "../client";
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search } from "lucide-react";
import { Input } from "../components/ui/input";
import RecipeCardButton from "../components/recipe-card-button";
import TopNav from "../components/top-nav";
import { Button } from "../components/ui/button";

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

  const [recipeList, setRecipeList] = useState<api.RecipeCard[]>([]);
  const [filteredRecipeList, setFilteredRecipeList] = useState<api.RecipeCard[]>([]);
  const [tagList, setTagList] = useState<string[]>([]);

  // State for search query and filtered recipes
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string>("All");

  // Handler for search input change
  const handleSearchChange = (event: { target: { value: SetStateAction<string>; }; }) => {
    setSearchQuery(event.target.value);
  };

  const setFilteredRecipes = () => {

    const filteredRecipes = recipeList?.filter((recipe) =>
      (searchQuery.length === 0 || recipe.title.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (activeTag === "All" || recipe.tags?.some((tag) => tag.toLowerCase() === activeTag.toLowerCase()))
    ).sort((a, b) => {
      return a.title.localeCompare(b.title);
    }) ?? [];

    setFilteredRecipeList(filteredRecipes);
  }



  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const recipeResponse = await client.api.GetRecipes();
        setRecipeList(recipeResponse.Recipes);

        const tags = recipeResponse.Recipes.reduce((acc, recipe) => {
          return acc.concat(recipe.tags ?? []);
        }, ["All"]);

        const orderedTags = Array.from(new Set(tags)).sort((a, b) => {
          if (a === "All") return -1;
          if (b === "All") return 1;
          return a.localeCompare(b);
        });

        setTagList(orderedTags);
        setActiveTag("All");

      } catch (err) {
        console.error(err);
      }
    };
    fetchRecipes();
  }, []);

  const handleTagClick = ((tag: string) => {
    setActiveTag(tag);
  });

  useEffect(() => {
    if (recipeList.length > 0) {
      setFilteredRecipes();
    }
  }, [recipeList, searchQuery, activeTag]);


  return (
    <div className="h-full mx-auto max-w-4xl flex flex-col ">
      <TopNav className="hidden"></TopNav>
      <div className="flex px-4 pt-4 hidden">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-3 h-6 w-6 text-muted-foreground" />
          <Input placeholder="Search recipes" className="pl-11 h-12 text-2xl" value={searchQuery}
            onChange={handleSearchChange} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 px-4 py-4">
        {tagList?.map((tag) => (
          <Button
            size="tag"
            key={tag}
            variant={activeTag === tag ? "default" : "secondary"}
            className={activeTag === tag ? "text-background" : ""}
            onClick={() => handleTagClick(tag)}
          >{tag}</Button>
        ))}
      </div>

      <ScrollArea className="h-full w-full">
        <div className="px-4 mb-4 gap-2 flex flex-col">
          {filteredRecipeList?.map((item) => (
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
