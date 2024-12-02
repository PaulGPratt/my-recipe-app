import admin from "firebase-admin";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "{}"
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const verifyIdToken = async (token: string) => {
  try {
    return await admin.auth().verifyIdToken(token);
  } catch (error) {
    console.log("Error verifying Firebase ID token:", error);
    throw new Error("Unauthorized");
  }
};

export async function getDecodedTokenCookie() {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("firebaseToken");

  if (!tokenCookie?.value) {
    return undefined;
  }

  try {
    const decodedToken = await verifyIdToken(tokenCookie.value);

    if (!decodedToken) {
      console.log("NO TOKEN");
      await fetch('/logout', { method: 'DELETE' });
      redirect("/");
    }
    return decodedToken;
  } catch (error) {
    console.log("TOKEN ERROR");
    await fetch('/logout', { method: 'DELETE' });
    redirect("/");
  }
}