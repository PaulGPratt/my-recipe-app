import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import getRequestClient from "../../lib/get-request-client";
import CompleteProfileClient from "../../components/complete-profile.client";

export const metadata: Metadata = {
  title: 'Complete Profile',
};

export default async function CompleteProfilePage() {
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

  if (profile?.username?.length > 0) {
    redirect(`/recipes/${profile.username}`);
  }

  if (!profile?.id) {
    redirect("/login");
  }

  return <CompleteProfileClient userId={profile.id} />;
}
