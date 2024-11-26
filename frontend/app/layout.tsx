import { Quicksand } from 'next/font/google';
import React from "react";
import { ThemeProvider } from "../components/theme-provider";
import { Toaster } from "../components/ui/toaster";
import "../globals.css";
import { FirebaseProvider } from "../lib/firebase";

const quicksand = Quicksand({
  weight: ['400', '600'],
  subsets: ['latin'],
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head />
      <body className={quicksand.className}>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <FirebaseProvider>
            {children}
          </FirebaseProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}