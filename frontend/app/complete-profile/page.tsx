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

  try {
    const client = getRequestClient(firebaseToken.value);
    const profile = await client.api.GetMyProfile();

    // Redirect if the user already has a profile with a username
    if (profile?.username?.length > 0) {
      redirect(`/recipes/${profile.username}`);
    }

    // Pass the user ID to the client component
    return <CompleteProfileClient userId={profile.id} />;
  } catch (err) {
    console.error("Error verifying token or fetching profile:", err);
    redirect("/login");
  }
}
