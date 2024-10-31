import { useState } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Loader2 } from "lucide-react";
import Client, { Environment, Local, api } from "../client";
import { useNavigate } from "react-router-dom";

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

    const handleBack = () => {
        navigate(`/my-recipe-app/recipes/`);
    };

    const handleFilesUpload = (event: any) => {
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

    const uploadToApi = async () => {
        try {
            setIsUploading(true);
            const response = await client.api.UploadRecipe({
                files: filesData
            } as api.FileUploadRequest);
            navigate(`/my-recipe-app/recipes/${response.id}`);
        } catch (error) {
            console.error("Upload failed:", error);
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
                    <Input id="file" type="file" accept="image/*" multiple onChange={handleFilesUpload}
                        className="p-0 cursor-pointer file:cursor-pointer h-13 text-2xl file:mr-3 file:px-4 file:py-2 f font-semibold file:text-2xl file:font-semibold file:bg-secondary file:text-secondary-foreground file:shadow file:hover:bg-secondary/80" />
                    <div>
                        <Button variant="default" onClick={uploadToApi} disabled={isUploading || filesData.length === 0}>
                            {isUploading ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Adding recipe</>) : "Submit"}
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
