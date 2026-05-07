
import { createHashRouter, Navigate } from "react-router";
import { MainLayout } from "./layouts/MainLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import Personnel from "./pages/store/Personnel";
import Room from "./pages/store/Room";
import Schedule from "./pages/store/Schedule";
import { GenericPlaceholder } from "./pages/generic/GenericPlaceholder";
import { menuConfig } from "./config/menu";
import ClientList from "./pages/crm/ClientList";
import ClientDetail from "./pages/crm/ClientDetail";
import ClientVisitNew from "./pages/crm/ClientVisitNew";
import ClientFollowupNew from "./pages/crm/ClientFollowupNew";

import ScreenList from "./pages/external/ScreenList";
import Miniprogram from "./pages/external/Miniprogram";
import Pad from "./pages/external/Pad";

// Create dynamic routes based on menuConfig for generic pages
const genericRoutes = menuConfig.flatMap((item) =>
  item.subs
    .filter(
      (sub) =>
        ![
          "/store/personnel",
          "/store/room",
          "/store/schedule",
          "/crm/client-list",
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
      {
        path: "crm/client-list",
        element: <ClientList />,
      },
      {
        path: "crm/client/:id",
        element: <ClientDetail />,
      },
      {
        path: "crm/client/:id/visit/new",
        element: <ClientVisitNew />,
      },
      {
        path: "crm/client/:id/followup/new",
        element: <ClientFollowupNew />,
      },
      ...genericRoutes,
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
  {
    path: "/screen-list",
    element: <ScreenList />,
  },
  {
    path: "/miniprogram",
    element: <Miniprogram />,
  },
  {
    path: "/pad",
    element: <Pad />,
  },
]);
