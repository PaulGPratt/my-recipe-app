import { useState } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Loader2 } from "lucide-react";
import Client, { Environment, Local, api } from "../client";
import { useNavigate } from "react-router-dom";
import { Textarea } from "../components/ui/textarea";

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
            <div className="p-4">
                <Button onClick={handleBack}><ChevronLeft size={30} /> Recipes</Button>
            </div>
            <Card className="rounded-none pt-4" >
                <CardTitle className="px-4 pb-2">
                    <Label htmlFor="file" className="text-2xl font-semibold">
                        Add Recipe from Pictures
                    </Label>
                </CardTitle>
                <CardContent className="p-4 pt-0 flex flex-col gap-4">
                    <Input id="file" type="file" accept="image/*" capture="environment" multiple onChange={handleFilesUpload}
                        className="p-0 cursor-pointer file:cursor-pointer h-13 text-2xl file:mr-3 file:px-4 file:py-2 f font-semibold file:text-2xl file:font-semibold file:bg-secondary file:text-secondary-foreground file:shadow file:hover:bg-secondary/80" />
                    <div>
                        <Button variant="default" onClick={submitImagesToApi} disabled={isUploading || filesData.length === 0}>
                            {isUploading ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Adding recipe</>) : "Add from Images"}
                        </Button>
                    </div>
                    {isUploading && (
                        <div className="text-2xl">
                            You will be redirected to the new recipe once adding is complete.
                        </div>
                    )}
                </CardContent>
            </Card>
            <Card className="rounded-none pt-4" >
                <CardTitle className="px-4 pb-2">
                    <Label htmlFor="recipeText" className="text-2xl font-semibold">
                        Add Recipe from Text
                    </Label>
                </CardTitle>
                <CardContent className="p-4 pt-0 flex flex-col gap-4">
                    <Textarea
                        id="recipeText"
                        className="text-xl"
                        placeholder="Insert your recipe text here."
                        value={recipeText}
                        onChange={handleChangeRecipeText} 
                        disabled={isUploading}/>
                    <div>
                        <Button variant="default" onClick={submitTextToApi} disabled={isUploading || recipeText.trim().length < 1}>
                            {isUploading ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Adding recipe</>) : "Add from Text"}
                        </Button>
                    </div>
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
