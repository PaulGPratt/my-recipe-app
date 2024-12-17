"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { api } from "../lib/client";
import { FirebaseContext } from "../lib/firebase";
import getRequestClient from "../lib/get-request-client";
import { ImageUploader } from "./image-uploader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Textarea } from "./ui/textarea";


export default function AddRecipeClient() {
    const router = useRouter();
    const { auth } = useContext(FirebaseContext);

    const [token, setToken] = useState<string | undefined>(undefined);
    const [isUploadingFiles, setIsUploadingFiles] = useState(false);
    const [isSubmittingText, setIsSubmittingText] = useState(false);
    const [filesData, setFilesData] = useState<api.FileUpload[]>([]);
    const [filePreviews, setFilePreviews] = useState<(string | ArrayBuffer | null)[]>([]);
    const [recipeText, setRecipeText] = useState("");

    const fetchToken = async () => {
        if (!token) {
            const newToken = await auth?.currentUser?.getIdToken();
            setToken(newToken);
            return newToken;
        }
        return token;
    };

    const handleBack = () => {
        router.push(`/home/`);
    };

    const handleImagesUpload = (files: File[]) => {
        const newFilesData: api.FileUpload[] = [];
        const newFilePreviews: (string | ArrayBuffer | null)[] = [];
        files.forEach((file: any) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                newFilePreviews.push(reader.result);
                const base64Content = reader.result?.toString().split(",")[1] || "";
                newFilesData.push({
                    filename: file.name,
                    content: base64Content,
                    mime_type: file.type,
                });

                if (newFilesData.length === files.length) {
                    setFilesData((prevData) => [...prevData, ...newFilesData]);
                    setFilePreviews((prev) => [...prev, ...newFilePreviews]);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const handleRemoveFile = (index: number) => {
        setFilesData((prev) => prev.filter((_, i) => i !== index));
        setFilePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const handleChangeRecipeText = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setRecipeText(event.target.value);
    };

    const submitImagesToApi = async () => {
        try {
            setIsUploadingFiles(true);
            const token = await fetchToken();
            const client = getRequestClient(token);
            const response = await client.api.GenerateFromImages({
                files: filesData,
            } as api.FileUploadRequest);
            router.push(`/recipes/${response.username}/${response.slug}`);
        } catch (error) {
            console.error("Submit images failed:", error);
        } finally {
            setIsUploadingFiles(false);
        }
    };

    const submitTextToApi = async () => {
        try {
            setIsSubmittingText(true);
            const token = await fetchToken();
            const client = getRequestClient(token);
            const response = await client.api.GenerateFromText({
                text: recipeText,
            } as api.GenerateFromTextRequest);
            router.push(`/recipes/${response.username}/${response.slug}`);
        } catch (error) {
            console.error("Submit text failed:", error);
        } finally {
            setIsSubmittingText(false);
        }
    };

    return (
        <div className="h-full mx-auto max-w-4xl ">
            <div className="p-4 flex flex-row gap-4 items-center">
                <Button size="icon" variant="ghost" onClick={handleBack} role="link" title="Back to recipes">
                    <ArrowLeft size={30} />
                </Button>
                <div className="text-2xl font-semibold">Add Recipe</div>
            </div>
            <Tabs defaultValue="from-images" className="w-full px-4 pb-4">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="from-images">From Images</TabsTrigger>
                    <TabsTrigger value="from-text">From Text</TabsTrigger>
                </TabsList>
                <TabsContent value="from-images">
                    <div className="flex flex-col mt-4 p-4 border rounded-md">
                        <div className="text-2xl font-semibold">Add Recipe From Images</div>
                        <div className="text-xl text-muted-foreground">
                            Choose one or more images of your recipe and submit. We will extract the details for you and add it to your recipe list.
                        </div>
                        {filePreviews.map((preview, index) => (
                            <div key={index} className="mt-4 relative flex items-center justify-center bg-secondary rounded-md overflow-hidden w-full">
                                <img src={preview as string} alt="Uploaded image" className="h-full w-full object-cover" />
                                <Button variant="secondary" size="icon" className="absolute top-2 right-2" disabled={isSubmittingText || isUploadingFiles} onClick={() => handleRemoveFile(index)}>
                                    <X />
                                </Button>
                            </div>
                        ))}
                        <div className="pt-4 flex justify-center gap-4">
                            {filePreviews.length < 5 && !isUploadingFiles && <ImageUploader onImagesUpload={handleImagesUpload} />}
                            {filesData.length !== 0 && (
                                <Button variant="default" onClick={submitImagesToApi} disabled={isUploadingFiles}>
                                    {isUploadingFiles ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Adding recipe</> : "Submit"}
                                </Button>
                            )}
                        </div>
                        {isUploadingFiles && (
                            <div className="text-2xl pt-4">
                                You will be redirected to the new recipe once adding is complete.
                            </div>
                        )}
                    </div>
                </TabsContent>
                <TabsContent value="from-text">
                    <div className="flex flex-col mt-4 p-4 border rounded-md">
                        <div className="text-2xl font-semibold">Add Recipe From Text</div>
                        <Textarea
                            id="recipeText"
                            className="text-xl mt-4"
                            placeholder="Copy and paste your recipe text here."
                            value={recipeText}
                            onChange={handleChangeRecipeText}
                            disabled={isSubmittingText || isUploadingFiles}
                            rows={10}
                        />
                        {recipeText.trim().length > 0 && (
                            <div className="pt-4 mx-auto">
                                <Button variant="default" onClick={submitTextToApi} disabled={isSubmittingText}>
                                    {isSubmittingText ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Adding recipe</> : "Submit"}
                                </Button>
                            </div>
                        )}
                        {isSubmittingText && (
                            <div className="text-2xl pt-4 text-center">
                                You will be redirected to the new recipe once adding is complete.
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
