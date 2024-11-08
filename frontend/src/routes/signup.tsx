import React, { useContext, useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { FirebaseContext } from "../lib/firebase.tsx";
import { Label } from "../components/ui/label.tsx";
import { Input } from "../components/ui/input.tsx";
import { Button } from "../components/ui/button.tsx";

function Signup () {
  const { auth } = useContext(FirebaseContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notice, setNotice] = useState("");

  const signupWithUsernameAndPassword = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.preventDefault();

    if (password === confirmPassword) {
      try {
        await createUserWithEmailAndPassword(auth!, email, password);
        navigate("/");
      } catch {
        setNotice("Sorry, something went wrong. Please try again.");
      }
    } else {
      setNotice("Passwords don't match. Please try again.");
    }
  };

  return (
    <div className="h-full mx-auto max-w-4xl ">
      <form className="loginForm">
        {notice && <div role="alert">{notice}</div>}
        <div className="p-4 py-6 text-center text-4xl font-semibold">
          Sign up
        </div>
        <div className="p-4 pt-0 flex gap-2">
          <div className="flex-grow">
            <Label htmlFor="signupEmail" className="text-2xl font-semibold">Email Address</Label>
            <Input
              id="signupEmail"
              type="email"
              className="mt-2 h-12 text-2xl"
              aria-describedby="emailHelp"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <div className="p-4 pt-0 flex gap-2">
          <div className="flex-grow">
            <Label htmlFor="signupPassword" className="text-2xl font-semibold">Password</Label>
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
            <Label htmlFor="confirmPassword" className="text-2xl font-semibold">Confirm Password</Label>
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
          <Button
            type="submit"
            onClick={(e) => signupWithUsernameAndPassword(e)}
          >
            Sign up
          </Button>
        </div>
        <div className="p-4 pt-0 text-xl">
          <Link to="/login">Already have an account?</Link>
        </div>
      </form>
    </div>
  );
};

export default Signup;