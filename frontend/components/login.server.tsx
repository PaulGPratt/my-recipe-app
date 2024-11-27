import Link from "next/link";
import LoginClient from "./login.client";

export default function LoginServer() {
  return (
    <div className="h-full mx-auto max-w-xl">
      <form>
        <div className="p-4 py-6 text-center text-4xl font-semibold">
          Log in
        </div>
        <LoginClient />
        <div className="p-4 pt-0 text-xl">
          <Link href="/signup">Sign up for an account</Link>
        </div>
      </form>
    </div>
  );
}
