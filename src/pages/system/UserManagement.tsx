import { useMemo, useState } from "react";
import { MagnifyingGlass, Plus, X } from "@phosphor-icons/react";
import clsx from "clsx";
import StatusTag, { type StatusTone } from "../../components/product/StatusTag";
import { useSession } from "../../lib/auth";
import { STORES, SYSTEM_USERS, getStoreName, type SystemUser, type UserStatus } from "../../lib/org";
import { ROLE_DEFINITIONS, STORE_ASSIGNABLE_ROLES, getRole, isGlobalRole, type RoleId } from "../../lib/rbac";

const statusTone: Record<UserStatus, StatusTone> = {
  启用: "success",
  停用: "neutral",
};

export default function UserManagement() {
  const session = useSession();
  const roleId: RoleId = session?.roleId ?? "store_staff";
  const isGlobal = isGlobalRole(roleId);

  const [extraUsers, setExtraUsers] = useState<SystemUser[]>([]);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, UserStatus>>({});
  const [keyword, setKeyword] = useState("");
  const [roleFilter, setRoleFilter] = useState<"全部角色" | RoleId>("全部角色");
  const [storeFilter, setStoreFilter] = useState("全部门店");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  /** 全局角色可见全部账号；门店角色仅可见本店账号 */
  const scopedUsers = useMemo(() => {
    const base = isGlobal ? SYSTEM_USERS : SYSTEM_USERS.filter((user) => user.storeId === session?.storeId);
    return [...base, ...extraUsers];
  }, [extraUsers, isGlobal, session?.storeId]);

  const visibleUsers = useMemo(
    () =>
      scopedUsers.filter((user) => {
        const matchKeyword =
          keyword.trim().length === 0 ||
          user.name.includes(keyword.trim()) ||
          user.account.toLowerCase().includes(keyword.trim().toLowerCase());
        const matchRole = roleFilter === "全部角色" || user.roleId === roleFilter;
        const matchStore =
          storeFilter === "全部门店" ||
          (storeFilter === "无门店归属" ? !user.storeId : user.storeId === storeFilter);
        return matchKeyword && matchRole && matchStore;
      }),
    [keyword, roleFilter, scopedUsers, storeFilter]
  );

  const canManage = (user: SystemUser) => {
    if (isGlobal) return true;
    // 门店店长仅可维护本店店员 / 视光师账号
    return STORE_ASSIGNABLE_ROLES.includes(user.roleId) && user.storeId === session?.storeId;
  };

  const toggleStatus = (user: SystemUser) => {
    const current = statusOverrides[user.id] ?? user.status;
    setStatusOverrides((prev) => ({ ...prev, [user.id]: current === "启用" ? "停用" : "启用" }));
  };

  /**
   * 可分配角色：全局角色可分配除受保护角色外的全部角色；
   * 门店店长仅可分配本店店员 / 视光师。
   */
  const assignableRoles = isGlobal
    ? ROLE_DEFINITIONS.filter((role) => role.id !== "developer")
    : ROLE_DEFINITIONS.filter((role) => STORE_ASSIGNABLE_ROLES.includes(role.id));

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      {/* 数据范围提示 */}
      <div className="flex flex-none flex-wrap items-center justify-between gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 card-shadow">
        <div className="text-sm text-gray-600">
          {isGlobal ? (
            <>
              当前以 <span className="font-bold text-gray-900">{getRole(roleId).label}</span> 身份查看
              <span className="font-bold text-gray-900"> 全部 {STORES.length} 家门店 </span>
              的账号，可创建、停用账号并分配角色与门店。
            </>
          ) : (
            <>
              当前以 <span className="font-bold text-gray-900">{getRole(roleId).label}</span> 身份仅可维护
              <span className="font-bold text-gray-900"> {session?.storeName} </span>
              的店员与视光师账号，不能修改门店归属或提升权限。
            </>
          )}
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-600"
        >
          <Plus weight="bold" className="mr-2" /> 新建账号
        </button>
      </div>

      {/* 筛选 */}
      <div className="flex flex-none flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
        <div className="relative">
          <MagnifyingGlass weight="bold" className="absolute left-3 top-2.5 text-gray-400" />
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜索姓名 / 账号..."
            className="w-60 rounded-lg border border-gray-200 py-2 pl-9 pr-4 text-sm transition focus:border-primary-500 focus:outline-none"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value as "全部角色" | RoleId)}
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 focus:border-primary-500 focus:outline-none"
        >
          <option value="全部角色">全部角色</option>
          {ROLE_DEFINITIONS.map((role) => (
            <option key={role.id} value={role.id}>
              {role.label}
            </option>
          ))}
        </select>
        {isGlobal && (
          <select
            value={storeFilter}
            onChange={(event) => setStoreFilter(event.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 focus:border-primary-500 focus:outline-none"
          >
            <option value="全部门店">全部门店</option>
            <option value="无门店归属">无门店归属</option>
            {STORES.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* 账号列表 */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse text-left">
            <thead className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-600">账号 / 姓名</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-600">角色</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-600">所属门店</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-600">状态</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-600">最近登录</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visibleUsers.map((user) => {
                const role = getRole(user.roleId);
                const status = statusOverrides[user.id] ?? user.status;
                const manageable = canManage(user);
                return (
                  <tr key={user.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="text-sm font-bold text-slate-800">{user.name}</div>
                      <div className="text-xs text-slate-400">{user.account}</div>
                      <div className="mt-0.5 text-xs text-slate-400">{user.title}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx("rounded-md border px-2 py-0.5 text-[11px] font-bold", role.tone)}>
                        {role.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {user.storeId ? getStoreName(user.storeId) : <span className="text-gray-400">全局</span>}
                    </td>
                    <td className="px-4 py-3">
                      <StatusTag status={status} tone={statusTone[status]} />
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">{user.lastLoginAt}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => toggleStatus(user)}
                        disabled={!manageable}
                        title={manageable ? "" : "门店店长仅可维护本店店员 / 视光师账号"}
                        className={clsx(
                          "rounded-lg border px-3 py-1.5 text-xs font-semibold transition",
                          status === "启用"
                            ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                            : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
                          !manageable && "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400 hover:bg-gray-50"
                        )}
                      >
                        {status === "启用" ? "停用账号" : "启用账号"}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {visibleUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-sm text-gray-400">
                    没有符合条件的账号
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex-none border-t border-gray-100 px-4 py-2 text-xs text-gray-400">
          共 {visibleUsers.length} 个账号 · 停用账号不影响历史数据，停用后无法登录
        </div>
      </div>

      {isCreateOpen && (
        <CreateUserDialog
          assignableRoles={assignableRoles.map((role) => role.id)}
          fixedStoreId={isGlobal ? undefined : session?.storeId}
          onClose={() => setIsCreateOpen(false)}
          onCreate={(user) => {
            setExtraUsers((prev) => [...prev, user]);
            setIsCreateOpen(false);
          }}
        />
      )}
    </div>
  );
}

function CreateUserDialog({
  assignableRoles,
  fixedStoreId,
  onClose,
  onCreate,
}: {
  assignableRoles: RoleId[];
  fixedStoreId?: string;
  onClose: () => void;
  onCreate: (user: SystemUser) => void;
}) {
  const [name, setName] = useState("");
  const [account, setAccount] = useState("");
  const [roleId, setRoleId] = useState<RoleId>(assignableRoles[0]);
  const [storeId, setStoreId] = useState<string>(fixedStoreId ?? "");

  const role = getRole(roleId);
  const needStore = role.requiresStore;
  const canSubmit = name.trim().length > 0 && account.trim().length > 0 && (!needStore || storeId.length > 0);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="text-base font-bold text-gray-900">新建账号</h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <X weight="bold" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-500">姓名</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="如：刘验光"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-500">登录账号</label>
            <input
              value={account}
              onChange={(event) => setAccount(event.target.value)}
              placeholder="如：opto.sh2"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-500">角色</label>
            <select
              value={roleId}
              onChange={(event) => setRoleId(event.target.value as RoleId)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-primary-500 focus:outline-none"
            >
              {assignableRoles.map((id) => (
                <option key={id} value={id}>
                  {getRole(id).label}（{getRole(id).scopeLabel}）
                </option>
              ))}
            </select>
          </div>
          {needStore && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-500">所属门店</label>
              {fixedStoreId ? (
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
                  {getStoreName(fixedStoreId)}（由当前身份固定）
                </div>
              ) : (
                <select
                  value={storeId}
                  onChange={(event) => setStoreId(event.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-primary-500 focus:outline-none"
                >
                  <option value="">请选择门店</option>
                  {STORES.filter((store) => store.status !== "已停用").map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
          <div className="rounded-xl bg-gray-50 px-3 py-2.5 text-xs text-gray-500">
            新账号初始状态为「启用」，需告知本人使用统一初始密码登录后修改；门店角色只能看到所属门店的数据。
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            取消
          </button>
          <button
            disabled={!canSubmit}
            onClick={() =>
              onCreate({
                id: `U-${String(SYSTEM_USERS.length + 1).padStart(3, "0")}`,
                account: account.trim(),
                password: "weiai123",
                name: name.trim(),
                roleId,
                storeId: needStore ? storeId : undefined,
                title: role.label,
                status: "启用",
                lastLoginAt: "—",
              })
            }
            className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-primary-200"
          >
            创建账号
          </button>
        </div>
      </div>
    </div>
  );
}
