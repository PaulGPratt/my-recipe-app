"use client";

import { signInWithEmailAndPassword } from "firebase/auth";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import React, { useContext, useState } from "react";
import { FirebaseContext } from "../lib/firebase";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { PasswordInput } from "./ui/password-input";

interface LoginClientProps {
  redirectTo: string;
}

export default function LoginClient({ redirectTo }: LoginClientProps) {
  const { auth } = useContext(FirebaseContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState("");
  const router = useRouter();

  const loginWithUsernameAndPassword = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();

    try {
      if (!auth) {
        throw new Error("Firebase Auth is not initialized.");
      }

      // Sign in with email and password
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
      }

      // Redirect to the referrer page or a default page
      router.push(redirectTo);
    } catch (error) {
      console.error("Login error:", error);
      setNotice("You entered a wrong username or password.");
    }
  };

  return (
    <>
      {notice && (
        <div role="alert" className="px-4 pt-6 pb-0 text-2xl">
          {notice}
        </div>
      )}
      <div className="p-4 pt-0 flex gap-2">
        <div className="flex-grow">
          <Label htmlFor="email" className="text-2xl font-semibold">
            Email Address
          </Label>
          <div className="flex-grow">
            <Input
              type="email"
              className="mt-2 h-12 text-2xl"
              id="exampleInputEmail1"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="p-4 pt-0 flex gap-2">
        <div className="flex-grow">
          <Label htmlFor="inputPassword" className="text-2xl font-semibold">
            Password
          </Label>
          <div className="flex-grow">
            <PasswordInput
              className="mt-2 h-12 text-2xl"
              id="inputPassword"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="p-4 pt-0">
        <Button type="submit" onClick={loginWithUsernameAndPassword}>
          Log in
        </Button>
      </div>
    </>
  );
}
