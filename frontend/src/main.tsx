import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import Recipe from "./routes/recipe";
import Recipes from "./routes/recipes";
import "./index.css";
import { Toaster } from "./components/ui/toaster";
import { ThemeProvider } from "./components/theme-provider";
import Plan from "./routes/plan";
import Upload from "./routes/upload";
import EditRecipe from "./routes/edit-recipe";
import { FirebaseProvider } from "./lib/firebase";
import Login from "./routes/login";
import Signup from "./routes/signup";
import Profile from "./routes/profile";
import MyProfile from "./routes/my-profile";

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
    element: <Recipes />,
  },
  {
    path: "/recipes/:slug",
    element: <Recipe />
  },
  {
    path: "/recipes/:slug/edit",
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
    path: "/profile",
    element: <MyProfile />,
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
