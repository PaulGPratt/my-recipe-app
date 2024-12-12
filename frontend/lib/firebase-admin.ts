import admin from "firebase-admin";
import { cookies } from "next/headers";

const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "{}"
);

const logoutUrl = new URL('/logout', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');

// Ensure app is only initialized once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const verifyIdToken = async (token: string) => {
  try {
    return await admin.auth().verifyIdToken(token);
  } catch (error: any) {
    // More comprehensive error handling
    if (
      error.code === 'auth/id-token-expired' || 
      error.code === 'auth/argument-error' || 
      error.code === 'auth/invalid-argument'
    ) {
      console.log("Token verification failed:", error.code);
      return null;
    }
    console.error("Unexpected error verifying Firebase ID token:", error);
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
    // Attempt to verify and refresh the token if needed
    const decodedToken = await verifyIdToken(tokenCookie.value);

    if (!decodedToken) {
      // Invalid or unverified token, trigger logout
      await fetch(logoutUrl, { method: "DELETE" });
      return undefined;
    }

    return decodedToken;
  } catch (error) {
    console.error("Error handling token cookie:", error);

    // Clear the cookie on error
    await fetch(logoutUrl, { method: "DELETE" });
    return undefined;
  }
}