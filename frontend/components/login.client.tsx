"use client";

import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { FirebaseContext } from "../lib/firebase";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export default function LoginClient() {
  const { auth } = useContext(FirebaseContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState("");
  const router = useRouter();

  const loginWithUsernameAndPassword = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.preventDefault();

    try {
      await signInWithEmailAndPassword(auth!, email, password);
      router.push("/");
    } catch {
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
            <Input
              type="password"
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
