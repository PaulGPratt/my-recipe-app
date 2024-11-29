import { redirect } from "next/navigation";
import { getDecodedTokenCookie } from "../lib/firebase-admin";
import SignupClient from "./signup.client";
import Link from "next/link";

export default async function SignupServer() {
    const cookie = await getDecodedTokenCookie();

    if (cookie) {
        return redirect("/");
    }

    return (
        <div className="h-full mx-auto max-w-xl">
            <div className="p-4 py-6 text-center text-4xl font-semibold">
                Sign up
            </div>
            <SignupClient />
            <div className="p-4 pt-0 text-xl">
                <Link href="/login">Already have an account?</Link>
            </div>
        </div>
    );
}
