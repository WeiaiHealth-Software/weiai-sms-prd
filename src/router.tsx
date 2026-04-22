
import { createHashRouter, Navigate } from "react-router";
import { MainLayout } from "./layouts/MainLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import Personnel from "./pages/store/Personnel";
import Room from "./pages/store/Room";
import Schedule from "./pages/store/Schedule";
import { GenericPlaceholder } from "./pages/generic/GenericPlaceholder";
import { menuConfig } from "./config/menu";

// Create dynamic routes based on menuConfig for generic pages
const genericRoutes = menuConfig.flatMap((item) =>
  item.subs
    .filter(
      (sub) =>
        ![
          "/store/personnel",
          "/store/room",
          "/store/schedule",
        ].includes(sub.path)
    )
    .map((sub) => ({
      path: sub.path.replace(/^\//, ""),
      element: <GenericPlaceholder />,
    }))
);

export const router = createHashRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "store",
        children: [
          {
            index: true,
            element: <Navigate to="/store/personnel" replace />,
          },
          {
            path: "personnel",
            element: <Personnel />,
          },
          {
            path: "room",
            element: <Room />,
          },
          {
            path: "schedule",
            element: <Schedule />,
          },
        ],
      },
      ...genericRoutes,
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
