import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Client, { Environment, Local, api } from "../client";
import MarkdownEditor from "../components/markdown-editor";
import { MilkdownProvider } from "@milkdown/react";
import { ArrowLeft, EllipsisVertical, Flame, Pencil, Plus, Save, Timer, Trash, X } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { Input } from "../components/ui/input";
import { setLocalStorage, getLocalStorage } from '../utils/localStorage';
import { DropdownMenu } from "@radix-ui/react-dropdown-menu";
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu";

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

        const loadRecipes = async () => {
            if (!id) return;

            const cachedRecipe = getLocalStorage(`recipe_${id}`);
            if (cachedRecipe) {
                setRecipeState(JSON.parse(cachedRecipe));
                setIsLoading(false);
            }

            try {
                const freshRecipe = await client.api.GetRecipe(id);
                setRecipeState(freshRecipe);
                setLocalStorage(`recipe_${id}`, JSON.stringify(freshRecipe));
            } catch (err) {
                console.error(err);
            }
            setIsLoading(false);
        };

        loadRecipes();
    }, [id]);



    const setRecipeState = (recipeResponse: api.Recipe) => {
        setRecipe(recipeResponse);
        setTags(recipeResponse.tags ?? []);
        setIngredients(recipeResponse.ingredients);
        setInstructions(recipeResponse.instructions);
        setCookTemp(recipeResponse.cook_temp_deg_f);
        setCookTime(recipeResponse.cook_time_minutes);
    }

    const handleBack = () => {
        navigate(`/my-recipe-app/recipes/`);
    };

    const editRecipe = async () => {
        setIsEditMode(true);
    }

    const cancelEdit = async () => {
        setIsEditMode(false);
        if (recipe) {
            setTags(recipe.tags);
            setIngredients(recipe.ingredients);
            setInstructions(recipe.instructions);
            setCookTemp(recipe.cook_temp_deg_f);
            setCookTime(recipe.cook_time_minutes);
        }
    }

    const saveRecipe = async () => {
        try {
            setIsEditMode(false);
            const filteredTags = tags.filter((tag) => tag != undefined && tag != null && tag != "");
            setTags(filteredTags);

            const response = await client.api.SaveRecipe({
                id: id || uuidv4(),
                title: recipe?.title ?? '',
                instructions: instructions,
                ingredients: ingredients,
                cook_temp_deg_f: cookTemp,
                cook_time_minutes: cookTime,
                tags: filteredTags,
            });
            if (!id) {
                navigate(`/my-recipe-app/recipes/${response.id}`);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const deleteRecipe = async () => {
        if (!id) {
            return;
        }

        try {
            await client.api.DeleteRecipe(id)
            navigate(`/my-recipe-app/recipes/`);
        } catch (err) {
            console.error(err)
        }
    }

    const handleCookTimeChange = (event: { target: { value: any; }; }) => {
        setCookTime(Number(event.target.value))
    }

    const handleCookTempChange = (event: { target: { value: any; }; }) => {
        setCookTemp(Number(event.target.value))
    }

    const addTag = async () => {
        setTags([...tags, "Tag"]);
    }

    const handleTagChange = (index: number, event: { target: { value: any; }; }) => {
        tags[index] = event.target.value;
        if (tags[index] === undefined || tags[index] === null || tags[index] === "") {
            tags.splice(index, 1);
        }
        setTags([...tags]);
    };

    return (
        <div className="h-full mx-auto max-w-4xl">
            {!isLoading && (
                <Card className="rounded-none">
                    <CardHeader className="pt-2 pb-0 px-2">
                        <CardTitle>
                            <div className="flex flex-col flex-grow items-center justify-center">
                                <div className="flex flex-row w-full justify-between">
                                    <Button size="icon" variant="ghost" onClick={handleBack} role="link"><ArrowLeft size={30} /></Button>
                                    <div className="text-4xl text-center px-4">{recipe?.title}</div>
                                    {isEditMode ? (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button size="icon" variant="ghost"><EllipsisVertical size={30} /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onClick={saveRecipe} className="text-xl">
                                                    <Save className="mr-2" /> Save
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={cancelEdit} className="text-xl">
                                                    <X className="mr-2" /> Cancel
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    ) : (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button size="icon" variant="ghost"><EllipsisVertical size={30} /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onClick={editRecipe} className="text-xl">
                                                    <Pencil className="mr-2" /> Edit
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>

                                {(tags?.length > 0 && !isEditMode) && (
                                    <div className="flex pt-2 text-xl gap-2">
                                        {tags?.map((tag, index) => (
                                            <div key={tag + index} className="rounded-full border-2 border-primary-foreground px-3 text-lg" >{tag}</div>
                                        ))}
                                    </div>
                                )}
                                {isEditMode && (
                                    <div className="w-full flex-wrap flex pt-2 text-xl gap-2 justify-center">
                                        {tags?.map((tag, index) => (
                                            <Input
                                                key={tag + index}
                                                defaultValue={tag}
                                                onBlur={(event) => handleTagChange(index, event)}
                                                className="rounded-full px-3 text-lg w-36">
                                            </Input>
                                        ))}
                                        <Button size="icon" className="rounded-full" onClick={addTag}><Plus></Plus></Button>
                                    </div>
                                )}
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
                                            <Input
                                                value={cookTime}
                                                onChange={handleCookTimeChange}
                                                className="mx-1 px-1 w-16 text-center text-3xl">
                                            </Input>min
                                        </div>
                                        <div className="flex">
                                            <Flame size={36} />
                                            <Input
                                                value={cookTemp}
                                                onChange={handleCookTempChange}
                                                className="mx-1 px-1 w-16 text-center text-3xl">
                                            </Input>°F
                                        </div>
                                    </div>
                                )}
                            </div>
                            <Separator className="my-4" />
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="px-4">

                        <div className="flex flex-col flex-grow items-start gap-2 transition-all ">

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

                        {isEditMode && (
                            <div className="flex pt-6 justify-center">
                                <div className="flex justify-center">
                                    <Button variant="destructive" onClick={deleteRecipe}><Trash className="mr-2"></Trash> Delete Recipe</Button>
                                </div>
                            </div>

                        )}
                    </CardContent>
                </Card>

            )}

        </div>
    );
}

export default Recipe;
