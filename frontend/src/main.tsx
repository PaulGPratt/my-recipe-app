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

const router = createBrowserRouter([
  {
    path: "/my-recipe-app",
    element: <Navigate to="/my-recipe-app/recipes" replace />,
  },
  {
    path: "/my-recipe-app/recipes",
    element: <Recipes/>,
  },
  {
    path: "/my-recipe-app/recipes/:id",
    element: <Recipe/>
  }
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
    <Toaster />
  </React.StrictMode>
);
