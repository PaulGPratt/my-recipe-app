import { Metadata } from "next";
import CompleteProfileServer from "../../components/complete-profile.server";

export const metadata: Metadata = {
  title: 'Complete Profile',
}

export default async function CompleteProfilePage() {
  return <CompleteProfileServer />;
}
