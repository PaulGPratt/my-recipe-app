import { Auth } from "firebase/auth";
import getRequestClient from "./get-request-client";
import {
  getLocalStorage,
  removeLocalStorage,
  setLocalStorage,
} from "./localStorage";
import { cookies } from "next/headers";
import { api } from "./client";
import { verifyIdToken } from "./firebase-admin";

const profile_key = "profile";

export async function fetchStoredProfile(auth: Auth): Promise<api.Profile> {
  const cachedProfile = getLocalStorage(profile_key) as api.Profile;
  if (cachedProfile && cachedProfile.id === auth.currentUser?.uid) {
    return cachedProfile;
  }

  removeLocalStorage(profile_key);

  try {
    const token = await auth?.currentUser?.getIdToken();
    const client = getRequestClient(token ?? undefined);
    const freshProfile = await client.api.GetMyProfile();
    if (freshProfile) {
      setLocalStorage(profile_key, freshProfile);
      return freshProfile;
    }
  } catch (err) {
    console.log(err);
  }

  return {
    id: auth.currentUser?.uid,
    username: "",
  } as api.Profile;
}

export function storeProfile(profile: api.Profile): void {
  setLocalStorage(profile_key, profile);
}

export function removeStoredProfile(): void {
  removeLocalStorage(profile_key);
}

export async function getDecodedTokenCookie() {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("firebaseToken");

  if (!tokenCookie?.value) {
    return undefined;
  }
  return await verifyIdToken(tokenCookie.value);
}
