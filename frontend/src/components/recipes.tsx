import { SetStateAction, useEffect, useState } from "react";
import Client, { Environment, Local, api } from "../client";
import { ScrollArea } from "@/components/ui/scroll-area"
import { ThemeProvider } from "./theme-provider";
import { Flame, Search, Timer } from "lucide-react";
import { Input } from "./ui/input";
import RecipeCardButton from "./recipe-card-button";

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

  // const urlParams = new URLSearchParams(window.location.search);

  const [isLoading, setIsLoading] = useState(true);
  const [recipeList, setRecipeList] = useState<api.RecipeListResponse>();

  // State for search query and filtered recipes
  const [searchQuery, setSearchQuery] = useState('');

  // Handler for search input change
  const handleSearchChange = (event: { target: { value: SetStateAction<string>; }; }) => {
    setSearchQuery(event.target.value);
  };

  // Filter recipes based on search query
  const filteredRecipes = recipeList?.Recipes.filter((recipe) =>
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const fetchRecipes = async () => {
      // If we do not have an id then we are creating a new note, nothing needs to be fetched
      try {
        // Fetch the note from the backend
        const recipeResponse = await client.api.GetRecipes();
        setRecipeList(recipeResponse)

        console.log(recipeResponse)
      } catch (err) {
        console.error(err);
      }
      setIsLoading(false);
    };
    fetchRecipes();
  }, []);

  // const saveDocument = async () => {
  //   try {
  //     // Send POST request to the backend for saving the note
  //     const response = await client.note.SaveNote({
  //       text: content,
  //       cover_url: coverImage,
  //       // If we have an id then we are updating an existing note, otherwise we are creating a new one
  //       id: queryParamID || uuidv4(),
  //     });

  //     // Append the id to the url
  //     const url = new URL(window.location.href);
  //     url.searchParams.set("id", response.id);
  //     window.history.pushState(null, "", url.toString());

  //     // We now have saved note with an ID, we can now show the sharing modal
  //     setShowSharingModal(true);
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      {/* <ModeToggle/> */}
      <main className="h-full ">
        <div className="mx-auto h-full max-w-4xl pb-4 flex flex-col">
          <div className="px-4 py-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search" className="pl-8" value={searchQuery}
                onChange={handleSearchChange} />
            </div>
          </div>
          {isLoading ? (
            <span>Loading...</span>
          ) : (
            <ScrollArea className="h-full w-full">
              <div className="px-4 gap-2 flex flex-col">
                {filteredRecipes?.map((item) => (
                  <RecipeCardButton
                    key={item.id}
                    item={item}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </main>
    </ThemeProvider>
  );
}

export default Recipes;
