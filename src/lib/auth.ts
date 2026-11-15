// 会话层：登录身份、角色与门店上下文
//
// 登录后把「账号 → 角色 → 门店」写入 localStorage（模拟后端会话），
// 供侧边栏菜单过滤、顶栏身份展示和页面数据范围判断使用。

import { useEffect, useState } from "react";
import { redirect } from "react-router";
import {
  QUICK_LOGIN_USER_IDS,
  SYSTEM_USERS,
  USER_MAP,
  getStoreById,
  getStoreName,
  type SystemUser,
} from "./org";
import { ROLE_MAP, getRole, type RoleId } from "./rbac";

const SESSION_KEY = "weiai.session";
const LEGACY_AUTH_KEY = "weiai_auth";
const SESSION_EVENT = "weiai-session-change";

export interface Session {
  userId: string;
  account: string;
  name: string;
  roleId: RoleId;
  title: string;
  /** 单店角色必有；全局与商城角色为空 */
  storeId?: string;
  storeName?: string;
  loginAt: string;
}

function notify() {
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Session;
    if (!parsed?.roleId || !ROLE_MAP[parsed.roleId]) return null;
    return parsed;
  } catch {
    return null;
  }
}

function persist(user: SystemUser): Session {
  const session: Session = {
    userId: user.id,
    account: user.account,
    name: user.name,
    roleId: user.roleId,
    title: user.title,
    storeId: user.storeId,
    storeName: user.storeId ? getStoreName(user.storeId) : undefined,
    loginAt: new Date().toISOString(),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  localStorage.removeItem(LEGACY_AUTH_KEY);
  notify();
  return session;
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(LEGACY_AUTH_KEY);
  notify();
}

/** 校验一个账号是否可以登录（状态、门店状态） */
export function validateUser(user: SystemUser): string | null {
  if (user.status === "停用") return "该账号已停用，请联系管理员";
  if (user.storeId) {
    const store = getStoreById(user.storeId);
    if (!store) return "账号未绑定有效门店";
    if (store.status === "已停用") return "所属门店已停用，请联系管理员";
  }
  return null;
}

/** 账号密码登录 */
export function signIn(account: string, password: string): { ok: true; session: Session } | { ok: false; message: string } {
  const user = SYSTEM_USERS.find((item) => item.account === account.trim());
  if (!user || user.password !== password.trim()) {
    return { ok: false, message: "账号或密码不正确" };
  }
  const invalid = validateUser(user);
  if (invalid) return { ok: false, message: invalid };
  return { ok: true, session: persist(user) };
}

/** 快捷登录：按演示账号直接进入对应角色视角 */
export function signInAs(userId: string): { ok: true; session: Session } | { ok: false; message: string } {
  const user = USER_MAP[userId];
  if (!user) return { ok: false, message: "演示账号不存在" };
  const invalid = validateUser(user);
  if (invalid) return { ok: false, message: invalid };
  return { ok: true, session: persist(user) };
}

/** 登录页快捷入口使用的演示账号 */
export function getQuickLoginUsers(): SystemUser[] {
  return QUICK_LOGIN_USER_IDS.map((id) => USER_MAP[id]).filter(Boolean);
}

/** 当前会话的默认落地页 */
export function getHomePath(session: Session | null = getSession()): string {
  if (!session) return "/login";
  return getRole(session.roleId).homePath;
}

export function isAuthed(): boolean {
  return getSession() !== null;
}

export function clearAuthed() {
  clearSession();
}

export function requireAuthLoader() {
  if (!getSession()) {
    throw redirect("/login");
  }
  return null;
}

export function redirectIfAuthedLoader() {
  const session = getSession();
  if (session) {
    throw redirect(getHomePath(session));
  }
  return null;
}

/** 订阅会话变化，供组件实时读取当前登录身份 */
export function useSession(): Session | null {
  const [session, setSessionState] = useState<Session | null>(() => getSession());

  useEffect(() => {
    const sync = () => setSessionState(getSession());
    window.addEventListener(SESSION_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(SESSION_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return session;
}
