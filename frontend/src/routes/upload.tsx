import { useState } from "react";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, FileIcon } from "lucide-react";
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
        <div className="p-4">
            <Button className="mb-4" onClick={handleBack}><ChevronLeft size={30} /> Recipes</Button>
            <Card >
                <CardTitle className="p-4">
                    <Label htmlFor="file" className="text-2xl">
                        Upload Files
                    </Label>
                </CardTitle>
                <CardContent className="p-4 pt-0 flex items-center gap-2">
                    <Input id="file" type="file" accept="image/*" multiple onChange={handleFilesUpload} className="h-12 text-2xl" />
                    <Button variant="default" onClick={uploadToApi} disabled={isUploading || filesData.length === 0}>
                        {isUploading ? "Uploading..." : "Upload"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
