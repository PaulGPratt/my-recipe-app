import { Metadata } from "next";
import Link from "next/link";
import LoginClient from "../../components/login.client";

export const metadata: Metadata = {
  title: 'Log in',
};

interface LoginPageProps {
  searchParams: { [key: string]: string | undefined };
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  const redirectTo = searchParams.redirect || "/";

  return (
    <div className="h-full mx-auto max-w-xl">
      <form>
        <div className="p-4 py-6 text-center text-4xl font-semibold">
          Log in
        </div>
        <LoginClient redirectTo={redirectTo} />
        <div className="p-4 pt-0 text-xl">
          <Link href="/signup">Sign up for an account</Link>
        </div>
      </form>
    </div>
  );
}
