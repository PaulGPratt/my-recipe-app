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

export interface TagRecipe {
  tag: string,
  recipes: api.RecipeCard[],
}

function Recipes() {
  // Get the request client to make requests to the Encore backend
  const client = getRequestClient();

  const [recipeList, setRecipeList] = useState<api.RecipeCard[]>([]);
  const [filteredRecipeList, setFilteredRecipeList] = useState<api.RecipeCard[]>([]);
  const [tagList, setTagList] = useState<string[]>([]);
  const [tagRecipes, setTagRecipes] = useState<TagRecipe[]>([]);

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
        }, ["All", "Uncategorized"]);

        const orderedTags = Array.from(new Set(tags)).sort((a, b) => {
          if (a === "All") return -1;
          if (b === "All") return 1;
          if (a === "Uncategorized") return 1;
          if (b === "Uncategorized") return -1;
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

  const calculateTagRecipes = () => {
    const localTagList = tagList.filter(x => activeTag === "All" || (x.toLowerCase() === activeTag.toLowerCase() && x !== "Uncategorized"))
    const tagRecipes = localTagList
      .filter(tag => tag != "All")
      .map((tag) => {
        var recipes = recipeList.filter(recipe => recipe.tags?.some(x => x.toLowerCase() === tag.toLowerCase()))
        return {
          tag: tag,
          recipes: recipes
        } as TagRecipe
      });

    if (activeTag === "All" || activeTag === "Uncategorized") {
      const untagged = {
        tag: "Uncategorized",
        recipes: recipeList.filter(recipe => !recipe.tags || recipe.tags.length === 0)
      } as TagRecipe;
      tagRecipes.push(untagged);
    }

    setTagRecipes(tagRecipes);
  }



  const handleTagClick = ((tag: string) => {
    setActiveTag(tag);
  });

  useEffect(() => {
    if (recipeList.length > 0) {
      setFilteredRecipes();
      calculateTagRecipes();
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
        {tagRecipes?.map((tagRecipe) => (
          <>
            <div className="px-4 mb-2 text-2xl font-semibold">
              {tagRecipe.tag}
            </div>
            <div className="px-4 mb-4 gap-2 flex flex-col">
              {tagRecipe.recipes?.map((recipe) => (
                <RecipeCardButton
                  key={recipe.id}
                  item={recipe}
                />
              ))}
            </div>
          </>
        ))}
      </ScrollArea>
    </div>
  );
}

export default Recipes;
