
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
import Booking from "./pages/crm/Booking";
import Followup from "./pages/crm/Followup";
import TagManagement from "./pages/crm/TagManagement";
import UiSpec from "./pages/system/UiSpec";
import Login from "./pages/auth/Login";

import ScreenList from "./pages/external/ScreenList";
import Pad from "./pages/external/Pad";
import MiniprogramLayout from "./pages/external/miniprogram/index";
import MiniprogramIndexRedirect from "./pages/external/miniprogram/pages/IndexRedirect";
import LoginPage from "./pages/external/miniprogram/pages/LoginPage";
import HomePage from "./pages/external/miniprogram/pages/HomePage";
import ProfilePage from "./pages/external/miniprogram/pages/ProfilePage";
import NotificationsPage from "./pages/external/miniprogram/pages/NotificationsPage";
import ArchiveNewPage from "./pages/external/miniprogram/pages/ArchiveNewPage";
import StoreSelectPage from "./pages/external/miniprogram/pages/StoreSelectPage";
import AppointmentPage from "./pages/external/miniprogram/pages/AppointmentPage";
import FamilyGroupPage from "./pages/external/miniprogram/pages/FamilyGroupPage";
import FamilyGroupDetailPage from "./pages/external/miniprogram/pages/FamilyGroupDetailPage";
import PatientListPage from "./pages/external/miniprogram/pages/PatientListPage";
import MyAppointmentsPage from "./pages/external/miniprogram/pages/MyAppointmentsPage";

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
          "/crm/tag-management",
          "/crm/booking",
          "/crm/followup",
        ].includes(sub.path)
    )
    .map((sub) => ({
      path: sub.path.replace(/^\//, ""),
      element: <GenericPlaceholder />,
    }))
);

export const router = createHashRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "ui-spec",
        element: <UiSpec />,
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
        path: "crm/booking",
        element: <Booking />,
      },
      {
        path: "crm/tag-management",
        element: <TagManagement />,
      },
      {
        path: "crm/followup",
        element: <Followup />,
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
    element: <MiniprogramLayout />,
    children: [
      {
        index: true,
        element: <MiniprogramIndexRedirect />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "home",
        element: <HomePage />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "notifications",
        element: <NotificationsPage />,
      },
      {
        path: "archive/new",
        element: <ArchiveNewPage />,
      },
      {
        path: "store-select",
        element: <StoreSelectPage />,
      },
      {
        path: "appointment",
        element: <AppointmentPage />,
      },
      {
        path: "family-groups",
        element: <FamilyGroupPage />,
      },
      {
        path: "family-groups/:id",
        element: <FamilyGroupDetailPage />,
      },
      {
        path: "patients",
        element: <PatientListPage />,
      },
      {
        path: "my-appointments",
        element: <MyAppointmentsPage />,
      },
    ],
  },
  {
    path: "/pad",
    element: <Pad />,
  },
]);
