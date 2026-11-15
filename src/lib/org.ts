// 组织数据层：门店、共享仓库、系统账号与审计日志
//
// 当前项目使用 localStorage 模拟后端，本文件提供多门店与权限体系的演示数据。
// 库存余额只归属仓库，可被多家门店共享（见设计稿「门店与仓库关联」）。
// 仓库编号与「库存管理」模块保持一致，便于同一份仓库主数据被两处引用。

import type { RoleId } from "./rbac";

export type StoreStatus = "营业中" | "筹备中" | "已停用";

export interface StoreMetrics {
  /** 近 30 天销售额（元） */
  revenue: number;
  /** 近 30 天成交单数 */
  orders: number;
  /** 近 30 天新增客户 */
  newClients: number;
  /** 近 30 天预约数 */
  appointments: number;
  /** 近 30 天到诊数 */
  arrived: number;
  /** 关联仓库的低库存预警数 */
  lowStock: number;
}

export interface Store {
  id: string;
  name: string;
  code: string;
  city: string;
  address: string;
  phone: string;
  manager: string;
  status: StoreStatus;
  openedAt: string;
  /** 关联仓库，仓库可被多家门店共享 */
  warehouseIds: string[];
  metrics: StoreMetrics;
}

export const STORES: Store[] = [
  {
    id: "ST-001",
    name: "惟爱上海海华门店",
    code: "SHA-HH",
    city: "上海",
    address: "上海市黄浦区中山南路 88 号 3 号楼 2 层",
    phone: "021-6300 8899",
    manager: "张店长",
    status: "营业中",
    openedAt: "2024-03-18",
    warehouseIds: ["WH-001"],
    metrics: { revenue: 512600, orders: 1846, newClients: 312, appointments: 986, arrived: 902, lowStock: 6 },
  },
  {
    id: "ST-002",
    name: "惟爱北京望京门店",
    code: "BJS-WJ",
    city: "北京",
    address: "北京市朝阳区望京 SOHO T3 座 1 层",
    phone: "010-8471 2266",
    manager: "陈店长",
    status: "营业中",
    openedAt: "2024-09-02",
    warehouseIds: ["WH-001", "WH-002"],
    metrics: { revenue: 386400, orders: 1428, newClients: 246, appointments: 764, arrived: 688, lowStock: 3 },
  },
  {
    id: "ST-003",
    name: "惟爱广州珠江新城门店",
    code: "GZS-ZJ",
    city: "广州",
    address: "广州市天河区珠江新城花城大道 66 号 1 层",
    phone: "020-3888 5511",
    manager: "周店长",
    status: "筹备中",
    openedAt: "待开业",
    warehouseIds: ["WH-003"],
    metrics: { revenue: 0, orders: 0, newClients: 38, appointments: 0, arrived: 0, lowStock: 0 },
  },
];

export const STORE_MAP: Record<string, Store> = Object.fromEntries(STORES.map((store) => [store.id, store]));

export function getStoreById(id?: string): Store | undefined {
  return id ? STORE_MAP[id] : undefined;
}

export function getStoreName(id?: string): string {
  return getStoreById(id)?.name ?? "未绑定门店";
}

export interface OrgWarehouse {
  id: string;
  name: string;
  address: string;
}

/** 与「库存管理 → 仓库管理」对齐的仓库主数据 */
export const ORG_WAREHOUSES: OrgWarehouse[] = [
  { id: "WH-001", name: "惟爱上海仓库", address: "上海市黄浦区中山南路 88 号 3 号楼 B1 库区" },
  { id: "WH-002", name: "惟爱北京仓库", address: "北京市朝阳区望京 SOHO T3 座 B2 库区" },
  { id: "WH-003", name: "惟爱广州仓库", address: "广州市天河区珠江新城花城大道 66 号 B1 库区" },
];

export function getWarehouseName(id: string): string {
  return ORG_WAREHOUSES.find((item) => item.id === id)?.name ?? id;
}

/** 共享某仓库的全部门店 */
export function getSharedStores(warehouseId: string): Store[] {
  return STORES.filter((store) => store.warehouseIds.includes(warehouseId));
}

export type UserStatus = "启用" | "停用";

export interface SystemUser {
  id: string;
  account: string;
  password: string;
  name: string;
  roleId: RoleId;
  /** 单店角色必须绑定门店；全局与商城角色不绑定 */
  storeId?: string;
  title: string;
  status: UserStatus;
  lastLoginAt: string;
}

/** 演示环境统一密码 */
export const DEMO_PASSWORD = "weiai123";

export const SYSTEM_USERS: SystemUser[] = [
  {
    id: "U-001",
    account: "developer",
    password: DEMO_PASSWORD,
    name: "平台开发者",
    roleId: "developer",
    title: "平台开发者",
    status: "启用",
    lastLoginAt: "2026-11-15 08:42",
  },
  {
    id: "U-002",
    account: "admin",
    password: DEMO_PASSWORD,
    name: "总部管理员",
    roleId: "super_admin",
    title: "总部超级管理员",
    status: "启用",
    lastLoginAt: "2026-11-15 09:05",
  },
  {
    id: "U-003",
    account: "manager.sh",
    password: DEMO_PASSWORD,
    name: "张店长",
    roleId: "store_manager",
    storeId: "ST-001",
    title: "上海海华门店店长",
    status: "启用",
    lastLoginAt: "2026-11-15 08:58",
  },
  {
    id: "U-004",
    account: "staff.sh",
    password: DEMO_PASSWORD,
    name: "李明",
    roleId: "store_staff",
    storeId: "ST-001",
    title: "上海海华门店 · 前台店员",
    status: "启用",
    lastLoginAt: "2026-11-14 18:20",
  },
  {
    id: "U-005",
    account: "opto.sh",
    password: DEMO_PASSWORD,
    name: "王视光",
    roleId: "optometrist",
    storeId: "ST-001",
    title: "上海海华门店 · 高级验光员",
    status: "启用",
    lastLoginAt: "2026-11-15 08:31",
  },
  {
    id: "U-006",
    account: "mall.manager",
    password: DEMO_PASSWORD,
    name: "赵经理",
    roleId: "mall_manager",
    title: "线上商城负责人",
    status: "启用",
    lastLoginAt: "2026-11-15 09:12",
  },
  {
    id: "U-007",
    account: "mall.entry",
    password: DEMO_PASSWORD,
    name: "孙录入",
    roleId: "mall_entry",
    title: "商城商品录入人员",
    status: "启用",
    lastLoginAt: "2026-11-14 17:40",
  },
  {
    id: "U-008",
    account: "manager.bj",
    password: DEMO_PASSWORD,
    name: "陈店长",
    roleId: "store_manager",
    storeId: "ST-002",
    title: "北京望京门店店长",
    status: "启用",
    lastLoginAt: "2026-11-15 08:47",
  },
  {
    id: "U-009",
    account: "manager.gz",
    password: DEMO_PASSWORD,
    name: "周店长",
    roleId: "store_manager",
    storeId: "ST-003",
    title: "广州珠江新城门店店长（筹备中）",
    status: "停用",
    lastLoginAt: "—",
  },
];

export const USER_MAP: Record<string, SystemUser> = Object.fromEntries(SYSTEM_USERS.map((user) => [user.id, user]));

/** 登录页快捷入口：覆盖全部角色，顺序即展示顺序 */
export const QUICK_LOGIN_USER_IDS: string[] = [
  "U-001",
  "U-002",
  "U-003",
  "U-004",
  "U-006",
  "U-007",
];

export type LogResult = "成功" | "失败";

export interface AuditLog {
  id: string;
  at: string;
  actor: string;
  roleId: RoleId;
  /** 全局操作无门店归属 */
  storeId?: string;
  action: string;
  target: string;
  result: LogResult;
}

export const AUDIT_LOGS: AuditLog[] = [
  { id: "LOG-20261115-014", at: "2026-11-15 09:12:03", actor: "赵经理", roleId: "mall_manager", action: "登录系统", target: "商城管理后台", result: "成功" },
  { id: "LOG-20261115-013", at: "2026-11-15 09:05:41", actor: "总部管理员", roleId: "super_admin", action: "启用门店", target: "惟爱北京望京门店（ST-002）", result: "成功" },
  { id: "LOG-20261115-012", at: "2026-11-15 08:58:10", actor: "张店长", roleId: "store_manager", storeId: "ST-001", action: "新增员工档案", target: "上海海华门店 · 视训师 王视训", result: "成功" },
  { id: "LOG-20261115-011", at: "2026-11-15 08:47:22", actor: "陈店长", roleId: "store_manager", storeId: "ST-002", action: "提交调拨申请", target: "惟爱上海仓库 → 惟爱北京仓库", result: "成功" },
  { id: "LOG-20261115-010", at: "2026-11-15 08:42:55", actor: "平台开发者", roleId: "developer", action: "修改角色权限模板", target: "超级管理员 · 菜单权限", result: "成功" },
  { id: "LOG-20261115-009", at: "2026-11-15 08:31:07", actor: "王视光", roleId: "optometrist", storeId: "ST-001", action: "登录系统", target: "上海海华门店工作区", result: "成功" },
  { id: "LOG-20261114-008", at: "2026-11-14 18:20:36", actor: "李明", roleId: "store_staff", storeId: "ST-001", action: "创建销售出库", target: "出库单 CK-20261114-021", result: "成功" },
  { id: "LOG-20261114-007", at: "2026-11-14 18:20:02", actor: "李明", roleId: "store_staff", storeId: "ST-001", action: "创建销售出库", target: "出库单 CK-20261114-021", result: "失败" },
  { id: "LOG-20261114-006", at: "2026-11-14 17:40:18", actor: "孙录入", roleId: "mall_entry", action: "更新商城商品", target: "角膜塑形镜护理液套装", result: "成功" },
  { id: "LOG-20261114-005", at: "2026-11-14 16:12:44", actor: "总部管理员", roleId: "super_admin", action: "绑定门店仓库", target: "惟爱北京望京门店 ← 惟爱上海仓库（共享）", result: "成功" },
  { id: "LOG-20261114-004", at: "2026-11-14 15:05:29", actor: "总部管理员", roleId: "super_admin", action: "停用账号", target: "周店长（manager.gz）", result: "成功" },
  { id: "LOG-20261114-003", at: "2026-11-14 11:26:51", actor: "张店长", roleId: "store_manager", storeId: "ST-001", action: "编辑诊室", target: "验光室 2 · 角塑验配", result: "成功" },
  { id: "LOG-20261114-002", at: "2026-11-14 10:03:37", actor: "总部管理员", roleId: "super_admin", action: "创建门店", target: "惟爱广州珠江新城门店（ST-003）", result: "成功" },
  { id: "LOG-20261114-001", at: "2026-11-14 09:58:12", actor: "平台开发者", roleId: "developer", action: "登录系统", target: "开发者控制台", result: "成功" },
];

/** 全局角色可查看全部日志，门店角色仅可查看本店日志 */
export function getVisibleLogs(roleId: RoleId, storeId?: string): AuditLog[] {
  const isGlobal = roleId === "developer" || roleId === "super_admin";
  if (isGlobal) return AUDIT_LOGS;
  return AUDIT_LOGS.filter((log) => log.storeId === storeId);
}

/** 门店角色可见的系统用户：本店店员与视光师 */
export function getVisibleUsers(roleId: RoleId, storeId?: string): SystemUser[] {
  const isGlobal = roleId === "developer" || roleId === "super_admin";
  if (isGlobal) return SYSTEM_USERS;
  return SYSTEM_USERS.filter((user) => user.storeId === storeId);
}
