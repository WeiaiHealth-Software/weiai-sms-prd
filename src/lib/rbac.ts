// 角色与权限基础层
//
// 系统采用「角色权限 + 数据范围」双层模型：
// - 角色权限：决定能看到哪些菜单、能执行哪些操作。
// - 数据范围：决定操作哪家门店的数据（全部门店 / 单店 / 线上商城）。
// 说明：当前项目使用 localStorage 模拟后端，权限判断在前端完成；
// 真实环境必须由服务端按门店范围强制校验，不能信任前端传入的 storeId。

export type RoleId =
  | "developer"
  | "super_admin"
  | "store_manager"
  | "store_staff"
  | "optometrist"
  | "mall_manager"
  | "mall_entry";

/** 数据范围：global 全部门店、store 单店、mall 线上商城 */
export type DataScope = "global" | "store" | "mall";

export interface RoleDefinition {
  id: RoleId;
  label: string;
  scope: DataScope;
  /** 数据范围的可读描述 */
  scopeLabel: string;
  /** 登录后默认落地页 */
  homePath: string;
  /** 是否必须绑定门店 */
  requiresStore: boolean;
  description: string;
  /** 角色标签配色 */
  tone: string;
}

export const ROLE_DEFINITIONS: RoleDefinition[] = [
  {
    id: "developer",
    label: "开发者",
    scope: "global",
    scopeLabel: "全系统",
    homePath: "/store/list",
    requiresStore: false,
    description: "平台最高权限，用于技术维护与故障排查；所有跨门店操作均记录审计日志。",
    tone: "bg-slate-900 text-white border-slate-900",
  },
  {
    id: "super_admin",
    label: "超级管理员",
    scope: "global",
    scopeLabel: "全部门店",
    homePath: "/store/list",
    requiresStore: false,
    description: "管理门店、账号、角色与全局设置，可进入任意门店查看完整业务。",
    tone: "bg-purple-50 text-purple-700 border-purple-200",
  },
  {
    id: "store_manager",
    label: "门店店长",
    scope: "store",
    scopeLabel: "本店",
    homePath: "/",
    requiresStore: true,
    description: "管理本店人员、诊室、排班与业务，可维护本店店员 / 视光师账号。",
    tone: "bg-primary-50 text-primary-700 border-primary-200",
  },
  {
    id: "store_staff",
    label: "门店店员",
    scope: "store",
    scopeLabel: "本店",
    homePath: "/",
    requiresStore: true,
    description: "处理本店客户接待、预约与收银等日常操作。",
    tone: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    id: "optometrist",
    label: "视光师",
    scope: "store",
    scopeLabel: "本店",
    homePath: "/",
    requiresStore: true,
    description: "查看本店排班、客户档案并处理视光相关业务。",
    tone: "bg-teal-50 text-teal-700 border-teal-200",
  },
  {
    id: "mall_manager",
    label: "商城负责人",
    scope: "mall",
    scopeLabel: "线上商城",
    homePath: "/mall/order",
    requiresStore: false,
    description: "负责商城店铺、商品、订单、评价与代理商管理。",
    tone: "bg-orange-50 text-orange-700 border-orange-200",
  },
  {
    id: "mall_entry",
    label: "商城录入人员",
    scope: "mall",
    scopeLabel: "线上商城",
    homePath: "/mall/product",
    requiresStore: false,
    description: "负责商城商品资料录入与维护，不参与订单、资金与权限操作。",
    tone: "bg-amber-50 text-amber-700 border-amber-200",
  },
];

export const ROLE_MAP: Record<RoleId, RoleDefinition> = Object.fromEntries(
  ROLE_DEFINITIONS.map((role) => [role.id, role])
) as Record<RoleId, RoleDefinition>;

export function getRole(roleId: RoleId): RoleDefinition {
  return ROLE_MAP[roleId];
}

/** 是否为跨门店角色（开发者、超级管理员） */
export function isGlobalRole(roleId: RoleId): boolean {
  return ROLE_MAP[roleId].scope === "global";
}

/** 受保护角色：本地账号不可被授予 */
export const PROTECTED_ROLES: RoleId[] = ["developer", "super_admin"];

/** 门店店长可为本店账号分配的角色 */
export const STORE_ASSIGNABLE_ROLES: RoleId[] = ["store_staff", "optometrist"];

/** 判断角色是否有权访问某个菜单 */
export function isMenuAllowed(roleId: RoleId, allowed: RoleId[]): boolean {
  return allowed.includes(roleId);
}
