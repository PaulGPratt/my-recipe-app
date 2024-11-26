"use client";

import { MilkdownProvider } from "@milkdown/react";
import { ArrowLeft, Flame, Heart, Pencil, Timer } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { api } from "../lib/client";
import { FirebaseContext } from "../lib/firebase";
import getRequestClient from "../lib/get-request-client";
import BreadCrumbs from "./breadcrumbs";
import MarkdownEditor from "./markdown-editor";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";

interface RecipeClientProps {
    recipe: api.Recipe;
    username: string;
}

export default function RecipeClient({ recipe, username }: RecipeClientProps) {
    const { auth } = useContext(FirebaseContext);

    const [ingredients, setIngredients] = useState(recipe.ingredients || "");
    const [instructions, setInstructions] = useState(recipe.instructions || "");
    const [notes, setNotes] = useState(recipe.notes || "");
    const [cookTime] = useState(recipe.cook_time_minutes || 0);
    const [cookTemp] = useState(recipe.cook_temp_deg_f || 0);

    const router = useRouter();

    const handleBack = () => {
        router.push(`/recipes/${username}`);
    };

    const copyRecipe = async () => {
        try {
            const token = await auth?.currentUser?.getIdToken();
            const client = getRequestClient(token ?? undefined);
            const copyResponse = await client.api.CopyRecipe(recipe?.id);
            router.push(`/recipes/${copyResponse.username}/${copyResponse.slug}`);
        } catch (err) {
            console.error(err);
        }
    };

    const editRecipe = () => {
        router.push(`/recipes/${username}/${recipe.slug}/edit`);
    };

    return (
        <div className="h-full mx-auto max-w-4xl flex flex-col">
            <div className="flex p-4 gap-4 justify-between">
                <div className="flex gap-4 items-center">
                    <Button size="icon" variant="ghost" onClick={handleBack} title={`Back to recipes by ${username}`}>
                        <ArrowLeft size={30} />
                    </Button>
                    <BreadCrumbs params={{ username }} />
                </div>
                <div className="flex gap-2">
                    <Button size="icon" variant="ghost" onClick={copyRecipe} title="Save to My Recipes">
                        <Heart />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={editRecipe} title="Edit Recipe">
                        <Pencil />
                    </Button>
                </div>
            </div>
            <Separator />
            <ScrollArea className="h-full w-full">
                <div className="text-4xl px-4 pt-4 font-semibold text-center">{recipe.title}</div>
                {(cookTime > 0 || cookTemp > 0) && (
                    <div className="px-4 pt-2 text-3xl flex flex-row items-center justify-center gap-x-2 font-semibold">
                        {cookTime > 0 && (
                            <div className="flex items-center">
                                <Timer size={26} /> {cookTime}min
                            </div>
                        )}
                        {cookTemp > 0 && (
                            <div className="flex items-center">
                                <Flame size={26} /> {cookTemp}°F
                            </div>
                        )}
                    </div>
                )}
                <Separator className="m-4" />
                <div className="px-4 pb-4 flex flex-col flex-grow items-start gap-2 transition-all">
                    <div className="text-3xl font-semibold">Ingredients</div>
                    <div className="text-2xl text-foreground w-full">
                        <MilkdownProvider>
                            <MarkdownEditor content={ingredients} setContent={setIngredients} isEditable={false} />
                        </MilkdownProvider>
                    </div>
                    <Separator className="my-2" />
                    <div className="text-3xl font-semibold">Instructions</div>
                    <div className="text-2xl text-foreground w-full">
                        <MilkdownProvider>
                            <MarkdownEditor content={instructions} setContent={setInstructions} isEditable={false} />
                        </MilkdownProvider>
                    </div>
                    {notes.length > 0 && (
                        <>
                            <Separator className="my-2" />
                            <div className="text-3xl font-semibold">Notes</div>
                            <div className="text-2xl text-foreground w-full">
                                <MilkdownProvider>
                                    <MarkdownEditor content={notes} setContent={setNotes} isEditable={false} />
                                </MilkdownProvider>
                            </div>
                        </>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
