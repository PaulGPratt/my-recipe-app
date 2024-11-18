import { MilkdownProvider } from "@milkdown/react";
import { ArrowLeft, Flame, Heart, Pencil, Timer } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../client";
import BreadCrumbs from "../components/breadcrumbs";
import MarkdownEditor from "../components/markdown-editor";
import { Button } from "../components/ui/button";
import { ScrollArea } from "../components/ui/scroll-area";
import { Separator } from "../components/ui/separator";
import { FirebaseContext } from "../lib/firebase";
import getRequestClient from "../lib/get-request-client";


function Recipe() {

    const navigate = useNavigate();

    // Get the 'id' from the route parameters
    const { username, slug } = useParams();
    const { auth } = useContext(FirebaseContext);

    const [isLoading, setIsLoading] = useState(true);
    const [recipe, setRecipe] = useState<api.Recipe>();
    const [ingredients, setIngredients] = useState<string>("");
    const [instructions, setInstructions] = useState<string>("");
    const [notes, setNotes] = useState<string>("");
    const [cookTime, setCookTime] = useState<number>(0);
    const [cookTemp, setCookTemp] = useState<number>(0);

    useEffect(() => {

        const loadRecipes = async () => {
            if (!username || !slug) return;

            try {
                const token = await auth?.currentUser?.getIdToken();
                const client = getRequestClient(token ?? undefined);
                const freshRecipe = await client.api.GetRecipe(username, slug);
                setRecipeState(freshRecipe);
            } catch (err) {
                console.error(err);
            }
            setIsLoading(false);
        };

        loadRecipes();
    }, [username, slug]);



    const setRecipeState = (recipeResponse: api.Recipe) => {
        setRecipe(recipeResponse);
        setIngredients(recipeResponse.ingredients);
        setInstructions(recipeResponse.instructions);
        setNotes(recipeResponse.notes);
        setCookTemp(recipeResponse.cook_temp_deg_f);
        setCookTime(recipeResponse.cook_time_minutes);
    }

    const copyRecipe = async () => {
        if (!recipe?.id) {
            return;
        }

        try {
            const token = await auth?.currentUser?.getIdToken();
            const client = getRequestClient(token ?? undefined);
            const copyResponse = await client.api.CopyRecipe(recipe?.id);
            navigate(`/recipes/${copyResponse.username}/${copyResponse.slug}`)
        } catch (err) {
            console.error(err);
        }
    }

    const editRecipe = async () => {
        navigate(`/recipes/${username}/${slug}/edit`);
    }

    const handleBack = () => {
        navigate(`/recipes/${username}`);
    };

    return (
        <div className="h-full mx-auto max-w-4xl flex flex-col">

            <div className="flex p-4 gap-4 justify-between">
                <div className="flex gap-4 items-center">
                    <Button size="icon" variant="ghost" onClick={handleBack} role="link" title={`Back to recipes by ${username}`}><ArrowLeft size={30} /></Button>
                    <BreadCrumbs></BreadCrumbs>
                </div>
                {(auth?.currentUser?.uid && auth.currentUser.uid !== recipe?.profile_id) && (
                    <Button size="icon" variant="ghost" onClick={copyRecipe} title="Save to My Recipes"><Heart /></Button>
                )}
                {(auth?.currentUser?.uid && auth.currentUser.uid === recipe?.profile_id) && (
                    <Button size="icon" variant="ghost" onClick={editRecipe} title="Edit Recipe"><Pencil /></Button>
                )}
            </div>
            <Separator />

            {!isLoading && (
                <ScrollArea className="h-full w-full">
                    <div className="text-4xl px-4 pt-4 font-semibold text-center">{recipe?.title}</div>
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

                    <div className="px-4 pb-4 flex flex-col flex-grow items-start gap-2 transition-all ">
                        <div className="text-3xl font-semibold">Ingredients</div>
                        <div className={"text-2xl text-foreground w-full"}>
                            <MilkdownProvider>
                                <MarkdownEditor content={ingredients} setContent={setIngredients} isEditable={false} />
                            </MilkdownProvider>
                        </div>
                        <Separator className="my-2" />
                        <div className="text-3xl font-semibold">Instructions</div>
                        <div className={"text-2xl text-foreground w-full"}>
                            <MilkdownProvider>
                                <MarkdownEditor content={instructions} setContent={setInstructions} isEditable={false} />
                            </MilkdownProvider>
                        </div>
                        {notes.length > 0 && (
                            <>
                                <Separator className="my-2" />
                                <div className="text-3xl font-semibold">Notes</div>
                                <div className={"text-2xl text-foreground w-full"}>
                                    <MilkdownProvider>
                                        <MarkdownEditor content={notes} setContent={setNotes} isEditable={false} />
                                    </MilkdownProvider>
                                </div>
                            </>
                        )}

                    </div>
                </ScrollArea>
            )}

        </div>
    );
}

export default Recipe;
