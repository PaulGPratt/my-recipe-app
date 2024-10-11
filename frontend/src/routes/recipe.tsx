import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Client, { Environment, Local, api } from "../client";
import MarkdownEditor from "../components/markdown-editor";
import { MilkdownProvider } from "@milkdown/react";
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
function Recipe() {
    const client = getRequestClient();

    // Get the 'id' from the route parameters
    const { id } = useParams();

    const [isLoading, setIsLoading] = useState(true);
    const [recipe, setRecipe] = useState<api.Recipe>();
    const [ingredients, setIngredients] = useState<string>("");
    const [instructions, setInstructions] = useState<string>("");

    useEffect(() => {
        const fetchRecipes = async () => {
            if (!id) return;
            try {
                // Fetch the note from the backend
                const recipeResponse = await client.api.GetRecipe(id);
                setRecipe(recipeResponse)
                setIngredients(recipeResponse.ingredients)
                setInstructions(recipeResponse.instructions)
                console.log(recipeResponse)
            } catch (err) {
                console.error(err);
            }
            setIsLoading(false);
        };
        fetchRecipes();
    }, [id]);

    return (
        <> {isLoading ? (
            <span>Loading...</span>
        ) : (
            <div className="flex flex-col flex-grow items-start gap-2 rounded-lg border p-3 transition-all">
                <div className="flex w-full flex-col gap-1">
                    <div className="flex items-center gap-2 text-2xl">
                        <div className="font-semibold">{recipe?.title}</div>

                        <div className="flex items-center gap-x-2 ml-auto flex-wrap justify-end">
                            {recipe?.cook_time_minutes.Valid && (
                                <div className="flex">
                                    <Timer size={32}/> {recipe?.cook_time_minutes.Int16}min
                                </div>
                            )}
                            {recipe?.cook_temp_deg_f.Valid && (
                                <div className="flex">
                                    <Flame size={32}/> {recipe?.cook_temp_deg_f.Int16}°F
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="text-xl font-semibold">Ingredients</div>
                <div className="text-lg text-foreground">
                    <MilkdownProvider>
                        <MarkdownEditor content={ingredients} setContent={setIngredients} />
                    </MilkdownProvider>
                </div>
                <div className="text-xl font-semibold">Instructions</div>
                <div className="text-lg text-foreground">
                    <MilkdownProvider>
                        <MarkdownEditor content={instructions} setContent={setInstructions} />
                    </MilkdownProvider>
                </div>
            </div>
        )}
        </>
    );
}

export default Recipe;
