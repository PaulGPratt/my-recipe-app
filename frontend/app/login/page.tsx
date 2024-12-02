import { Metadata } from "next";
import LoginServer from "../../components/login.server";

export const metadata: Metadata = {
  title: 'Login',
}

function LoginPage() {
  return (
    <LoginServer />
  );
}

export default LoginPage;
