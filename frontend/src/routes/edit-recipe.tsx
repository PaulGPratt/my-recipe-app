import { useNavigate, useParams } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';
import Client, { Environment, Local, api } from "../client";
import { Button } from "../components/ui/button";
import { ArrowLeft, Flame, Plus, Save, Timer, Trash, X } from "lucide-react";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { MilkdownProvider } from "@milkdown/react";
import MarkdownEditor from "../components/markdown-editor";
import { useEffect, useState } from "react";
import { getLocalStorage, setLocalStorage } from "../utils/localStorage";
import { ScrollArea } from "../components/ui/scroll-area";

const getRequestClient = () => {
    return import.meta.env.DEV
        ? new Client(Local)
        : new Client(Environment("staging"));
};

function EditRecipe() {
    const client = getRequestClient();
    const navigate = useNavigate();

    const { id } = useParams();

    const [isLoading, setIsLoading] = useState(true);
    const [recipeTitle, setRecipeTitle] = useState<string>("");
    const [tags, setTags] = useState<string[]>([]);
    const [ingredients, setIngredients] = useState<string>("");
    const [instructions, setInstructions] = useState<string>("");
    const [cookTime, setCookTime] = useState<number>(0);
    const [cookTemp, setCookTemp] = useState<number>(0);

    useEffect(() => {
        const loadRecipe = async () => {
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

        loadRecipe();
    }, [id]);

    const setRecipeState = (recipeResponse: api.Recipe) => {
        setRecipeTitle(recipeResponse.title);
        setTags(recipeResponse.tags ?? []);
        setIngredients(recipeResponse.ingredients);
        setInstructions(recipeResponse.instructions);
        setCookTemp(recipeResponse.cook_temp_deg_f);
        setCookTime(recipeResponse.cook_time_minutes);
    }

    const handleBack = async () => {
        navigate(`/my-recipe-app/recipes/` + id);
    }

    const handleTitleChange = (event: { target: { value: any; }; }) => {
        setRecipeTitle(event.target.value);
    }

    const handleCookTimeChange = (event: { target: { value: any; }; }) => {
        setCookTime(Number(event.target.value));
    }

    const handleCookTempChange = (event: { target: { value: any; }; }) => {
        setCookTemp(Number(event.target.value));
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

    const saveRecipe = async () => {
        try {
            const filteredTags = tags.filter((tag) => tag != undefined && tag != null && tag != "");
            setTags(filteredTags);

            const response = await client.api.SaveRecipe({
                id: id || uuidv4(),
                title: recipeTitle,
                instructions: instructions,
                ingredients: ingredients,
                cook_temp_deg_f: cookTemp,
                cook_time_minutes: cookTime,
                tags: filteredTags,
            });
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

    return (
        <div className="h-full mx-auto max-w-4xl flex flex-col">

            <div className="flex p-4 justify-between">
                <div className="flex gap-4 items-center">
                    <Button size="icon" variant="ghost" onClick={handleBack} role="link"><ArrowLeft size={30} /></Button>
                    <div className="text-2xl font-semibold">Edit Recipe</div>
                </div>
                <div className="flex gap-2">
                    <Button size="icon" variant="ghost" onClick={saveRecipe}><Save /></Button>
                </div>
            </div>

            {!isLoading && (
                <ScrollArea className="h-full w-full">
                    <div className="p-4 pt-0">
                        <Label htmlFor="title" className="text-2xl font-semibold">Recipe Name</Label>
                        <Input
                            id="title"
                            className="mt-2 h-12 text-2xl"
                            value={recipeTitle}
                            onChange={handleTitleChange}></Input>
                    </div>

                    <div className="p-4 pt-0">
                        <Label className="text-2xl font-semibold">Tags</Label>
                        <div className="w-full flex-wrap flex pt-2 gap-2">
                            {tags?.map((tag, index) => (
                                <Input
                                    key={tag + index}
                                    defaultValue={tag}
                                    onBlur={(event) => handleTagChange(index, event)}
                                    className="rounded-full px-3 h-10 text-2xl w-36">
                                </Input>
                            ))}
                            <Button size="icon" className="rounded-full" onClick={addTag}><Plus></Plus></Button>
                        </div>
                    </div>

                    <div className="p-4 pt-0 flex gap-2">
                        <div className="flex-grow">
                            <Label htmlFor="time" className="text-2xl font-semibold">Time (min)</Label>
                            <div className="relative flex-grow">
                                <Timer className="absolute left-3 top-3 h-6 w-6 text-muted-foreground" />
                                <Input
                                    id="time"
                                    className="mt-2 pl-11 h-12 text-2xl"
                                    value={cookTime}
                                    onChange={handleCookTimeChange}></Input>
                            </div>
                        </div>
                        <div className="flex-grow">
                            <Label htmlFor="temp" className="text-2xl font-semibold">Temperature (°F)</Label>
                            <div className="relative flex-grow">
                                <Flame className="absolute left-3 top-3 h-6 w-6 text-muted-foreground" />
                                <Input
                                    id="temp"
                                    className="mt-2 pl-11 h-12 text-2xl"
                                    value={cookTemp}
                                    onChange={handleCookTempChange}></Input>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 pt-0">
                        <Label className="text-2xl font-semibold">Ingredients</Label>
                        <div className="ProseMirrorEdit text-2xl pt-2">
                            <MilkdownProvider>
                                <MarkdownEditor content={ingredients} setContent={setIngredients} isEditable={true} />
                            </MilkdownProvider>
                        </div>
                    </div>

                    <div className="p-4 pt-0">
                        <Label className="text-2xl font-semibold">Instructions</Label>
                        <div className="ProseMirrorEdit text-2xl pt-2">
                            <MilkdownProvider>
                                <MarkdownEditor content={instructions} setContent={setInstructions} isEditable={true} />
                            </MilkdownProvider>
                        </div>
                    </div>

                    <div className="flex p-4 pt-0 justify-center">
                        <div className="flex justify-center">
                            <Button variant="destructive" onClick={deleteRecipe}><Trash className="mr-2"></Trash> Delete Recipe</Button>
                        </div>
                    </div>
                </ScrollArea>
            )}
        </div>
    )
}

export default EditRecipe;