"use client";

import { ArrowLeft, TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useContext, useRef, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { api } from "../lib/client";
import { FirebaseContext } from "../lib/firebase";
import getRequestClient from "../lib/get-request-client";
import { storeProfile } from "../lib/profile-utils";
import { Separator } from "./ui/separator";

interface CompleteProfileClientProps {
    profile: api.Profile
}

export default function ProfileClient({ profile }: CompleteProfileClientProps) {
    const router = useRouter();
    const { auth } = useContext(FirebaseContext);

    const [token, setToken] = useState<string | undefined>(undefined);
    const [username, setUsername] = useState(profile.username);
    const [usernameError, setUsernameError] = useState<string>("");
    const [usernameVerified, setUsernameVerified] = useState(false);

    const fetchToken = async () => {
        if (!token) {
            const newToken = await auth?.currentUser?.getIdToken();
            setToken(newToken);
            return newToken;
        }
        return token;
    };

    const handleBack = async () => {
        router.push(`/recipes/${profile.username}`);
    }

    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

    const handleUsernameInput = async (event: React.ChangeEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>) => {
        const usernameVal = event.target.value.trim();
        setUsername(usernameVal);
        setUsernameError("");

        if (!usernameVal) {
            setUsernameError("Username cannot be empty.");
            setUsernameVerified(false);
            return;
        }

        const slugPattern = /^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*$/;
        if (!slugPattern.test(usernameVal)) {
            setUsernameVerified(false);
            setUsernameError("Please use letters and numbers (separated by hyphens if needed).");
            return;
        }

        // Allow case changes of current username
        if (usernameVal.toLowerCase() === profile.username.toLowerCase()) {
            setUsernameVerified(true);
            return;
        }

        // Clear existing debounce timeout
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        debounceTimeout.current = setTimeout(async () => {
            try {
                setUsernameVerified(false);
                const token = await fetchToken();
                const client = getRequestClient(token);
                const { available } = await client.api.CheckIfUsernameIsAvailable({ username: usernameVal });

                if (available) {
                    setUsernameVerified(true);
                } else {
                    setUsernameVerified(false);
                    setUsernameError(`Username is already in use.`);
                }
            } catch (err) {
                setUsernameVerified(false);
                console.error("Error checking username availability:", err);
                setUsernameError("Could not verify username availability. Please try again later.");
            }
        }, 300);
    };

    const saveProfile = async () => {
        try {
            const token = await fetchToken();
            const client = getRequestClient(token);
            const newProfile = await client.api.SaveProfile({
                id: profile.id,
                username,
            });
            storeProfile(newProfile);
            router.push(`/recipes/${newProfile.username}`);
        } catch (err) {
            console.error("Error saving profile:", err);
        }
    };

    return (
        <div className="h-screen mx-auto max-w-4xl flex flex-col">

            <div className="flex p-4 justify-between">
                <div className="flex gap-4 items-center">
                    <Button size="icon" variant="ghost" onClick={handleBack} role="link" title="Back to Recipes"><ArrowLeft size={30} /></Button>
                    <div className="text-2xl font-semibold">My Profile</div>
                </div>
                <div className="flex gap-2">
                    <Button size="header" variant="secondary" disabled={username.length <= 0 || usernameError.length > 0 || !usernameVerified} onClick={saveProfile}>Save Changes</Button>
                </div>
            </div>
            <Separator />
            <div className="p-4 flex gap-2">
                <div className="flex-grow">
                    <Label htmlFor="username" className="text-2xl font-semibold">Username</Label>
                    <div className="text-xl text-muted-foreground">
                        Your recipes will be found at /recipes/my-username.
                    </div>
                    <Input
                        id="username"
                        type="text"
                        className="mt-2 h-12 text-2xl"
                        placeholder="ex. my-username"
                        value={username}
                        onChange={handleUsernameInput}
                    />
                    {usernameError.length > 0 && (
                        <div className="flex gap-4 items-center pt-2">
                            <TriangleAlert />
                            <div className="text-xl">{usernameError}</div>
                        </div>
                    )}
                </div>
            </div>
        </div >
    )
}
