import { useState } from "react";
import { Check, Info, LockKey, Minus, ShieldCheck } from "@phosphor-icons/react";
import clsx from "clsx";
import { menuConfig } from "../../config/menu";
import { PROTECTED_ROLES, ROLE_DEFINITIONS, getRole, type RoleId } from "../../lib/rbac";

function AccessCell({ allowed }: { allowed: boolean }) {
  return (
    <div className="flex justify-center">
      {allowed ? (
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-50 text-primary-600">
          <Check weight="bold" className="text-xs" />
        </span>
      ) : (
        <span className="flex h-6 w-6 items-center justify-center text-gray-300">
          <Minus weight="bold" className="text-xs" />
        </span>
      )}
    </div>
  );
}

export default function PermissionManagement() {
  const [activeRoleId, setActiveRoleId] = useState<RoleId>(ROLE_DEFINITIONS[0].id);
  const activeRole = getRole(activeRoleId);
  const isProtected = PROTECTED_ROLES.includes(activeRoleId);

  /** 选中角色可访问的菜单模块 */
  const visibleMenus = menuConfig
    .filter((item) => item.roles.includes(activeRoleId))
    .map((item) => ({
      ...item,
      subs: item.subs.filter((sub) => sub.roles.includes(activeRoleId)),
    }));

  const allowedMenuCount = visibleMenus.reduce((acc, item) => acc + 1 + item.subs.length, 0);

  return (
    <div className="flex h-full min-h-0 gap-3">
      {/* 左侧：角色卡片列表 */}
      <div className="flex w-72 flex-none flex-col gap-2 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
        <div className="px-1 pb-1 text-xs font-bold uppercase tracking-wider text-gray-400">
          角色列表
        </div>
        {ROLE_DEFINITIONS.map((role) => {
          const protectedRole = PROTECTED_ROLES.includes(role.id);
          const isActive = role.id === activeRoleId;
          return (
            <button
              key={role.id}
              type="button"
              onClick={() => setActiveRoleId(role.id)}
              className={clsx(
                "rounded-xl border p-3 text-left transition",
                isActive
                  ? "border-primary-300 bg-primary-50/60 shadow-sm ring-1 ring-primary-100"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className={clsx("rounded-md border px-2 py-0.5 text-[11px] font-bold", role.tone)}>
                  {role.label}
                </span>
                {protectedRole ? (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-gray-400">
                    <LockKey weight="bold" /> 受保护
                  </span>
                ) : null}
              </div>
              <div className="mt-2 text-[11px] font-semibold text-gray-500">
                数据范围：{role.scopeLabel}
              </div>
              <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-gray-400">{role.description}</p>
            </button>
          );
        })}

        {/* 单一归属原则提示 */}
        <div className="mt-1 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <div className="flex items-start gap-2">
            <Info weight="fill" className="mt-0.5 flex-none text-sm text-amber-500" />
            <div className="space-y-2 text-[11px] leading-4 text-amber-800">
              <p className="font-bold">单一归属原则</p>
              <p>
                每个账号仅归属<strong>一家门店</strong>或<strong>线上商城</strong>，登录后只能查看该范围内的数据。
              </p>
              <p>
                如需跨范围权限，二选一：
              </p>
              <ul className="space-y-1 pl-3 list-disc">
                <li>升级为<strong>超级管理员</strong>，可查看全部门店与商城；</li>
                <li>为每个门店/商城<strong>分别创建账号</strong>。</li>
              </ul>
              <p className="rounded-lg bg-white/60 px-2 py-1.5">
                <span className="font-semibold">举例：</span>张三既是「上海海华门店」的店员，又负责「线上商城」的商品录入，则为其创建两个账号（一个门店店员、一个商城录入人员），分别登录使用。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 右侧：选中角色的权限内容 */}
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
        {/* 角色概览 */}
        <div className="flex flex-none items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 card-shadow">
          <div className="flex items-center gap-3">
            <span className={clsx("rounded-md border px-2.5 py-1 text-xs font-bold", activeRole.tone)}>
              {activeRole.label}
            </span>
            <div>
              <div className="text-sm font-bold text-gray-900">数据范围：{activeRole.scopeLabel}</div>
              <div className="text-xs text-gray-500">{activeRole.description}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{allowedMenuCount}</div>
            <div className="text-[11px] text-gray-400">可访问菜单项</div>
          </div>
        </div>

        {/* 可访问菜单列表 */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-none items-center justify-between border-b border-gray-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <ShieldCheck weight="duotone" className="text-lg text-primary-500" />
              <h3 className="text-sm font-bold text-gray-900">可访问菜单</h3>
            </div>
            {isProtected ? (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-gray-400">
                <LockKey weight="bold" /> 受保护角色，权限模板不可修改
              </span>
            ) : (
              <span className="text-[11px] text-gray-400">点击「编辑权限」可调整该角色可访问的菜单</span>
            )}
          </div>

          <div className="flex-1 overflow-auto p-4">
            <div className="space-y-3">
              {visibleMenus.map((item) => (
                <div key={item.id} className="rounded-xl border border-gray-100 bg-gray-50/50 p-3">
                  <div className="flex items-center gap-2">
                    <item.icon weight="bold" className="text-base text-primary-500" />
                    <span className="text-sm font-bold text-gray-900">{item.label}</span>
                  </div>
                  {item.subs.length > 0 ? (
                    <div className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                      {item.subs.map((sub) => (
                        <div
                          key={sub.id}
                          className="flex items-center justify-between rounded-lg bg-white px-3 py-1.5 text-xs text-gray-600 shadow-sm"
                        >
                          <span>{sub.label}</span>
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                            <Check weight="bold" className="text-[10px]" />
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-1 text-xs text-gray-400">该模块无子菜单</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 与其他角色的权限对比（精简矩阵） */}
        <div className="flex-none overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-none items-center gap-2 border-b border-gray-100 px-4 py-2.5">
            <ShieldCheck weight="duotone" className="text-base text-primary-500" />
            <h3 className="text-sm font-bold text-gray-900">与其他角色对比</h3>
          </div>
          <div className="overflow-auto">
            <table className="w-full border-collapse text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-600">菜单模块</th>
                  {ROLE_DEFINITIONS.map((role) => (
                    <th
                      key={role.id}
                      className={clsx(
                        "whitespace-nowrap px-4 py-2 text-center text-xs font-bold uppercase tracking-wider",
                        role.id === activeRoleId ? "bg-primary-50 text-primary-700" : "text-gray-600"
                      )}
                    >
                      {role.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visibleMenus.map((item) => (
                  <tr key={item.id} className="bg-gray-50/70">
                    <td className="px-4 py-2 text-sm font-bold text-gray-900">{item.label}</td>
                    {ROLE_DEFINITIONS.map((role) => (
                      <td key={role.id} className="px-4 py-2">
                        <AccessCell allowed={item.roles.includes(role.id)} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
