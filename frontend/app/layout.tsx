import React from "react";
import { ThemeProvider } from "../components/theme-provider";
import { Toaster } from "../components/ui/toaster";
import { FirebaseProvider } from "../lib/firebase";
import "../index.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head />
      <body>
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