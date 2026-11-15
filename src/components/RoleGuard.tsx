import { Navigate } from "react-router";
import type { ReactNode } from "react";
import { useSession } from "../lib/auth";
import { isGlobalRole, type RoleId } from "../lib/rbac";

/**
 * 角色守卫：未登录跳转登录页，越权访问回到自身首页。
 * 菜单隐藏只是体验控制，路由与接口仍按角色校验。
 */
export function RequireRole({ roles, children }: { roles: RoleId[]; children: ReactNode }) {
  const session = useSession();
  if (!session) return <Navigate to="/login" replace />;
  if (!roles.includes(session.roleId)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

/** 门店管理入口：管理员进入门店列表，门店角色进入本店人员管理 */
export function StoreIndexRedirect() {
  const session = useSession();
  const target = session && isGlobalRole(session.roleId) ? "/store/list" : "/store/personnel";
  return <Navigate to={target} replace />;
}

/** 系统管理入口：管理员进入权限管理，门店店长进入用户管理 */
export function SystemIndexRedirect() {
  const session = useSession();
  const target = session && isGlobalRole(session.roleId) ? "/system/permission" : "/system/user";
  return <Navigate to={target} replace />;
}
