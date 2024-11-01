import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import Client, { Environment, Local, api } from "../client";
import { useNavigate } from "react-router-dom";
import { Textarea } from "../components/ui/textarea";
import { Separator } from "../components/ui/separator";

const getRequestClient = () => {
    return import.meta.env.DEV
        ? new Client(Local)
        : new Client(Environment("staging"));
};

export default function Upload() {
    const client = getRequestClient();
    const navigate = useNavigate();

    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [filesData, setFilesData] = useState<api.FileUpload[]>([]);
    const [recipeText, setRecipeText] = useState<string>("");

    const handleBack = () => {
        navigate(`/my-recipe-app/recipes/`);
    };

    const handleFilesUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []); // Convert to array with fallback for null
        const newFilesData: api.FileUpload[] = [];

        files.forEach((file: any) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64Content = reader.result?.toString().split(',')[1] || ''; // Safely extracts Base64
                newFilesData.push({
                    filename: file.name,
                    content: base64Content,
                    mime_type: file.type,
                });

                // Update state only when all files are processed
                if (newFilesData.length === files.length) {
                    setFilesData((prevData) => [...prevData, ...newFilesData]);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const handleChangeRecipeText = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setRecipeText(event.target.value);
    }

    const submitImagesToApi = async () => {
        try {
            setIsUploading(true);
            const response = await client.api.GenerateFromImages({
                files: filesData
            } as api.FileUploadRequest);
            navigate(`/my-recipe-app/recipes/${response.id}`);
        } catch (error) {
            console.error("Submit images failed:", error);
        } finally {
            setIsUploading(false);
        }
    }

    const submitTextToApi = async () => {
        try {
            setIsUploading(true);
            const response = await client.api.GenerateFromText({
                text: recipeText
            } as api.GenerateFromTextRequest);
            navigate(`/my-recipe-app/recipes/${response.id}`);
        } catch (error) {
            console.error("Submit text failed:", error);
        } finally {
            setIsUploading(false);
        }
    }

    return (
        <div className="h-full mx-auto max-w-4xl ">
            <div className="p-2 flex flex-row gap-2">
                <Button size="icon" variant="ghost" onClick={handleBack} role="link"><ArrowLeft size={30} /></Button>
                <div className="text-4xl">
                    Add Recipe
                </div>
            </div>
            <Card className="rounded-none pt-4" >
                <CardContent className="p-4 pt-0 flex flex-col">
                    <Label htmlFor="file" className="text-2xl font-semibold">
                        From Images:
                    </Label>
                    <Input id="file" type="file" accept="image/*;capture=camera" multiple onChange={handleFilesUpload}
                        className="p-0 my-2 cursor-pointer file:cursor-pointer h-13 text-2xl file:mr-3 file:px-4 file:py-2 f font-semibold file:text-2xl file:font-semibold file:bg-secondary file:text-secondary-foreground file:shadow file:hover:bg-secondary/80" />
                    {filesData.length !== 0 && (
                        <div>
                            <Button variant="default" onClick={submitImagesToApi} disabled={isUploading}>
                                {isUploading ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Adding recipe</>) : "Submit Images"}
                            </Button>
                        </div>
                    )}

                    {isUploading && (
                        <div className="text-2xl">
                            You will be redirected to the new recipe once adding is complete.
                        </div>
                    )}


                    <div className="my-4 text-2xl flex gap-2 items-center">
                        <div className="flex-grow"><Separator className="bg-muted-foreground" /></div>
                        <span className="text-muted-foreground">OR</span>
                        <div className="flex-grow"><Separator className="bg-muted-foreground" /></div>
                    </div>


                    <Label htmlFor="recipeText" className="text-2xl font-semibold">
                        From Text:
                    </Label>
                    <Textarea
                        id="recipeText"
                        className="text-xl my-2"
                        placeholder="Insert your recipe text here."
                        value={recipeText}
                        onChange={handleChangeRecipeText}
                        disabled={isUploading} />
                    {recipeText.trim().length > 0 && (<div>
                        <Button variant="default" onClick={submitTextToApi} disabled={isUploading}>
                            {isUploading ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Adding recipe</>) : "Submit Text"}
                        </Button>
                    </div>)}
                    {isUploading && (
                        <div className="text-2xl">
                            You will be redirected to the new recipe once adding is complete.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
