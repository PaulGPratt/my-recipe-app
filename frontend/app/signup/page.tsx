import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import SignupClient from "../../components/signup.client";
import { getDecodedTokenCookie } from "../../lib/firebase-admin";

export const metadata: Metadata = {
  title: 'Sign up',
};

export default async function SignupPage() {
  const cookie = await getDecodedTokenCookie();

  if (cookie) {
    redirect("/recipes");
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
