"use client";

import { MilkdownProvider } from "@milkdown/react";
import { ArrowLeft, Flame, Heart, Pencil, Printer, Timer } from "lucide-react";
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
import ProfileMenu from "./profile-menu";

interface RecipeClientProps {
    recipe: api.Recipe;
    username: string;
}

export default function RecipeClient({ recipe, username }: RecipeClientProps) {
    const { auth } = useContext(FirebaseContext);

    const [imageUrl] = useState(recipe.image_url || "");
    const [ingredients, setIngredients] = useState(recipe.ingredients || "");
    const [instructions, setInstructions] = useState(recipe.instructions || "");
    const [notes, setNotes] = useState(recipe.notes || "");
    const [cookTime] = useState(recipe.cook_time_minutes || 0);
    const [cookTemp] = useState(recipe.cook_temp_deg_f || 0);

    const router = useRouter();

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

    const printRecipe = async () => {
        window.print();
    }

    const editRecipe = () => {
        router.push(`/recipes/${username}/${recipe.slug}/edit`);
    };

    return (
        <div className="h-full mx-auto max-w-4xl flex flex-col">
            <div className="flex p-4 gap-4 justify-between print:hidden">

                <div className="flex gap-4 items-center">
                    <ProfileMenu></ProfileMenu>
                    <BreadCrumbs params={{ username }} />
                </div>
                <div className="flex gap-2">
                    <Button size="icon" variant="ghost" onClick={printRecipe} title="Print"><Printer /></Button>
                    {(auth?.currentUser?.uid && auth.currentUser.uid !== recipe?.profile_id) && (
                        <Button size="icon" variant="ghost" onClick={copyRecipe} title="Save to My Recipes"><Heart /></Button>
                    )}
                    {(auth?.currentUser?.uid && auth.currentUser.uid === recipe?.profile_id) && (
                        <Button size="icon" variant="ghost" onClick={editRecipe} title="Edit Recipe"><Pencil /></Button>
                    )}
                </div>
            </div>
            <Separator className="print:hidden"/>
            <ScrollArea className="h-full w-full">

                <div className="text-4xl px-4 pt-4 font-semibold flex flex-row gap-4">
                    {imageUrl !== "" && (
                        <img src={imageUrl} alt={recipe.title} className="w-2/6 aspect-square object-cover rounded-md print:hidden" />
                    )}
                    <div className="flex-grow flex flex-col justify-evenly gap-4">
                        <div className="text-center md:text-5xl lg:text-6xl">{recipe.title}</div>
                        {(cookTime > 0 || cookTemp > 0) && (
                            <div className="px-4 text-3xl sm:text-4xl md:text-5xl flex flex-row items-center justify-center gap-x-2 font-semibold">
                                {cookTime > 0 && (
                                    <div className="flex items-center">
                                        <Timer className="w-7 h-7 sm:w-8 sm:h-8 md:w-11 md:h-11" /> {cookTime}min
                                    </div>
                                )}
                                {cookTemp > 0 && (
                                    <div className="flex items-center">
                                        <Flame className="w-7 h-7 sm:w-8 sm:h-8 md:w-11 md:h-11" /> {cookTemp}°F
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <Separator className="m-4 print:hidden" />
                <div className="px-4 pb-4 flex flex-col flex-grow items-start gap-2 transition-all">
                    <div className="text-3xl font-semibold break-after-avoid">Ingredients</div>
                    <div className="text-2xl text-foreground w-full">
                        <MilkdownProvider>
                            <MarkdownEditor content={ingredients} setContent={setIngredients} isEditable={false} />
                        </MilkdownProvider>
                    </div>
                    
                    <Separator className="my-2" />
                    <div className="text-3xl font-semibold break-after-avoid">Instructions</div>
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
