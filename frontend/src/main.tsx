import React from "react";
import ReactDOM from "react-dom/client";
import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "./components/ui/toaster";
import "./index.css";
import { FirebaseProvider } from "./lib/firebase";
import AllRecipes from "./routes/all-recipes";
import CompleteProfile from "./routes/complete-profile";
import EditRecipe from "./routes/edit-recipe";
import Login from "./routes/login";
import Recipe from "./routes/recipe";
import Signup from "./routes/signup";
import Upload from "./routes/upload";
import UserRecipes from "./routes/user-recipes";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/recipes" replace />,
  },
  {
    path: "/recipes",
    element: <AllRecipes />,
  },
  {
    path: "/recipes/:username",
    element: <UserRecipes />,
  },
  {
    path: "/recipes/:username/:slug",
    element: <Recipe />
  },
  {
    path: "/recipes/:username/:slug/edit",
    element: <EditRecipe />
  },
  {
    path: "/upload",
    element: <Upload />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/complete-profile",
    element: <CompleteProfile />,
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <FirebaseProvider>
        <RouterProvider router={router} />
      </FirebaseProvider>
      <Toaster />
    </ThemeProvider>
  </React.StrictMode>
);
