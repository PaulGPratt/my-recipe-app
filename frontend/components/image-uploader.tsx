/* eslint-disable @next/next/no-img-element */
"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus } from "lucide-react";
import React from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "./ui/input";

interface ImageUploaderProps {
    onImagesUpload: (image: File[]) => void;
    maxFiles?: number;
    buttonText?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImagesUpload: onImageUpload, maxFiles = 5, buttonText = "Add Image" }) => {

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
                reader.readAsDataURL(acceptedFiles[0]);
                form.setValue("image", acceptedFiles[0]);
                form.clearErrors("image");
                onImageUpload(acceptedFiles);
            } catch (error) {
                form.resetField("image");
            }
        },
        [form],
    );

    const { getRootProps, getInputProps, isDragActive, fileRejections } =
        useDropzone({
            onDrop,
            maxFiles: maxFiles,
            maxSize: 10000000,
            multiple: true,
            accept: { "image/png": [], "image/jpg": [], "image/jpeg": [], "image/webp": []  },
        });

    return (

        <>
            <div
                {...getRootProps()}
                className="flex cursor-pointer min-h-12 px-4 rounded-lg border border-secondary bg-secondary shadow-sm hover:bg-secondary/80 "
            >
                <div className={"flex items-center"}>
                    <ImagePlus className="mr-2" />
                    {isDragActive ? (
                        <p className="text-2xl font-semibold">Drop the image!</p>
                    ) : (
                        <p className="text-2xl font-semibold">{buttonText}</p>
                    )}
                </div>

                <Input {...getInputProps()} accept="image/*;capture=camera" type="file" />

            </div>
            {fileRejections.length !== 0 && (
                <div className="text-xl pt-4">
                    Images must be less than 10MB and of type png, jpg, or jpeg
                </div>
            )}
        </>
    );
};