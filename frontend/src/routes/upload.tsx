import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileIcon } from "lucide-react";
import Client, { Environment, Local, api } from "../client";

const getRequestClient = () => {
    return import.meta.env.DEV
        ? new Client(Local)
        : new Client(Environment("staging"));
};

export default function Upload() {
    const client = getRequestClient();

    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [filesData, setFilesData] = useState<api.FileUpload[]>([]);

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

            console.log("Upload successful:", response);
        } catch (error) {
            console.error("Upload failed:", error);
        } finally {
            setIsUploading(false);
        }
    }

    return (
        <Card>
            <CardContent className="p-6 space-y-4">
                <div className="border-2 border-dashed border-gray-200 rounded-lg flex flex-col gap-1 p-6 items-center">
                    <FileIcon className="w-12 h-12" />
                    <span className="text-sm font-medium text-gray-500">Drag and drop a file or click to browse</span>
                    <span className="text-xs text-gray-500">PDF, image, video, or audio</span>
                </div>
                <div className="space-y-2 text-sm">
                    <Label htmlFor="file" className="text-sm font-medium">
                        File
                    </Label>
                    <Input id="file" type="file" accept="image/*" multiple onChange={handleFilesUpload} />
                </div>
            </CardContent>
            <CardFooter>
                <Button size="lg" onClick={uploadToApi} disabled={isUploading}>
                    {isUploading ? "Uploading..." : "Upload"}
                </Button>
            </CardFooter>
        </Card>
    );
}
