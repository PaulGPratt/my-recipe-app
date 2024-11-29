import { redirect } from "next/navigation";
import { getDecodedTokenCookie } from "../lib/firebase-admin";
import SignupClient from "./signup.client";

export default async function SignupServer() {
    try {
        await getDecodedTokenCookie();
    } catch {
        redirect("/");
    }


    // Render the Signup client component
    return <SignupClient />;
}
