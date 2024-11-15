/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDropzone } from "react-dropzone";
import { z } from "zod";
import { Input } from "./ui/input";
import { ImagePlus } from "lucide-react";

interface ImageUploaderProps {
    onImagesUpload: (image: File[]) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImagesUpload: onImageUpload }) => {

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
            maxFiles: 5,
            maxSize: 10000000,
            multiple: true,
            accept: { "image/png": [], "image/jpg": [], "image/jpeg": [] },
        });

    return (

        <div className="mx-auto">
            <div
                {...getRootProps()}
                className="mx-auto flex cursor-pointer flex-col items-center justify-center gap-y-2 rounded-lg border border-secondary p-4"
            >
                <div className={"flex items-center"}>
                    <ImagePlus className="mr-2" />
                    {isDragActive ? (
                        <p className="text-xl font-semibold">Drop the image!</p>
                    ) : (
                        <p className="text-xl font-semibold">Add Image</p>
                    )}
                </div>

                <Input {...getInputProps()} accept="image/*;capture=camera" type="file" />

            </div>
            {fileRejections.length !== 0 && (
                <div className="text-xl pt-4">
                    Images must be less than 10MB and of type png, jpg, or jpeg
                </div>
            )}
        </div>
    );
};