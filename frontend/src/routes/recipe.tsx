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
    const [tags, setTags] = useState<string[]>([]);
    const [ingredients, setIngredients] = useState<string>("");
    const [instructions, setInstructions] = useState<string>("");
    const [cookTime, setCookTime] = useState<number>(0);
    const [cookTemp, setCookTemp] = useState<number>(0);

    useEffect(() => {
        const fetchRecipes = async () => {
            if (!id) return;
            try {
                // Fetch the note from the backend
                const recipeResponse = await client.api.GetRecipe(id);
                setRecipe(recipeResponse);
                setTags(recipeResponse.tags ?? []);
                setIngredients(recipeResponse.ingredients);
                setInstructions(recipeResponse.instructions);
                setCookTemp(recipeResponse.cook_temp_deg_f);
                setCookTime(recipeResponse.cook_time_minutes);
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
            const filteredTags = tags.filter((tag) => tag != undefined && tag != null && tag != "");
            setTags(filteredTags);
            // Send POST request to the backend for saving the note
            const response = await client.api.SaveRecipe({
                id: id || uuidv4(),
                title: recipe?.title ?? '',
                instructions: instructions,
                ingredients: ingredients,
                cook_temp_deg_f: cookTemp,
                cook_time_minutes: cookTime,
                tags: filteredTags,
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

    const addTag = async () => {
        setTags([...tags, "Tag"]);
    }

    const handleTagChange = (index: number, event: { target: { value: any; }; }) => {
        tags[index] = event.target.value;
        setTags([...tags]);
    };

    const handleCookTimeChange = (event: { target: { value: any; }; }) => {
        setCookTime(Number(event.target.value))
    }

    const handleCookTempChange = (event: { target: { value: any; }; }) => {
        setCookTemp(Number(event.target.value))
    }

    return (
        <div className="h-full mx-auto max-w-4xl">
            <div className="flex p-4 gap-4 justify-between">
                <Button className="pl-2" onClick={handleBack}><ChevronLeft size={30} /> Back to Recipes</Button>
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
                                {/* {(tags?.length > 0 && !isEditMode) && (
                                    <div className="flex pt-2 text-xl gap-2">
                                        {tags?.map((tag, index) => (
                                            <div key={tag + index} className="rounded-full border border-primary px-3 py-0.5 text-lg font-normal" >{tag}</div>
                                        ))}
                                    </div>
                                )}

                                {isEditMode && (
                                    <div className="w-full flex-wrap flex pt-2 text-xl gap-2 justify-center">
                                        {tags?.map((tag, index) => (
                                            <input
                                                key={tag + index}
                                                value={tag}
                                                onChange={(event) => handleTagChange(index, event)}
                                                className="rounded-full border border-input px-3 py-0.5 text-lg bg-transparent font-normal">
                                            </input>
                                        ))}
                                        <Button size="icon" className="rounded-full" onClick={addTag}><Plus></Plus></Button>
                                    </div>
                                )} */}


                                {(!isEditMode && (cookTime > 0 || cookTemp > 0)) && (
                                    <div className="flex items-center pt-2 gap-x-2 text-3xl">
                                        {cookTime > 0 && (
                                            <div className="flex">
                                                <Timer size={36} /> {cookTime}min
                                            </div>
                                        )}
                                        {cookTemp > 0 && (
                                            <div className="flex">
                                                <Flame size={36} /> {cookTemp}°F
                                            </div>
                                        )}
                                    </div>
                                )}
                                {isEditMode && (
                                    <div className="flex items-center pt-2 gap-x-2 text-3xl">
                                        <div className="flex">
                                            <Timer size={36} />
                                            <input
                                                value={cookTime}
                                                onChange={handleCookTimeChange}
                                                className="border rounded-md mx-1 px-1 w-16 bg-transparent text-center">
                                            </input>min
                                        </div>
                                        <div className="flex">
                                            <Flame size={36} />
                                            <input
                                                value={cookTemp}
                                                onChange={handleCookTempChange}
                                                className="border rounded-md mx-1 px-1 w-16 bg-transparent text-center">
                                            </input>°F
                                        </div>
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
