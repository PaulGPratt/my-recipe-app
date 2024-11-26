"use client";

import { useState } from "react";
import { Input } from "./ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import RecipeCardButton from "./recipe-card-button";
import { Separator } from "./ui/separator";
import { api } from "../lib/client";


interface RecipeListClientProps {
  recipeList: api.RecipeCard[];
  cacheKey: string;
}

export default function RecipeListClient({ recipeList, cacheKey }: RecipeListClientProps) {
  const [filteredRecipes, setFilteredRecipes] = useState<api.RecipeCard[]>(recipeList);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    setFilteredRecipes(
      recipeList.filter((recipe) =>
        recipe.title.toLowerCase().includes(query)
      )
    );
  };

  return (
    <div className="h-full mx-auto max-w-4xl flex flex-col">
      <div className="flex px-4 pb-4">
        <Input
          placeholder="Search recipes"
          value={searchQuery}
          onChange={handleSearchChange}
          className="h-10"
        />
      </div>
      <ScrollArea className="h-full w-full">
        {filteredRecipes.map((recipe) => (
          <div key={recipe.id}>
            <Separator />
            <RecipeCardButton item={recipe} />
          </div>
        ))}
      </ScrollArea>
    </div>
  );
}
