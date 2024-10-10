import { useEffect, useState } from "react";
import Client, { Environment, Local, api } from "../client";
import { ScrollArea } from "@/components/ui/scroll-area"
import { ThemeProvider } from "./theme-provider";
import { Badge } from "./ui/badge";
import { StarIcon } from "@radix-ui/react-icons";
import { Flame, Timer } from "lucide-react";

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

function App() {
  // Get the request client to make requests to the Encore backend
  const client = getRequestClient();

  const urlParams = new URLSearchParams(window.location.search);

  const [isLoading, setIsLoading] = useState(true);
  const [recipeList, setRecipeList] = useState<api.RecipeListResponse>();

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
      <div className="min-h-full">
        <main className="mt-8 h-full">
          <div className="mx-auto h-full max-w-4xl rounded-none pb-12 xl:rounded-sm">
            <div className="flex items-center py-2 px-4">
              <h1 className="text-4xl font-bold">Natalie's Recipes</h1>
            </div>
            {isLoading ? (
              <span>Loading...</span>
            ) : (
              <ScrollArea className="h-full w-full rounded-md border">
                <div className="p-4 flex">
                  {recipeList?.Recipes.map((item) => (
                    <button
                      key={item.id}
                      className={"flex flex-col flex-grow items-start gap-2 rounded-lg border p-3 text-left text-xl transition-all hover:bg-accent"}
                      onClick={() => { }}
                    >
                      <div className="flex w-full flex-col gap-1">
                        <div className="font-semibold">{item.title}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.cook_temp_deg_f.Valid ? (
                          <div className="flex">
                            <Flame /> {item.cook_temp_deg_f.Int16}°F
                          </div>
                        ) : null}
                        {item.cook_time_minutes.Valid ? (
                          <div className="flex">
                            <Timer /> {item.cook_time_minutes.Int16}min
                          </div>
                        ) : null}
                      </div>

                      {/* Todo: hide these until the recipe is selected */}
                      <div className="text-m text-muted-foreground">
                        {item.ingredients}
                      </div>
                      <div className="text-m text-muted-foreground">
                        {item.instructions}
                      </div>

                      
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
