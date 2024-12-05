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
  const loginRedirect = `/login?redirect=${encodeURIComponent("/profile")}`;

  if (!firebaseToken) {
    redirect(loginRedirect);
  }

  let profile = null;

  try {
    const client = getRequestClient(firebaseToken.value);
    profile = await client.api.GetMyProfile();
  } catch (err) {
    console.error("Error verifying token or fetching profile:", err);
    redirect(loginRedirect);
  }

  if (!profile?.id) {
    redirect(loginRedirect);
  }

  return (
    <ProfileClient profile={profile} />
  )
}
