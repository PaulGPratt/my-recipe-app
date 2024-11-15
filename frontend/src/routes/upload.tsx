import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, X } from "lucide-react";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../client";
import { ImageUploader } from "../components/image-uploader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Textarea } from "../components/ui/textarea";
import { FirebaseContext } from "../lib/firebase";
import getRequestClient from "../lib/get-request-client";

export default function Upload() {
    const { auth } = useContext(FirebaseContext);
    const navigate = useNavigate();

    const [isUploadingFiles, setIsUploadingFiles] = useState<boolean>(false);
    const [isSubmittingText, setIsSubmittingText] = useState<boolean>(false);
    const [filesData, setFilesData] = useState<api.FileUpload[]>([]);
    const [filePreviews, setFilePreviews] = useState<(string | ArrayBuffer | null)[]>([]);
    const [recipeText, setRecipeText] = useState<string>("");

    const handleBack = () => {
        navigate(`/recipes/`);
    };

    const handleImagesUpload = (files: File[]) => {
        const newFilesData: api.FileUpload[] = [];
        const newFilePreviews: (string | ArrayBuffer | null)[] = [];
        files.forEach((file: any) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                newFilePreviews.push(reader.result);
                const base64Content = reader.result?.toString().split(',')[1] || ''; // Safely extracts Base64
                newFilesData.push({
                    filename: file.name,
                    content: base64Content,
                    mime_type: file.type,
                });

                // Update state only when all files are processed
                if (newFilesData.length === files.length) {
                    setFilesData((prevData) => [...prevData, ...newFilesData]);
                    setFilePreviews((prev) => [...prev, ...newFilePreviews])
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
    }

    const submitImagesToApi = async () => {
        try {
            setIsUploadingFiles(true);
            const token = await auth?.currentUser?.getIdToken();
            const client = getRequestClient(token ?? undefined);
            const response = await client.api.GenerateFromImages({
                files: filesData
            } as api.FileUploadRequest);
            navigate(`/recipes/${response.username}/${response.slug}`);
        } catch (error) {
            console.error("Submit images failed:", error);
        } finally {
            setIsUploadingFiles(false);
        }
    }

    const submitTextToApi = async () => {
        try {
            setIsSubmittingText(true);
            const token = await auth?.currentUser?.getIdToken();
            const client = getRequestClient(token ?? undefined);
            const response = await client.api.GenerateFromText({
                text: recipeText
            } as api.GenerateFromTextRequest);
            navigate(`/recipes/${response.username}/${response.slug}`);
        } catch (error) {
            console.error("Submit text failed:", error);
        } finally {
            setIsSubmittingText(false);
        }
    }

    return (
        <div className="h-full mx-auto max-w-4xl ">
            <div className="p-4 flex flex-row gap-4 items-center">
                <Button size="icon" variant="ghost" onClick={handleBack} role="link" title="Back to Recipes"><ArrowLeft size={30} /></Button>
                <div className="text-2xl font-semibold">
                    Add Recipe
                </div>
            </div>
            <Tabs defaultValue="from-images" className="w-full px-4">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="from-images">From Images</TabsTrigger>
                    <TabsTrigger value="from-text">From Text</TabsTrigger>
                </TabsList>
                <TabsContent value="from-images" className="flex flex-col mt-0">
                    {filePreviews.map((preview, index) => (
                        <div
                            key={`preview_${index}`}
                            className="mt-4 relative flex items-center justify-center bg-secondary rounded-md overflow-hidden w-full"
                        >
                            <img
                                src={preview as string}
                                alt="Uploaded image"
                                className="h-full w-full object-cover"
                            />
                            <Button
                                variant="secondary"
                                size="icon"
                                className="absolute top-2 right-2"
                                onClick={() => handleRemoveFile(index)}
                            >
                                <X />
                            </Button>
                        </div>
                    ))}
                    {filePreviews.length < 5 && !isUploadingFiles && (
                        <div className="mt-4">
                            <ImageUploader onImagesUpload={handleImagesUpload} />
                        </div>
                    )}

                    {filesData.length !== 0 && (
                        <div className="py-4 mx-auto">
                            <Button variant="default" onClick={submitImagesToApi} disabled={isSubmittingText || isUploadingFiles}>
                                {isUploadingFiles ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Adding recipe</>) : "Submit Images"}
                            </Button>
                        </div>
                    )}

                    {isUploadingFiles && (
                        <div className="text-2xl">
                            You will be redirected to the new recipe once adding is complete.
                        </div>
                    )}
                </TabsContent>
                <TabsContent value="from-text" className="flex flex-col mt-0">
                    <Textarea
                        id="recipeText"
                        className="text-xl mt-4"
                        placeholder="Copy and paste your recipe text here."
                        value={recipeText}
                        onChange={handleChangeRecipeText}
                        disabled={isSubmittingText || isUploadingFiles} />
                    {recipeText.trim().length > 0 && (
                        <div className="py-4 mx-auto">
                            <Button variant="default" onClick={submitTextToApi} disabled={isSubmittingText || isUploadingFiles}>
                                {isSubmittingText ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Adding recipe</>) : "Submit Text"}
                            </Button>
                        </div>)}
                    {isSubmittingText && (
                        <div className="text-2xl mt-8 text-center">
                            You will be redirected to the new recipe once adding is complete.
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
