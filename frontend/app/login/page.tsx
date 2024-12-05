import { Metadata } from "next";
import Link from "next/link";
import LoginClient from "../../components/login.client";

export const metadata: Metadata = {
  title: 'Log in',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const redirectTo  = (await searchParams).redirect as string || "/";

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
