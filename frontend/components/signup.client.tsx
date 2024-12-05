"use client";

import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import Cookies from "js-cookie";
import { TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useContext, useRef, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { FirebaseContext } from "../lib/firebase";
import getRequestClient from "../lib/get-request-client";
import { storeProfile } from "../lib/profile-utils";
import { PasswordInput } from "./ui/password-input";

export default function SignupClient() {
    const { auth } = useContext(FirebaseContext);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [usernameError, setUsernameError] = useState<string>("");
    const [usernameVerified, setUsernameVerified] = useState(false);
    const [notice, setNotice] = useState("");
    const router = useRouter();

    const signupWithEmailAndPassword = async (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        e.preventDefault();


        try {
            if (!auth) {
                throw new Error("Firebase Auth is not initialized.");
            }

            await createUserWithEmailAndPassword(auth, email, password);
            await signInWithEmailAndPassword(auth, email, password);
            const user = auth.currentUser;
            if (user) {
                // Get Firebase token
                const token = await user.getIdToken();

                // Set the token in a secure cookie (using js-cookie)
                Cookies.set("firebaseToken", token, {
                    secure: true, // Use HTTPS
                    sameSite: "Strict", // Protect against CSRF
                    path: "/", // Available site-wide
                });

                const client = getRequestClient(token);
                const newProfile = await client.api.SaveProfile({
                    id: user.uid,
                    username,
                });

                storeProfile(newProfile);
                router.push(`/recipes/${newProfile.username}`);
            }

        } catch (error: any) {
            if (error.code === "auth/email-already-in-use") {
                setNotice("This email is already in use. Please use another email or log in with your existing account.");
            } else {
                setNotice("Sorry, something went wrong. Please try again.");
            }
            console.error("Signup error:", error);
        }
    };

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

        // Clear existing debounce timeout
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        debounceTimeout.current = setTimeout(async () => {
            try {
                const client = getRequestClient(undefined);
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

    return (
        <>
            {notice && (
                <div className="p-4 pt-0 flex gap-2 items-center">
                    <TriangleAlert size={28} />
                    <div className="text-xl">{notice}</div>
                </div>
            )}
            <div className="p-4 pt-0 flex gap-2">
                <div className="flex-grow">
                    <Label htmlFor="signupEmail" className="text-2xl font-semibold">
                        Email Address
                    </Label>
                    <Input
                        id="signupEmail"
                        type="email"
                        className="mt-2 h-12 text-2xl"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
            </div>
            <div className="p-4 pt-0 flex gap-2">
                <div className="flex-grow">
                    <Label htmlFor="signupPassword" className="text-2xl font-semibold">
                        Password
                    </Label>
                    <PasswordInput
                        id="signupPassword"
                        className="mt-2 h-12 text-2xl"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
            </div>
            <div className="p-4 pt-0 flex gap-2">
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
                        onBlur={handleUsernameInput}
                    />
                    {usernameError.length > 0 && (
                        <div className="flex gap-2 items-center pt-2">
                            <TriangleAlert size={28} />
                            <div className="text-xl">{usernameError}</div>
                        </div>
                    )}
                </div>
            </div>
            <div className="p-4 pt-0 flex gap-2">
                <Button
                    type="submit"
                    onClick={signupWithEmailAndPassword}
                    disabled={
                        email.length <= 0 ||
                        password.length <= 0 ||
                        username.length <= 0 ||
                        usernameError.length > 0 ||
                        !usernameVerified
                    }>
                    Sign up
                </Button>
            </div>
        </>
    );
}
