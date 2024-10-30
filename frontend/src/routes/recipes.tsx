import { SetStateAction, useEffect, useState } from "react";
import Client, { Environment, Local, api } from "../client";
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Plus } from "lucide-react";
import { Input } from "../components/ui/input";
import RecipeCardButton from "../components/recipe-card-button";
import TopNav from "../components/top-nav";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { useNavigate } from "react-router-dom";
import { getCookie, setCookie } from "../utils/cookieUtils";

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
  const navigate = useNavigate();

  const [recipeList, setRecipeList] = useState<api.RecipeCard[]>([]);
  const [tagList, setTagList] = useState<string[]>([]);
  const [tagRecipes, setTagRecipes] = useState<TagRecipe[]>([]);

  // State for search query and filtered recipes
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string>("All");

  // Handler for search input change
  const handleSearchChange = (event: { target: { value: SetStateAction<string>; }; }) => {
    setSearchQuery(event.target.value);
  };

  const handleUpload = () => {
    navigate(`/my-recipe-app/upload/`);
};

  useEffect(() => {
    const fetchRecipes = async () => {
      
      const cachedRecipeList = getCookie(`recipe_list_response`);
      if (cachedRecipeList) {
          setRecipeListState(JSON.parse(cachedRecipeList));
      }
      
      try {
        const freshRecipeList = await client.api.GetRecipes();
        setRecipeListState(freshRecipeList);
        setCookie(`recipe_list_response`, JSON.stringify(freshRecipeList), 1);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRecipes();
  }, []);

  const setRecipeListState = (recipeResponse: api.RecipeListResponse) => {
    const localRecipeList = recipeResponse.Recipes.map(x => ({
      ...x,
      tags: x.tags && x.tags.length ? x.tags : ["Uncategorized"]
    }));
    setRecipeList(localRecipeList);

    let tags = localRecipeList.reduce((acc, recipe) => {
      return acc.concat(recipe.tags ?? []);
    }, ["All"]);

    const orderedTags = Array.from(new Set(tags)).sort((a, b) => {
      if (a === "All") return -1;
      if (b === "All") return 1;
      if (a === "Uncategorized") return 1;
      if (b === "Uncategorized") return -1;
      return a.localeCompare(b);
    });

    setTagList(orderedTags);
    setActiveTag("All");
  }

  const calculateTagRecipes = () => {
    const localTagList = tagList.filter(x => activeTag === "All" || x.toLowerCase() === activeTag.toLowerCase())
    const tagRecipes = localTagList
      .filter(tag => tag != "All")
      .map((tag) => {
        var recipes = recipeList
          .filter(recipe => recipe.tags?.some(x => x.toLowerCase() === tag.toLowerCase()))
          .sort((a, b) => {
            return a.title.localeCompare(b.title);
          })
        return {
          tag: tag,
          recipes: recipes
        } as TagRecipe
      });

    setTagRecipes(tagRecipes);
  }


  const handleTagClick = ((tag: string) => {
    setActiveTag(tag);
  });

  useEffect(() => {
    if (recipeList.length > 0) {
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

      <div className="flex flex-wrap gap-2 p-4">
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
      <div className="absolute bottom-4 right-4">
        <Button variant="outline" onClick={handleUpload}><Plus className="mr-2"/> Recipe</Button>
      </div>
        {tagRecipes?.map((tagRecipe) => (
          <>
            <div className="px-4 mb-2 text-2xl flex gap-2 items-center">
              <div className="w-2"><Separator className="bg-muted-foreground" /></div>
              <span className="text-muted-foreground">{tagRecipe.tag}</span>
              <div className="flex-grow"><Separator className="bg-muted-foreground" /></div>
            </div>
            <div className="px-4 mb-6 gap-2 flex flex-col">
              {tagRecipe.recipes?.map((recipe) => (
                <RecipeCardButton
                  key={recipe.id}
                  item={recipe}
                />
              ))}
            </div>
          </>
        ))}
        <div className="pb-14"></div>
      </ScrollArea>
    </div>
  );
}

export default Recipes;
