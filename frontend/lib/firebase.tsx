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
const setTokenUrl = new URL('/api/setTokenCookie', process.env.BASE_URL || 'http://localhost:3000');

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
      console.log("Id token changed");
      try {
        if (user) {
          const token = await user.getIdToken(true); // Force refresh
          await fetch(setTokenUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          });
        }
      } catch (error) {
        console.error("Error refreshing token or setting cookie:", error);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <FirebaseContext.Provider value={{ auth, isLoading }}>
      {children}
    </FirebaseContext.Provider>
  );
};
