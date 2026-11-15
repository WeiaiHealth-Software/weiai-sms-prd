
import { createHashRouter, Navigate } from "react-router";
import { MainLayout } from "./layouts/MainLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import Personnel from "./pages/store/Personnel";
import Room from "./pages/store/Room";
import Schedule from "./pages/store/Schedule";
import { GenericPlaceholder } from "./pages/generic/GenericPlaceholder";
import ClientList from "./pages/crm/ClientList";
import ClientDetail from "./pages/crm/ClientDetail";
import ClientVisitNew from "./pages/crm/ClientVisitNew";
import ClientFollowupNew from "./pages/crm/ClientFollowupNew";
import Booking from "./pages/crm/Booking";
import Followup from "./pages/crm/Followup";
import TagManagement from "./pages/crm/TagManagement";
import MallProductList from "./pages/mall/ProductList";
import MallShopList from "./pages/mall/ShopList";
import MallOrderList from "./pages/mall/OrderList";
import MallReviewList from "./pages/mall/ReviewList";
import MallAgentList from "./pages/mall/AgentList";
import MallAgentDetail from "./pages/mall/AgentDetail";
import InventoryProductList from "./pages/inventory/ProductList";
import InventoryProductForm from "./pages/inventory/ProductForm";
import InventoryWarehouseList from "./pages/inventory/WarehouseList";
import InventoryCategoryList from "./pages/inventory/CategoryList";
import StockMovementList from "./pages/inventory/StockMovementList";
import UiSpec from "./pages/system/UiSpec";
import StoreList from "./pages/store/StoreList";
import PermissionManagement from "./pages/system/PermissionManagement";
import UserManagement from "./pages/system/UserManagement";
import SystemSettings from "./pages/system/SystemSettings";
import LogManagement from "./pages/system/LogManagement";
import Login from "./pages/auth/Login";
import { requireAuthLoader } from "./lib/auth";
import type { RoleId } from "./lib/rbac";
import { RequireRole, StoreIndexRedirect, SystemIndexRedirect } from "./components/RoleGuard";
import { GLOBAL_ADMIN_ROLES, SYSTEM_ROLES, menuConfig } from "./config/menu";

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

/** 门店工作区可见角色：管理员与门店店长 */
const STORE_WORKSPACE_ROLES: RoleId[] = ["developer", "super_admin", "store_manager"];

/** 排班额外开放给视光师 */
const SCHEDULE_ROLES: RoleId[] = ["developer", "super_admin", "store_manager", "optometrist"];

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
          "/mall/product",
          "/mall/shop",
          "/mall/order",
          "/mall/review",
          "/mall/agent",
          "/mall/withdraw",
          "/inventory/product",
          "/inventory/warehouse",
          "/inventory/inbound",
          "/inventory/outbound",
          "/inventory/category",
          "/store/list",
          "/system/permission",
          "/system/user",
          "/system/settings",
          "/system/log",
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
    loader: requireAuthLoader,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "ui-spec",
        element: (
          <RequireRole roles={GLOBAL_ADMIN_ROLES}>
            <UiSpec />
          </RequireRole>
        ),
      },
      {
        path: "system",
        children: [
          {
            index: true,
            element: <SystemIndexRedirect />,
          },
          {
            path: "permission",
            element: (
              <RequireRole roles={GLOBAL_ADMIN_ROLES}>
                <PermissionManagement />
              </RequireRole>
            ),
          },
          {
            path: "user",
            element: (
              <RequireRole roles={SYSTEM_ROLES}>
                <UserManagement />
              </RequireRole>
            ),
          },
          {
            path: "settings",
            element: (
              <RequireRole roles={GLOBAL_ADMIN_ROLES}>
                <SystemSettings />
              </RequireRole>
            ),
          },
          {
            path: "log",
            element: (
              <RequireRole roles={SYSTEM_ROLES}>
                <LogManagement />
              </RequireRole>
            ),
          },
        ],
      },
      {
        path: "store",
        children: [
          {
            index: true,
            element: <StoreIndexRedirect />,
          },
          {
            path: "list",
            element: (
              <RequireRole roles={GLOBAL_ADMIN_ROLES}>
                <StoreList />
              </RequireRole>
            ),
          },
          {
            path: "personnel",
            element: (
              <RequireRole roles={STORE_WORKSPACE_ROLES}>
                <Personnel />
              </RequireRole>
            ),
          },
          {
            path: "room",
            element: (
              <RequireRole roles={STORE_WORKSPACE_ROLES}>
                <Room />
              </RequireRole>
            ),
          },
          {
            path: "schedule",
            element: (
              <RequireRole roles={SCHEDULE_ROLES}>
                <Schedule />
              </RequireRole>
            ),
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
      {
        path: "mall/product",
        element: <MallProductList />,
      },
      {
        path: "mall/shop",
        element: <MallShopList />,
      },
      {
        path: "mall/order",
        element: <MallOrderList />,
      },
      {
        path: "mall/review",
        element: <MallReviewList />,
      },
      {
        path: "mall/agent",
        element: <MallAgentList />,
      },
      {
        path: "mall/agent/:id",
        element: <MallAgentDetail />,
      },
      {
        path: "inventory/product",
        element: <InventoryProductList />,
      },
      {
        path: "inventory/product/new",
        element: <InventoryProductForm />,
      },
      {
        path: "inventory/product/:spuId/edit",
        element: <InventoryProductForm />,
      },
      {
        path: "inventory/warehouse",
        element: <InventoryWarehouseList />,
      },
      {
        path: "inventory/category",
        element: <InventoryCategoryList />,
      },
      {
        path: "inventory/inbound",
        element: <StockMovementList direction="入库" />,
      },
      {
        path: "inventory/outbound",
        element: <StockMovementList direction="出库" />,
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
