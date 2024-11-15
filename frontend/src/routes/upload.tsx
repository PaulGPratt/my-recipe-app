import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
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
    const [recipeText, setRecipeText] = useState<string>("");
    const [uploadersCount, setUploadersCount] = useState<number>(1);

    const handleBack = () => {
        navigate(`/recipes/`);
    };

    const handleImageUpload = (file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64Content = reader.result?.toString().split(',')[1] || ''; // Safely extracts Base64
            const fileUpload = {
                filename: file.name,
                content: base64Content,
                mime_type: file.type,
            } as api.FileUpload;

            setFilesData((prevData) => [...prevData, fileUpload]);

            if (filesData.length + 1 < 5) {
                setUploadersCount((prevCount) => prevCount + 1);
            }
        };
        reader.readAsDataURL(file);
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
                <TabsContent value="from-images" className="mt-4 flex flex-col">
                    {[...Array(uploadersCount)].map((_, index) => (
                        <ImageUploader key={index} onImageUpload={handleImageUpload} />
                    ))}

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
                <TabsContent value="from-text" className="mt-4">
                    <Textarea
                        id="recipeText"
                        className="text-xl my-2"
                        placeholder="Insert your recipe text here."
                        value={recipeText}
                        onChange={handleChangeRecipeText}
                        disabled={isSubmittingText || isUploadingFiles} />
                    {recipeText.trim().length > 0 && (<div>
                        <Button variant="default" onClick={submitTextToApi} disabled={isSubmittingText || isUploadingFiles}>
                            {isSubmittingText ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Adding recipe</>) : "Submit Text"}
                        </Button>
                    </div>)}
                    {isSubmittingText && (
                        <div className="text-2xl">
                            You will be redirected to the new recipe once adding is complete.
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
