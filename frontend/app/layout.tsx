import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { Quicksand } from 'next/font/google';
import React from "react";
import { extractRouterConfig } from "uploadthing/server";
import { Toaster } from "../components/ui/toaster";
import "../globals.css";
import { FirebaseProvider } from "../lib/firebase";
import { ourFileRouter } from './api/uploadthing/core';

const quicksand = Quicksand({
  weight: ['400', '600'],
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head />
      <body className={quicksand.className}>
        <FirebaseProvider>
          <NextSSRPlugin
            /**
             * The `extractRouterConfig` will extract **only** the route configs
             * from the router to prevent additional information from being
             * leaked to the client. The data passed to the client is the same
             * as if you were to fetch `/api/uploadthing` directly.
             */
            routerConfig={extractRouterConfig(ourFileRouter)}
          />
          {children}
        </FirebaseProvider>
        <Toaster />
      </body>
    </html>
  );
}
