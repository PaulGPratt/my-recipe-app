import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ProfileClient from "../../components/profile.client";
import getRequestClient from "../../lib/get-request-client";

export const metadata: Metadata = {
  title: 'My Profile',
};

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const firebaseToken = cookieStore.get("firebaseToken");

  if (!firebaseToken) {
    redirect("/login");
  }

  let profile = null;

  try {
    const client = getRequestClient(firebaseToken.value);
    profile = await client.api.GetMyProfile();
  } catch (err) {
    console.error("Error verifying token or fetching profile:", err);
    redirect("/login");
  }

  if (!profile?.id) {
    redirect("/login");
  }

  return (
    <ProfileClient profile={profile} />
  )
}
