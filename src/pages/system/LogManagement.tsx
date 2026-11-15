import { useMemo, useState } from "react";
import { MagnifyingGlass, Scroll } from "@phosphor-icons/react";
import clsx from "clsx";
import StatusTag, { type StatusTone } from "../../components/product/StatusTag";
import { useSession } from "../../lib/auth";
import { STORES, getStoreName, getVisibleLogs, type LogResult } from "../../lib/org";
import { getRole, isGlobalRole, type RoleId } from "../../lib/rbac";

const resultTone: Record<LogResult, StatusTone> = {
  成功: "success",
  失败: "danger",
};

export default function LogManagement() {
  const session = useSession();
  const roleId: RoleId = session?.roleId ?? "store_staff";
  const isGlobal = isGlobalRole(roleId);

  const [keyword, setKeyword] = useState("");
  const [resultFilter, setResultFilter] = useState<"全部结果" | LogResult>("全部结果");
  const [storeFilter, setStoreFilter] = useState("全部门店");

  /** 全局角色可查看全部日志；门店角色仅可查看本店日志 */
  const scopedLogs = useMemo(() => getVisibleLogs(roleId, session?.storeId), [roleId, session?.storeId]);

  const visibleLogs = useMemo(
    () =>
      scopedLogs.filter((log) => {
        const matchKeyword =
          keyword.trim().length === 0 ||
          log.actor.includes(keyword.trim()) ||
          log.action.includes(keyword.trim()) ||
          log.target.includes(keyword.trim());
        const matchResult = resultFilter === "全部结果" || log.result === resultFilter;
        const matchStore = storeFilter === "全部门店" || log.storeId === storeFilter;
        return matchKeyword && matchResult && matchStore;
      }),
    [keyword, resultFilter, scopedLogs, storeFilter]
  );

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="flex flex-none flex-wrap items-center justify-between gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 card-shadow">
        <div className="text-sm text-gray-600">
          {isGlobal ? (
            <>
              当前以 <span className="font-bold text-gray-900">{getRole(roleId).label}</span> 身份查看
              <span className="font-bold text-gray-900"> 全部门店 </span>
              的登录与操作日志，用于安全审计与问题追溯。
            </>
          ) : (
            <>
              当前以 <span className="font-bold text-gray-900">{getRole(roleId).label}</span> 身份仅可查看
              <span className="font-bold text-gray-900"> {session?.storeName} </span>
              的日志，系统级配置与账号变更日志不对门店开放。
            </>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
          <Scroll weight="duotone" className="text-base" />
          日志只追加、不可编辑
        </div>
      </div>

      {/* 筛选 */}
      <div className="flex flex-none flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
        <div className="relative">
          <MagnifyingGlass weight="bold" className="absolute left-3 top-2.5 text-gray-400" />
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜索操作者 / 操作 / 对象..."
            className="w-64 rounded-lg border border-gray-200 py-2 pl-9 pr-4 text-sm transition focus:border-primary-500 focus:outline-none"
          />
        </div>
        <select
          value={resultFilter}
          onChange={(event) => setResultFilter(event.target.value as "全部结果" | LogResult)}
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 focus:border-primary-500 focus:outline-none"
        >
          <option value="全部结果">全部结果</option>
          <option value="成功">成功</option>
          <option value="失败">失败</option>
        </select>
        {isGlobal && (
          <select
            value={storeFilter}
            onChange={(event) => setStoreFilter(event.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 focus:border-primary-500 focus:outline-none"
          >
            <option value="全部门店">全部门店</option>
            <option value="无门店归属">总部 / 全局操作</option>
            {STORES.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* 日志列表 */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse text-left">
            <thead className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-600">时间</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-600">操作者</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-600">门店</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-600">操作</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-600">操作对象</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-600">结果</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visibleLogs.map((log) => {
                const role = getRole(log.roleId);
                return (
                  <tr key={log.id} className="transition-colors hover:bg-slate-50">
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-500">{log.at}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800">{log.actor}</span>
                        <span className={clsx("rounded-md border px-1.5 py-0.5 text-[10px] font-bold", role.tone)}>
                          {role.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {log.storeId ? getStoreName(log.storeId) : <span className="text-gray-400">总部 / 全局</span>}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-700">{log.action}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{log.target}</td>
                    <td className="px-4 py-3">
                      <StatusTag status={log.result} tone={resultTone[log.result]} />
                    </td>
                  </tr>
                );
              })}
              {visibleLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-sm text-gray-400">
                    没有符合条件的日志
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex-none border-t border-gray-100 px-4 py-2 text-xs text-gray-400">
          共 {visibleLogs.length} 条日志 · 账号变更、门店状态、库存与关键业务操作均会记录
        </div>
      </div>
    </div>
  );
}
