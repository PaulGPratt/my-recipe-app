import { Quicksand } from 'next/font/google';
import React from "react";
import { Toaster } from "../components/ui/toaster";
import "../globals.css";
import { FirebaseProvider } from "../lib/firebase";

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
          {children}
        </FirebaseProvider>
        <Toaster />
      </body>
    </html>
  );
}
