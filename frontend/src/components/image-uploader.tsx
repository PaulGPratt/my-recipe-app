/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDropzone } from "react-dropzone";
import { z } from "zod";
import { Input } from "./ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "./ui/form";
import { ImagePlus } from "lucide-react";

interface ImageUploaderProps {
    onImageUpload: (image: File) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
    const [preview, setPreview] = React.useState<string | ArrayBuffer | null>("");

    const formSchema = z.object({
        image: z
            //Rest of validations done via react dropzone
            .instanceof(File)
            .refine((file) => file.size !== 0, "Please upload an image"),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        mode: "onBlur",
        defaultValues: {
            image: new File([""], "filename"),
        },
    });

    const onDrop = React.useCallback(
        (acceptedFiles: File[]) => {
            const reader = new FileReader();
            try {
                reader.onload = () => setPreview(reader.result);
                reader.readAsDataURL(acceptedFiles[0]);
                form.setValue("image", acceptedFiles[0]);
                form.clearErrors("image");
                onImageUpload(acceptedFiles[0]);
            } catch (error) {
                setPreview(null);
                form.resetField("image");
            }
        },
        [form],
    );

    const { getRootProps, getInputProps, isDragActive, fileRejections } =
        useDropzone({
            onDrop,
            maxFiles: 1,
            maxSize: 10000000,
            multiple: false
        });

    return (
        <Form {...form}>
            <form className="space-y-4">
                <FormField
                    control={form.control}
                    name="image"
                    render={() => (
                        <FormItem className="mx-auto">
                            <FormLabel
                                className={`${fileRejections.length !== 0 && "text-destructive"
                                    }`}
                            >
                                <h2 className="text-xl font-semibold tracking-tight">
                                    <span
                                        className={
                                            form.formState.errors.image || fileRejections.length !== 0
                                                ? "text-destructive"
                                                : "text-muted-foreground"
                                        }
                                    ></span>
                                </h2>
                            </FormLabel>
                            <FormControl>
                                <div
                                    {...getRootProps()}
                                    className="mx-auto flex cursor-pointer flex-col items-center justify-center gap-y-2 rounded-lg border border-secondary p-4"
                                >
                                    {preview && (
                                        <img
                                            src={preview as string}
                                            alt="Uploaded image"
                                            className="max-h-[400px] rounded-lg"
                                        />
                                    )}
                                    <div className={`${preview ? "hidden" : "flex items-center"}`}>
                                        <ImagePlus className="mr-2" />
                                        {isDragActive ? (
                                            <p className="text-xl font-semibold">Drop the image!</p>
                                        ) : (
                                            <p className="text-xl font-semibold">Add Image</p>
                                        )}
                                    </div>

                                    <Input {...getInputProps()} accept="image/*;capture=camera" type="file" />

                                </div>
                            </FormControl>
                            <FormMessage>
                                {fileRejections.length !== 0 && (
                                    <p>
                                        Image must be less than 10MB and of type png, jpg, or jpeg
                                    </p>
                                )}
                            </FormMessage>
                        </FormItem>
                    )}
                />
            </form>
        </Form>
    );
};