import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Search } from "lucide-react";
import { SetStateAction, useContext, useEffect, useRef, useState } from "react";
import ProfileMenu from "../components/profile-menu";
import RecipeCardButton from "../components/recipe-card-button";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Separator } from "../components/ui/separator";
import BreadCrumbs from "./breadcrumbs";
import Client, { api } from "../lib/client";
import { FirebaseContext } from "../lib/firebase";
import { redirect } from "next/navigation";
import { getLocalStorage, setLocalStorage } from "../lib/localStorage";
import getRequestClient from "../lib/get-request-client";

export interface TagRecipe {
  tag: string,
  recipes: api.RecipeCard[],
}

interface RecipeListBaseProps {
  fetchRecipes: (client: Client) => Promise<api.RecipeListResponse>;
  cacheKey: string;
  username?: string;
}

function RecipeListBase({ fetchRecipes, cacheKey, username }: RecipeListBaseProps) {
  const { auth } = useContext(FirebaseContext);
  const user = auth?.currentUser;

  const [recipeList, setRecipeList] = useState<api.RecipeCard[]>([]);
  const [tagList, setTagList] = useState<string[]>([]);
  const [tagRecipes, setTagRecipes] = useState<TagRecipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string>("All");
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [noRecipesFound, setNoRecipesFound] = useState<boolean>(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSearchChange = (event: { target: { value: SetStateAction<string>; }; }) => {
    setSearchQuery(event.target.value);
  };

  const goToAddRecipe = () => {
    redirect(`/add-recipe/`);
  };

  const goToAllRecipes = () => {
    redirect(`/recipes/`);
  };

  const toggleShowSearch = () => {
    setSearchQuery("");
    setShowSearch(!showSearch);
  }

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  useEffect(() => {
    const loadRecipes = async () => {
      const cachedRecipeList = getLocalStorage(cacheKey);
      if (cachedRecipeList) {
        setRecipeListState(JSON.parse(cachedRecipeList));
      }

      try {
        const token = await auth?.currentUser?.getIdToken();
        const client = getRequestClient(token ?? undefined);
        const freshRecipeList = await fetchRecipes(client);
        setRecipeListState(freshRecipeList);
        setLocalStorage(cacheKey, JSON.stringify(freshRecipeList));
      } catch (err) {
        console.error(err);
      }
    };
    loadRecipes();
  }, [cacheKey, fetchRecipes]);

  const setRecipeListState = (recipeResponse: api.RecipeListResponse) => {
    if (!recipeResponse.Recipes || recipeResponse.Recipes.length === 0) {
      setNoRecipesFound(true);
      return;
    }

    setNoRecipesFound(false);
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

    let tagRecipes = localTagList
      .filter(tag => tag != "All")
      .map((tag) => {
        var recipes = recipeList
          .filter(recipe => recipe.tags?.some(x => x.toLowerCase() === tag.toLowerCase()))
          .sort((a, b) => a.title.localeCompare(b.title));
        return {
          tag: tag,
          recipes: recipes
        } as TagRecipe;
      });

    if (searchQuery.length > 0) {
      tagRecipes = tagRecipes.map(x => ({
        tag: x.tag,
        recipes: x.recipes.filter(recipe =>
          recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(x => x.recipes.length > 0);
    }

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
    <div className="h-full mx-auto max-w-4xl flex flex-col">
      <div className="flex p-4 pb-0 justify-between">
        <div className="flex gap-4 items-center">
          <ProfileMenu></ProfileMenu>
          <BreadCrumbs params={{
            username: username
          }}></BreadCrumbs>
        </div>
        <div className="flex gap-2">
          {!noRecipesFound && (
            <Button size="icon" variant="ghost" onClick={toggleShowSearch} title="Search"><Search /></Button>
          )}
          {user?.uid && (
            <Button size="icon" variant="ghost" onClick={goToAddRecipe} title="Add Recipe"><Plus /></Button>
          )}

        </div>
      </div>
      {tagList && tagList.length > 0 && (
        <div className="flex flex-wrap gap-2 p-4">
          {tagList?.map((tag) => (
            <Button
              size="tag"
              key={tag}
              variant={activeTag === tag ? "default" : "secondary"}
              className={activeTag === tag ? "text-background" : ""}
              onClick={() => handleTagClick(tag)}
            >
              {tag}
            </Button>
          ))}
        </div>
      )}


      {showSearch && (
        <div className="flex px-4 pb-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-3 h-6 w-6 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder="Search recipes"
              className="pl-11 h-12 text-2xl"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      )}

      {noRecipesFound && (
        <div className="flex flex-col px-4 py-16">
          <div className="flex-grow text-2xl text-center">
            It looks like there aren't any recipes here yet.
          </div>
          <div className="flex flex-row py-8 gap-4 justify-center">
            <Button onClick={goToAllRecipes}>View All Recipes</Button>
          </div>
        </div>
      )}

      <ScrollArea className="h-full w-full">
        {tagRecipes?.map((tagRecipe) => (
          <div key={tagRecipe.tag}>
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
          </div>
        ))}
        <div className="pb-14"></div>
      </ScrollArea>
    </div>
  );
}

export default RecipeListBase;