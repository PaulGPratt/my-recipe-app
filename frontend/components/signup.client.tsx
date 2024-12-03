"use client";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import React, { useContext, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { FirebaseContext } from "../lib/firebase";

export default function SignupClient() {
  const { auth } = useContext(FirebaseContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notice, setNotice] = useState("");
  const router = useRouter();

  const signupWithEmailAndPassword = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();

    if (password === confirmPassword) {
      try {
        // Sign up using Firebase Authentication
        await createUserWithEmailAndPassword(auth!, email, password);

        // Redirect to the homepage after successful signup
        router.push("/");
      } catch (error) {
        console.error("Signup error:", error);
        setNotice("Sorry, something went wrong. Please try again.");
      }
    } else {
      setNotice("Passwords don't match. Please try again.");
    }
  };

  return (
    <>
      {notice && <div role="alert">{notice}</div>}
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
          <Input
            id="signupPassword"
            type="password"
            className="mt-2 h-12 text-2xl"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>
      <div className="p-4 pt-0 flex gap-2">
        <div className="flex-grow">
          <Label htmlFor="confirmPassword" className="text-2xl font-semibold">
            Confirm Password
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            className="mt-2 h-12 text-2xl"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
      </div>
      <div className="p-4 pt-0 flex gap-2">
        <Button type="submit" onClick={signupWithEmailAndPassword}>
          Sign up
        </Button>
      </div>
    </>
  );
}
