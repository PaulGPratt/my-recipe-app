import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Client, { Environment, Local, api } from "../client";
import MarkdownEditor from "../components/markdown-editor";
import { MilkdownProvider } from "@milkdown/react";
import { ArrowLeft, Flame, Pencil, Timer } from "lucide-react";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { setLocalStorage, getLocalStorage } from '../utils/localStorage';
import { ScrollArea } from "../components/ui/scroll-area";

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
        navigate(`/my-recipe-app/recipes/` + id + '/edit');
    }

    return (
        <div className="h-full mx-auto max-w-4xl flex flex-col">

            <div className="flex p-4 gap-4 justify-between">
                <Button size="icon" variant="ghost" onClick={handleBack} role="link"><ArrowLeft size={30} /></Button>
                <div className="flex flex-grow items-center">
                    {!isLoading && (<div className="text-2xl font-semibold">{recipe?.title}</div>)}
                </div>
                <Button size="icon" variant="ghost" onClick={editRecipe}><Pencil /></Button>

            </div>
            <Separator />

            {!isLoading && (
                <ScrollArea className="h-full w-full">
                    <div className="px-4 pt-4 pb-2 text-3xl flex flex-row items-center justify-center gap-x-2">
                        {(tags?.length > 0) && (
                            <div className="flex gap-2">
                                {tags?.map((tag, index) => (
                                    <div key={tag + index} className="rounded-full border-2 border-input px-3 bg-secondary text-secondary-foreground text-xl font-semibold" >{tag}</div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="px-4 text-3xl flex flex-row items-center justify-center gap-x-2 font-semibold">

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
                    <Separator className="m-4" />

                    <div className="px-4 flex flex-col flex-grow items-start gap-2 transition-all ">
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
                    </div>
                </ScrollArea>
            )}

        </div>
    );
}

export default Recipe;
