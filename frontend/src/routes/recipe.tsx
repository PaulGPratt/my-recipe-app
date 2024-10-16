import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Client, { Environment, Local, api } from "../client";
import MarkdownEditor from "../components/markdown-editor";
import { MilkdownProvider } from "@milkdown/react";
import { ChevronLeft, Flame, Timer } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import { Button } from "../components/ui/button";
import { useToast } from "../hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Separator } from "../components/ui/separator";

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
    const [showCookTemp, setShowCookTemp] = useState<boolean>(false);
    const [showCookTime, setShowCookTime] = useState<boolean>(false);

    useEffect(() => {
        const fetchRecipes = async () => {
            if (!id) return;
            try {
                // Fetch the note from the backend
                const recipeResponse = await client.api.GetRecipe(id);
                setRecipe(recipeResponse);
                setIngredients(recipeResponse.ingredients);
                setInstructions(recipeResponse.instructions);
                setShowCookTemp(recipeResponse.cook_temp_deg_f > 0);
                setShowCookTime(recipeResponse.cook_time_minutes > 0);
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
            if (!id) {
                navigate(`/my-recipe-app/recipes/${response.id}`);
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="h-full mx-auto max-w-4xl">
            <div className="flex p-4 gap-4 justify-center">
                <Button className="pl-2" onClick={handleBack}><ChevronLeft size={30}/> Back to Recipes</Button>
                {isEditMode ? (
                    <Button onClick={saveRecipe}>Save</Button>
                ) : (
                    <Button onClick={editRecipe}>Edit</Button>
                )}
            </div>

            {isLoading ? (
                <span>Loading...</span>
            ) : (
                <Card className="rounded-none">
                    <CardHeader className="pt-4 pb-0 px-4">
                        <CardTitle>
                            <div className="flex flex-col flex-grow items-center justify-center">
                                <div className="text-4xl text-center">{recipe?.title}</div>

                                {(showCookTemp || showCookTime) && (
                                    <div className="flex items-center pt-2 gap-x-2 text-3xl">
                                        {showCookTime && (
                                            <div className="flex">
                                                <Timer size={36} /> {recipe?.cook_time_minutes}min
                                            </div>
                                        )}
                                        {showCookTemp && (
                                            <div className="flex">
                                                <Flame size={36} /> {recipe?.cook_temp_deg_f}°F
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <Separator className="my-4" />
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="px-4">

                        <div className="flex flex-col flex-grow items-start gap-2 transition-all">

                            <div className="text-3xl font-semibold">Ingredients</div>
                            <div className={"text-2xl text-foreground w-full"}>
                                <MilkdownProvider>
                                    <MarkdownEditor content={ingredients} setContent={setIngredients} isEditable={isEditMode} />
                                </MilkdownProvider>
                            </div>
                            <Separator className="my-2" />
                            <div className="text-3xl font-semibold">Instructions</div>
                            <div className={"text-2xl text-foreground w-full"}>
                                <MilkdownProvider>
                                    <MarkdownEditor content={instructions} setContent={setInstructions} isEditable={isEditMode} />
                                </MilkdownProvider>
                            </div>
                        </div>
                    </CardContent>
                </Card>

            )}

        </div>
    );
}

export default Recipe;
