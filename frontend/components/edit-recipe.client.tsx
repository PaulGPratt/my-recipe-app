"use client";

import { MilkdownProvider } from "@milkdown/react";
import { ArrowLeft, Flame, MoveDown, Plus, Timer, Trash, TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { api } from "../lib/client";
import { FirebaseContext } from "../lib/firebase";
import getRequestClient from "../lib/get-request-client";
import { UploadDropzone } from "../lib/uploadthing";
import { cn } from "../lib/utils";
import MarkdownEditor from "./markdown-editor";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { Button, buttonVariants } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";

interface EditRecipeClientProps {
    recipe: api.Recipe;
    username: string;
}

export default function EditRecipeClient({ recipe, username }: EditRecipeClientProps) {
    const router = useRouter();
    const { auth } = useContext(FirebaseContext);

    const [token, setToken] = useState<string | undefined>(undefined);
    const [slugError, setSlugError] = useState<string>("");
    const [recipeId] = useState<string>(recipe.id);
    const [recipeProfileId] = useState<string>(recipe.profile_id);
    const [recipeTitle, setRecipeTitle] = useState<string>(recipe.title);
    const [recipeSlug, setRecipeSlug] = useState<string>(recipe.slug);
    const [imageUrl, setImageUrl] = useState<string>(recipe.image_url);
    const [tags, setTags] = useState<string[]>(recipe.tags);
    const [ingredients, setIngredients] = useState<string>(recipe.ingredients);
    const [instructions, setInstructions] = useState<string>(recipe.instructions);
    const [notes, setNotes] = useState<string>(recipe.notes);
    const [cookTime, setCookTime] = useState<number>(recipe.cook_time_minutes);
    const [cookTemp, setCookTemp] = useState<number>(recipe.cook_temp_deg_f);

    const fetchToken = async () => {
        if (!token) {
            const newToken = await auth?.currentUser?.getIdToken();
            setToken(newToken);
            return newToken;
        }
        return token;
    };

    const handleBack = async () => {
        router.push(`/recipes/` + username + '/' + recipe.slug);
    }

    const handleTitleChange = (event: { target: { value: any; }; }) => {
        setRecipeTitle(event.target.value);
    }

    const handleSlugInput = async (event: React.FocusEvent<HTMLInputElement> | React.ChangeEvent<HTMLInputElement>) => {
        const slugVal = event.target.value;

        setSlugError("");
        setRecipeSlug(slugVal);

        // Only check if the event is a blur and the slug has changed
        if (event.type === "blur" && slugVal !== recipe.slug) {
            const slugPattern = /^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*$/;
            let isValidSlug = slugPattern.test(slugVal);
            if (!isValidSlug) {
                setSlugError(`Please use letters and numbers (separated by hyphens if needed).`)
                return;
            }

            try {
                const token = await fetchToken();
                const client = getRequestClient(token ?? undefined);
                const availableResp = await client.api.CheckIfSlugIsAvailable({ slug: slugVal });
                if (!availableResp.available) {
                    setSlugError(`You already have a recipe with that path.`)
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
        tags[index] = event.target.value.trim();
        if (tags[index] === undefined || tags[index] === null || tags[index] === "") {
            tags.splice(index, 1);
        }
        setTags([...tags]);
    };

    const saveRecipe = async () => {
        try {
            const filteredTags = tags.filter((tag) => tag != undefined && tag != null && tag != "");
            setTags(filteredTags);

            const token = await fetchToken();
            const client = getRequestClient(token ?? undefined);
            await client.api.SaveRecipe({
                id: recipeId || uuidv4(),
                profile_id: recipeProfileId,
                slug: recipeSlug,
                title: recipeTitle,
                instructions: instructions,
                ingredients: ingredients,
                notes: notes,
                cook_temp_deg_f: cookTemp,
                cook_time_minutes: cookTime,
                tags: Array.from(new Set(filteredTags)),
                image_url: imageUrl,
            });
            router.push(`/recipes/` + username + '/' + recipeSlug);
        } catch (err) {
            console.error(err);
        }
    };

    const deleteRecipe = async () => {
        if (!recipeId) {
            return;
        }

        try {
            const token = await fetchToken();
            const client = getRequestClient(token ?? undefined);
            await client.api.DeleteRecipe(recipeId)
            router.push(`/recipes/`);
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <div className="h-screen mx-auto max-w-4xl flex flex-col">

            <div className="flex p-4 justify-between">
                <div className="flex gap-4 items-center">
                    <Button size="icon" variant="ghost" onClick={handleBack} role="link" title="Back to Recipe"><ArrowLeft size={30} /></Button>
                    <div className="text-2xl font-semibold">Edit Recipe</div>
                </div>
                <div className="flex gap-2">
                    <Button size="header" variant="secondary" disabled={slugError.length > 0} onClick={saveRecipe}>Save Changes</Button>
                </div>
            </div>
            <Separator />

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
                    <Label htmlFor="title" className="text-2xl font-semibold">URL Path (ex. /recipe-name)</Label>
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
                    <Label className="text-2xl font-semibold">Recipe Image</Label>
                    <div className="flex flex-row gap-4">

                        {imageUrl !== "" && (
                            <img src={imageUrl} alt={recipe.title} className="mt-2 w-2/6 aspect-square object-cover rounded-md" />
                        )}

                        <UploadDropzone
                            className="
                            border-input rounded-md
                            ut-button:bg-secondary ut-button:text-2xl ut-button:font-semibold ut-button:w-40
                            ut-label:text-2xl ut-label:text-muted-foreground ut-label:hover:text-primary
                            ut-allowed-content:text-xl ut-allowed-content:text-muted-foreground"
                            endpoint="imageUploader"
                            onClientUploadComplete={(res) => {
                                setImageUrl(res[0].url)
                            }}
                            onUploadError={(error: Error) => {
                                // Do something with the error.
                                alert(`ERROR! ${error.message}`);
                            }}
                        />
                    </div>
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
        </div>
    )
}
