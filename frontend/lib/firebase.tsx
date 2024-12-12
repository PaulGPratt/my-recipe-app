"use client";

import { initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import React, { FC, PropsWithChildren, useEffect, useState } from "react";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const appAuth = getAuth(app);
const setTokenUrl = new URL('/api/setTokenCookie', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');

interface FirebaseContextState {
  auth: Auth | undefined;
  isLoading: boolean;
}

export const FirebaseContext = React.createContext<FirebaseContextState>(
  {} as FirebaseContextState,
);

export const FirebaseProvider: FC<PropsWithChildren> = ({ children }) => {
  const [auth, setAuth] = useState<Auth>();
  const [isLoading, setIsLoading] = useState(true);

  // Manage loading state with onAuthStateChanged
  useEffect(() => {
    const unsubscribe = appAuth.onAuthStateChanged(() => {
      setAuth(appAuth);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Refresh token and set cookie
  useEffect(() => {
    const unsubscribe = appAuth.onIdTokenChanged(async (user) => {
      try {
        if (user) {
          const token = await user.getIdToken(true); // Force refresh
          await fetch(setTokenUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          });
        } else {
          // Important: Clear the token cookie when user logs out
          await fetch(setTokenUrl, {
            method: "DELETE",
          });
        }
      } catch (error) {
        console.error("Error refreshing token or setting cookie:", error);
        // Optionally handle logout or re-authentication
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Periodic token refresh (every 55 minutes)
    const tokenRefreshInterval = setInterval(async () => {
      const user = appAuth.currentUser;
      if (user) {
        try {
          const token = await user.getIdToken(true);
          await fetch(setTokenUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          });
        } catch (error) {
          console.error("Periodic token refresh failed:", error);
        }
      }
    }, 55 * 60 * 1000); // 55 minutes
  
    return () => clearInterval(tokenRefreshInterval);
  }, []);

  return (
    <FirebaseContext.Provider value={{ auth, isLoading }}>
      {children}
    </FirebaseContext.Provider>
  );
};
