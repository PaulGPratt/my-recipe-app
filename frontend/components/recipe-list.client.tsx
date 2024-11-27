"use client";

import { SetStateAction, useContext, useEffect, useRef, useState } from "react";
import { Input } from "./ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import RecipeCardButton from "./recipe-card-button";
import { Separator } from "./ui/separator";
import { api } from "../lib/client";
import BreadCrumbs from "./breadcrumbs";
import { Button } from "./ui/button";
import router from "next/router";
import { FirebaseContext } from "../lib/firebase";
import { Plus, Search } from "lucide-react";
import ProfileMenu from "./profile-menu";

interface RecipeListClientProps {
  recipeCards: api.RecipeCard[];
  username?: string;
}

export interface TagRecipe {
  tag: string,
  recipes: api.RecipeCard[],
}

export default function RecipeListClient({ recipeCards, username }: RecipeListClientProps) {
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
    router.push(`/add-recipe/`);
  };

  const goToAllRecipes = () => {
    router.push(`/recipes/`);
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
    setRecipeListState(recipeCards);
  }, [recipeCards])


  const setRecipeListState = (recipeCards: api.RecipeCard[]) => {
    if (!recipeCards || recipeCards.length === 0) {
      setNoRecipesFound(true);
      return;
    }

    setNoRecipesFound(false);
    const localRecipeList = recipeCards.map(x => ({
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
