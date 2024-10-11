import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import Recipes from "./components/recipes";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/my-recipe-app",
    element: <Navigate to="/my-recipe-app/recipes" replace />,
  },
  {
    path: "/my-recipe-app/recipes",
    element: <Recipes/>,
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
