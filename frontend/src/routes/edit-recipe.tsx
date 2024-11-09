import { useNavigate, useParams } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';
import Client, { Environment, Local, api } from "../client";
import { Button, buttonVariants } from "../components/ui/button";
import { ArrowLeft, Flame, MoveDown, Plus, Save, Timer, Trash, TriangleAlert } from "lucide-react";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { MilkdownProvider } from "@milkdown/react";
import MarkdownEditor from "../components/markdown-editor";
import { useEffect, useState } from "react";
import { ScrollArea } from "../components/ui/scroll-area";
import { Separator } from "../components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../components/ui/alert-dialog";
import { cn } from "../lib/utils";

const getRequestClient = () => {
    return import.meta.env.DEV
        ? new Client(Local)
        : new Client(Environment("staging"));
};

function EditRecipe() {
    const client = getRequestClient();
    const navigate = useNavigate();

    const { slug } = useParams();

    const [isLoading, setIsLoading] = useState(true);
    const [slugError, setSlugError] = useState<string>("");
    const [recipeId, setRecipeId] = useState<string>("");
    const [recipeTitle, setRecipeTitle] = useState<string>("");
    const [recipeSlug, setRecipeSlug] = useState<string>("");
    const [tags, setTags] = useState<string[]>([]);
    const [ingredients, setIngredients] = useState<string>("");
    const [instructions, setInstructions] = useState<string>("");
    const [notes, setNotes] = useState<string>("");
    const [cookTime, setCookTime] = useState<number>(0);
    const [cookTemp, setCookTemp] = useState<number>(0);

    useEffect(() => {
        const loadRecipe = async () => {
            if (!slug) return;

            try {
                const freshRecipe = await client.api.GetRecipe(slug);
                setRecipeState(freshRecipe);
            } catch (err) {
                console.error(err);
            }
            setIsLoading(false);

        };

        loadRecipe();
    }, [slug]);

    const setRecipeState = (recipeResponse: api.Recipe) => {
        setRecipeId(recipeResponse.id);
        setRecipeTitle(recipeResponse.title);
        setRecipeSlug(recipeResponse.slug);
        setTags(recipeResponse.tags ?? []);
        setIngredients(recipeResponse.ingredients);
        setInstructions(recipeResponse.instructions);
        setNotes(recipeResponse.notes);
        setCookTemp(recipeResponse.cook_temp_deg_f);
        setCookTime(recipeResponse.cook_time_minutes);
    }

    const handleBack = async () => {
        navigate(`/recipes/` + slug);
    }

    const handleTitleChange = (event: { target: { value: any; }; }) => {
        setRecipeTitle(event.target.value);
    }

    const handleSlugInput = async (event: React.FocusEvent<HTMLInputElement> | React.ChangeEvent<HTMLInputElement>) => {
        const slugVal = event.target.value;
        
        setSlugError("");
        setRecipeSlug(slugVal);

        // Only check if the event is a blur and the slug has changed
        if (event.type === "blur" && slugVal !== slug) {
            const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
            let isValidSlug = slugPattern.test(slugVal);
            if (!isValidSlug) {
                setSlugError(`Please only use lowercase letters and numbers separated by hyphens.`)
                return;
            }

            try {
                const availableResp = await client.api.CheckIfSlugIsAvailable({ slug: slugVal });
                if(!availableResp.available) {
                    setSlugError(`${slugVal} is already in use`)
                }
            } catch (err) {
                console.error(err);
            }
        }
    };

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

            await client.api.SaveRecipe({
                id: recipeId || uuidv4(),
                slug: recipeSlug,
                title: recipeTitle,
                instructions: instructions,
                ingredients: ingredients,
                notes: notes,
                cook_temp_deg_f: cookTemp,
                cook_time_minutes: cookTime,
                tags: filteredTags,
            });
            navigate(`/recipes/` + recipeSlug);
        } catch (err) {
            console.error(err);
        }
    };

    const deleteRecipe = async () => {
        if (!recipeId) {
            return;
        }

        try {
            await client.api.DeleteRecipe(recipeId)
            navigate(`/recipes/`);
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
                    <Button size="icon" variant="ghost" disabled={slugError.length > 0} onClick={saveRecipe}><Save /></Button>
                </div>
            </div>
            <Separator />

            {!isLoading && (
                <ScrollArea className="h-full w-full">
                    <div className="p-4">
                        <Label htmlFor="title" className="text-2xl font-semibold">Recipe Name</Label>
                        <Input
                            id="title"
                            className="mt-2 h-12 text-2xl"
                            value={recipeTitle}
                            onChange={handleTitleChange}></Input>
                    </div>

                    <div className="p-4 pt-0">
                        <Label htmlFor="title" className="text-2xl font-semibold">URL Segment (ex. /recipe-name)</Label>
                        <Input
                            id="title"
                            className="mt-2 h-12 text-2xl"
                            value={recipeSlug}
                            onChange={handleSlugInput}
                            onBlur={handleSlugInput}></Input>
                        {slugError.length > 0 && (
                            <div className="flex gap-4 items-center pt-2">
                                <TriangleAlert />
                                <div className="text-xl">{slugError}</div>
                            </div>
                        )}
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

                    <div className="p-4 py-0">
                        <Label className="text-2xl font-semibold">Notes</Label>
                        <div className="ProseMirrorEdit text-2xl pt-2">
                            <MilkdownProvider>
                                <MarkdownEditor content={notes} setContent={setNotes} isEditable={true} />
                            </MilkdownProvider>
                        </div>
                    </div>

                    <Separator className="my-16 mx-4" />

                    <div className="px-4 flex flex-row gap-2 items-center justify-center">
                        <MoveDown />
                        <div className="text-3xl font-semibold">DANGER ZONE</div>
                        <MoveDown />
                    </div>


                    <div className="flex p-4 py-16 justify-center">
                        <div className="flex justify-center">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive"><Trash className="mr-2"></Trash> Delete Recipe</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="text-2xl">Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription className="text-xl">
                                            This action cannot be undone. This will permanently delete your recipe.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            className={cn(buttonVariants({ variant: "destructive" }))}
                                            onClick={deleteRecipe}>
                                            Confirm
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>

                        </div>
                    </div>
                </ScrollArea>
            )}
        </div>
    )
}

export default EditRecipe;