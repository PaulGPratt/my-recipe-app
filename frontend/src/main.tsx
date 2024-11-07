import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  redirect,
} from "react-router-dom";
import Recipe from "./routes/recipe";
import Recipes from "./routes/recipes";
import "./index.css";
import { Toaster } from "./components/ui/toaster";
import { ThemeProvider } from "./components/theme-provider";
import Plan from "./routes/plan";
import Upload from "./routes/upload";
import EditRecipe from "./routes/edit-recipe";
import { Auth0Provider } from "./lib/auth";

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
    // Login route
    path: "login",
    loader: async ({ request }) => {
      const url = new URL(request.url);
      const searchParams = new URLSearchParams(url.search);
      const returnToURL = searchParams.get("returnTo") ?? "/";

      if (Auth0Provider.isAuthenticated()) return redirect(returnToURL);

      try {
        const returnURL = await Auth0Provider.login(returnToURL);
        return redirect(returnURL);
      } catch (error) {
        throw new Error("Login failed");
      }
    },
  },
  {
    // Callback route, redirected to from Auth0 after login
    path: "callback",
    loader: async ({ request }) => {
      const url = new URL(request.url);
      const searchParams = new URLSearchParams(url.search);
      const state = searchParams.get("state");
      const code = searchParams.get("code");

      if (!state || !code) throw new Error("Login failed");

      try {
        const redirectURL = await Auth0Provider.validate(state, code);
        return redirect(redirectURL);
      } catch (error) {
        throw new Error("Login failed");
      }
    },
  },
  {
    // Logout route
    path: "logout",
    loader: async () => {
      try {
        const redirectURL = await Auth0Provider.logout();
        return redirect(redirectURL);
      } catch (error) {
        throw new Error("Logout failed");
      }
    },
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  </React.StrictMode>
);
