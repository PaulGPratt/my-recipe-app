"use client";

import { TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useContext, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { storeProfile } from "../lib/profile-utils";
import getRequestClient from "../lib/get-request-client";
import { FirebaseContext } from "../lib/firebase";

interface CompleteProfileClientProps {
  userId: string;
}

export default function CompleteProfileClient({ userId }: CompleteProfileClientProps) {
  const router = useRouter();
  const { auth } = useContext(FirebaseContext);

  const [token, setToken] = useState<string | undefined>(undefined);
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState<string>("");
  const [duplicateCheckComplete, setDuplicateCheckComplete] = useState(false);

  const fetchToken = async () => {
    if (!token) {
      const newToken = await auth?.currentUser?.getIdToken();
      setToken(newToken);
      return newToken;
    }
    return token;
  };

  const handleUsernameInput = async (event: React.ChangeEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>) => {
    const usernameVal = event.target.value.toLowerCase();

    setUsername(usernameVal);
    setUsernameError("");
    setDuplicateCheckComplete(false);

    if (event.type === "blur") {
      const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
      if (!slugPattern.test(usernameVal)) {
        setUsernameError("Please use lowercase letters and numbers separated by hyphens.");
        return;
      }

      try {
        const token = await fetchToken();
        const client = getRequestClient(token);
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

  const saveProfile = async () => {
    try {
      const token = await fetchToken();
      const client = getRequestClient(token);
      const newProfile = await client.api.SaveProfile({
        id: userId,
        username,
      });
      storeProfile(newProfile);
      router.push(`/recipes/${newProfile.username}`);
    } catch (err) {
      console.error("Error saving profile:", err);
    }
  };

  return (
    <div className="h-full mx-auto max-w-4xl">
      <div className="p-4 py-6 text-center text-4xl font-semibold">Complete Profile</div>
      <div className="p-4 pt-0 flex gap-2">
        <div className="flex-grow">
          <Label htmlFor="username" className="text-2xl font-semibold">Username</Label>
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
              <TriangleAlert />
              <div className="text-xl">{usernameError}</div>
            </div>
          )}
        </div>
      </div>
      <div className="p-4 pt-0 flex gap-2">
        <Button
          onClick={saveProfile}
          disabled={username.length <= 0 || usernameError.length > 0 || !duplicateCheckComplete}
        >
          Complete
        </Button>
      </div>
    </div>
  );
}
