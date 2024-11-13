// RecipeListBase.tsx
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Search } from "lucide-react";
import { SetStateAction, useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Client, { api } from "../client";
import ProfileMenu from "../components/profile-menu";
import RecipeCardButton from "../components/recipe-card-button";
import TopNav from "../components/top-nav";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Separator } from "../components/ui/separator";
import { FirebaseContext } from "../lib/firebase";
import getRequestClient from "../lib/get-request-client";
import { getLocalStorage, setLocalStorage } from '../utils/localStorage';

export interface TagRecipe {
  tag: string,
  recipes: api.RecipeCard[],
}

interface RecipeListBaseProps {
  title: string;
  fetchRecipes: (client: Client) => Promise<api.RecipeListResponse>;
  cacheKey: string;
}

function RecipeListBase({ title, fetchRecipes, cacheKey }: RecipeListBaseProps) {
  const { auth } = useContext(FirebaseContext);
  const user = auth?.currentUser;
  const navigate = useNavigate();

  const [recipeList, setRecipeList] = useState<api.RecipeCard[]>([]);
  const [tagList, setTagList] = useState<string[]>([]);
  const [tagRecipes, setTagRecipes] = useState<TagRecipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string>("All");
  const [showSearch, setShowSearch] = useState<boolean>(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

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
      <TopNav className="hidden"></TopNav>
      <div className="flex p-4 pb-0 justify-between">
        <div className="flex gap-4 items-center">
          <ProfileMenu></ProfileMenu>
          <div className="text-2xl font-semibold">{title}</div>
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