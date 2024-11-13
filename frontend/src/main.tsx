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
import Plan from "./routes/plan";
import Profile from "./routes/profile";
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
    path: "/plan",
    element: <Plan />,
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
  {
    path: "/profile/:id",
    element: <Profile />,
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
