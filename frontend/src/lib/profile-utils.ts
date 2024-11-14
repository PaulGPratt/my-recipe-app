import { Auth } from "firebase/auth";
import { api } from "../client";
import getRequestClient from "./get-request-client";
import {
    getLocalStorage,
    removeLocalStorage,
    setLocalStorage,
} from "./localStorage";

const profile_key = "profile";

export async function fetchStoredProfile(auth: Auth): Promise<api.Profile | undefined> {
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

  return undefined;
}

export function storeProfile(profile: api.Profile): void {
  setLocalStorage(profile_key, profile);
}
