import admin from "firebase-admin";
import { cookies } from "next/headers";

const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "{}"
);

const logoutUrl = new URL('/logout', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');

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
      await fetch(logoutUrl, { method: 'DELETE' });
      return undefined;
    }
    return decodedToken;
  } catch (error) {
    console.log("TOKEN ERROR");
    await fetch(logoutUrl, { method: 'DELETE' });
    return undefined;
  }
}