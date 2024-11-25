import { Input } from ".../../components/ui/input.tsx";
import { signInWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import React, { useContext, useState } from "react";
import { Button } from "../../components/ui/button.tsx";
import { Label } from "../../components/ui/label.tsx";
import { FirebaseContext } from "../../lib/firebase.tsx";

function Login () {
  const { auth } = useContext(FirebaseContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState("");

  const loginWithUsernameAndPassword = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.preventDefault();

    try {
      await signInWithEmailAndPassword(auth!, email, password);
      redirect("/");
    } catch {
      setNotice("You entered a wrong username or password.");
    }
  };

  return (
    <div className="h-full mx-auto max-w-xl">
      <form>
        {notice && <div role="alert" className="px-4 pt-6 pb-0  text-2xl">{notice}</div>}
        <div className="p-4 py-6 text-center text-4xl font-semibold">
          Log in
        </div>
        <div className="p-4 pt-0 flex gap-2">
          <div className="flex-grow">
            <Label htmlFor="email" className="text-2xl font-semibold">Email Address</Label>
            <div className="flex-grow">
              <Input
                type="email"
                className="mt-2 h-12 text-2xl"
                id="exampleInputEmail1"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              ></Input>
            </div>
          </div>
        </div>

        <div className="p-4 pt-0 flex gap-2">
          <div className="flex-grow">
            <Label htmlFor="inputPassword" className="text-2xl font-semibold">Password</Label>
            <div className="flex-grow">
              <Input
                type="password"
                className="mt-2 h-12 text-2xl"
                id="inputPassword"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              ></Input>
            </div>
          </div>
        </div>

        <div className="p-4 pt-0">
          <Button type="submit" onClick={loginWithUsernameAndPassword}>
            Log in
          </Button>
        </div>
        <div className="p-4 pt-0 text-xl">
          <Link href="/signup">Sign up for an account</Link>
        </div>
      </form>
    </div>
  );
};

export default Login;