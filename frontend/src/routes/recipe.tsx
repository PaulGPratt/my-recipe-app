import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Client, { Environment, Local, api } from "../client";
import MarkdownEditor from "../components/markdown-editor";
import { MilkdownProvider } from "@milkdown/react";
import { ChevronLeft, Flame, Timer } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import { Button } from "../components/ui/button";
import { useToast } from "../hooks/use-toast";

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
    const navigate = useNavigate();
    const { toast } = useToast()

    // Get the 'id' from the route parameters
    const { id } = useParams();

    const [isLoading, setIsLoading] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);
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
            } catch (err) {
                console.error(err);
            }
            setIsLoading(false);
        };
        fetchRecipes();
    }, [id]);

    const handleBack = () => {
        navigate(`/my-recipe-app/recipes/`);
    };

    const editRecipe = async () => {
        setIsEditMode(true);
    }
    

    const saveRecipe = async () => {
        try {
            setIsEditMode(false);
            // Send POST request to the backend for saving the note
            const response = await client.api.SaveRecipe({
                id: id || uuidv4(),
                title: recipe?.title ?? '',
                instructions: instructions,
                ingredients: ingredients,
                cook_temp_deg_f: recipe?.cook_temp_deg_f ?? 0,
                cook_time_minutes: recipe?.cook_time_minutes ?? 0,
            });
            toast({
                description: "Your recipe has been saved.",
              })
            if(!id) {
                navigate(`/my-recipe-app/recipes/${response.id}`);
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <> {isLoading ? (
            <span>Loading...</span>
        ) : (
            <div className="h-full mx-auto max-w-4xl">
                <div className="flex p-3 justify-between">
                    <Button variant="secondary" onClick={handleBack}><ChevronLeft /> Back to Recipes</Button>
                    {isEditMode ? (
                        <Button variant="secondary" onClick={saveRecipe}>Save</Button>
                    ) : (
                        <Button variant="secondary" onClick={editRecipe}>Edit</Button>
                    )}
                </div>

                <div className="flex flex-col flex-grow items-start gap-2 p-3 transition-all">
                    <div className="flex w-full flex-col gap-1">
                        <div className="flex items-center gap-2 text-2xl">
                            <div className="font-semibold">{recipe?.title}</div>

                            <div className="flex items-center gap-x-2 ml-auto flex-wrap justify-end">
                                <div className="flex">
                                    <Timer size={32} /> {recipe?.cook_time_minutes}min
                                </div>
                                <div className="flex">
                                    <Flame size={32} /> {recipe?.cook_temp_deg_f}°F
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="text-xl font-semibold">Ingredients</div>
                    <div className="text-lg text-foreground">
                        <MilkdownProvider>
                            <MarkdownEditor content={ingredients} setContent={setIngredients} isEditable={isEditMode} />
                        </MilkdownProvider>
                    </div>
                    <div className="text-xl font-semibold">Instructions</div>
                    <div className="text-lg text-foreground">
                        <MilkdownProvider>
                            <MarkdownEditor content={instructions} setContent={setInstructions} isEditable={isEditMode} />
                        </MilkdownProvider>
                    </div>
                </div>

            </div>

        )}
        </>
    );
}

export default Recipe;
