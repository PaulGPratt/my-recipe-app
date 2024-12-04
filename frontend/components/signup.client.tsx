"use client";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import React, { useContext, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { FirebaseContext } from "../lib/firebase";
import getRequestClient from "../lib/get-request-client";
import { TriangleAlert } from "lucide-react";
import { storeProfile } from "../lib/profile-utils";

export default function SignupClient() {
  const { auth } = useContext(FirebaseContext);

  const [token, setToken] = useState<string | undefined>(undefined);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState<string>("");
  const [duplicateCheckComplete, setDuplicateCheckComplete] = useState(false);
  const [notice, setNotice] = useState("");
  const router = useRouter();

  const fetchToken = async () => {
    if (!token) {
      const newToken = await auth?.currentUser?.getIdToken();
      setToken(newToken);
      return newToken;
    }
    return token;
  };

  const signupWithEmailAndPassword = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();


    try {
      // Sign up using Firebase Authentication
      const signupResult = await createUserWithEmailAndPassword(auth!, email, password);
      const token = await fetchToken();
      const client = getRequestClient(token);
      const newProfile = await client.api.SaveProfile({
        id: signupResult.user.uid,
        username,
      });

      storeProfile(newProfile);
      router.push(`/recipes/${newProfile.username}`);

    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        setNotice("This email is already in use. Please use another email or log in with your existing account.");
      } else {
        setNotice("Sorry, something went wrong. Please try again.");
      }
      console.error("Signup error:", error);
    }
  };

  const handleUsernameInput = async (event: React.ChangeEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>) => {
    const usernameVal = event.target.value.toLowerCase();

    setUsername(usernameVal);
    setUsernameError("");

    if (event.type === "blur") {
      setDuplicateCheckComplete(false);
      const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
      if (!slugPattern.test(usernameVal)) {
        setUsernameError("Please use lowercase letters and numbers separated by hyphens.");
        return;
      }

      try {
        const client = getRequestClient(undefined);
        const { available } = await client.api.CheckIfUsernameIsAvailable({ username: usernameVal });
        if (available) {
          setDuplicateCheckComplete(true);
        } else {
          setUsernameError(`${usernameVal} is already in use`);
        }
      } catch (err) {
        console.error("Error checking username availability:", err);
      }
    }
  };

  return (
    <>
      {notice && (
        <div className="p-4 pt-0 flex gap-4 items-center">
        <TriangleAlert size={30}/>
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
            <div className="flex gap-4 items-center pt-2">
              <TriangleAlert size={30}/>
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
            !duplicateCheckComplete
          }>
          Sign up
        </Button>
      </div>
    </>
  );
}
