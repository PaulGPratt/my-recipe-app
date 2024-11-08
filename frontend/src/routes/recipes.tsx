import { SetStateAction, useContext, useEffect, useState } from "react";
import Client, { Environment, Local, api } from "../client";
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Plus, User } from "lucide-react";
import { Input } from "../components/ui/input";
import RecipeCardButton from "../components/recipe-card-button";
import TopNav from "../components/top-nav";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { Link, useNavigate } from "react-router-dom";
import { setLocalStorage, getLocalStorage } from '../utils/localStorage';
import { FirebaseContext } from "../lib/firebase";
import { signOut } from "firebase/auth";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu";

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
  const [showSearch, setShowSearch] = useState<boolean>(false);

  // Handler for search input change
  const handleSearchChange = (event: { target: { value: SetStateAction<string>; }; }) => {
    setSearchQuery(event.target.value);
  };

  const handleAdd = () => {
    navigate(`/upload/`);
  };

  const toggleShowSearch = () => {
    setSearchQuery("");
    setShowSearch(!showSearch);
  }

  useEffect(() => {
    const fetchRecipes = async () => {

      const cachedRecipeList = getLocalStorage(`recipe_list_response`);
      if (cachedRecipeList) {
        setRecipeListState(JSON.parse(cachedRecipeList));
      }

      try {
        const freshRecipeList = await client.api.GetRecipes();
        setRecipeListState(freshRecipeList);
        setLocalStorage(`recipe_list_response`, JSON.stringify(freshRecipeList));
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

    let tagRecipes = localTagList
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

    if (searchQuery.length > 0) {
      tagRecipes = tagRecipes.map(x => {
        return {
          tag: x.tag,
          recipes: x.recipes.filter(recipe => recipe.title.toLowerCase().includes(searchQuery.toLowerCase()))
        } as TagRecipe
      }).filter(x => x.recipes.length > 0)
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

  const { auth } = useContext(FirebaseContext);
  const user = auth?.currentUser;

  const logoutUser = async () => {
    if (auth) {
      await signOut(auth);
      navigate("/");
    }
  }

  const openLogin = () => {
    navigate("/login");
  }

  const openSignUp = () => {
    navigate("/signup");
  }


  return (
    <div className="h-full mx-auto max-w-4xl flex flex-col ">
      <TopNav className="hidden"></TopNav>
      <div className="flex p-4 pb-0 justify-between">
        <div className="flex gap-4 items-center">

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="default" className="text-2xl font-bold"><User /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {user?.uid ? (
                <DropdownMenuItem onClick={logoutUser} className="text-2xl">
                  Logout
                </DropdownMenuItem>

              ) : (
                <>
                <DropdownMenuItem onClick={openLogin} className="text-2xl">
                  Login
                </DropdownMenuItem>
                <DropdownMenuItem onClick={openSignUp} className="text-2xl">
                  Sign Up
                </DropdownMenuItem>
                </>
              )}

            </DropdownMenuContent>
          </DropdownMenu>

          <div className="text-2xl font-semibold">Recipes</div>
        </div>
        <div className="flex gap-2">
          <Button size="icon" variant="ghost" onClick={toggleShowSearch}><Search /></Button>
          {user?.uid && (
            <Button size="icon" variant="ghost" onClick={handleAdd}><Plus /></Button>
          )}

        </div>
      </div>
      {showSearch && (
        <div className="flex px-4 pt-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-3 h-6 w-6 text-muted-foreground" />
            <Input placeholder="Search recipes" className="pl-11 h-12 text-2xl" value={searchQuery}
              onChange={handleSearchChange} />
          </div>
        </div>
      )}


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

export default Recipes;
