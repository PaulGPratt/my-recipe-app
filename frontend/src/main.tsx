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

const router = createBrowserRouter([
  {
    path: "/my-recipe-app",
    element: <Navigate to="/my-recipe-app/recipes" replace />,
  },
  {
    path: "/my-recipe-app/plan",
    element: <Plan />,
  },
  {
    path: "/my-recipe-app/recipes",
    element: <Recipes />,
  },
  {
    path: "/my-recipe-app/recipes/:id",
    element: <Recipe />
  },
  {
    path: "/my-recipe-app/recipes/:id/edit",
    element: <EditRecipe />
  },
  {
    path: "/my-recipe-app/upload",
    element: <Upload />,
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
