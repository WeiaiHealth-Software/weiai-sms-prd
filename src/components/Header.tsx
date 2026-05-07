
import { Bell, Gear, CaretRight } from "@phosphor-icons/react";
import { useLocation } from "react-router";
import { menuConfig } from "../config/menu";

export function Header({ toggleSettings }: { toggleSettings: () => void }) {
  const location = useLocation();

  const pathname = location.pathname;
  const matchedItem =
    menuConfig.find((item) => (item.path === "/" ? pathname === "/" : pathname === item.path || pathname.startsWith(`${item.path}/`))) ??
    menuConfig[0];

  const matchedSub =
    matchedItem.subs.find((s) => pathname === s.path || pathname.startsWith(`${s.path}/`)) ??
    (matchedItem.id === "crm" && pathname.startsWith("/crm/client/") ? matchedItem.subs.find((s) => s.path === "/crm/client-list") : null);

  const crmPageMeta = (() => {
    if (matchedItem.id !== "crm") return null;
    if (pathname === "/crm/client-list") return null;
    if (/^\/crm\/client\/[^/]+$/.test(pathname))
      return { label: "客户档案详情", desc: "查看客户主档信息与就诊/预约/回访等记录。" };
    if (/^\/crm\/client\/[^/]+\/visit\/new$/.test(pathname))
      return { label: "新增就诊记录", desc: "为客户录入本次就诊信息、诊断与处理建议。" };
    if (/^\/crm\/client\/[^/]+\/followup\/new$/.test(pathname))
      return { label: "发起回访", desc: "创建回访任务，设置项目类型、复查日期与负责人。" };
    return null;
  })();

  const title = matchedItem.label;
  const subTitle = crmPageMeta?.label ?? matchedSub?.label ?? null;
  const desc = crmPageMeta?.desc ?? null;

  return (
    <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-6 lg:px-8 flex-none z-40">
      {/* Left: Breadcrumb / Title */}
      <div className="min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-xl font-bold text-gray-900 whitespace-nowrap">{title}</h2>
          {subTitle && (
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500 min-w-0">
              <CaretRight weight="bold" className="text-xs flex-none" />
              <span className="text-gray-900 truncate">{subTitle}</span>
            </div>
          )}
        </div>
        {desc && <div className="mt-0.5 text-xs text-gray-500 truncate">{desc}</div>}
      </div>

      {/* Right: Actions & User */}
      <div className="flex items-center gap-4">
        <div className="h-6 w-px bg-gray-200 mx-2"></div>

        {/* Notification */}
        <button className="relative text-gray-500 hover:text-gray-700 transition">
          <Bell weight="bold" className="text-xl" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* Settings */}
        <button
          onClick={toggleSettings}
          className="text-gray-500 hover:text-gray-700 transition"
          title="系统设置"
        >
          <Gear weight="bold" className="text-xl" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-2 cursor-pointer hover:opacity-80 transition">
          <img
            className="h-8 w-8 rounded-full object-cover border border-gray-200 shadow-sm"
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            alt="User"
          />
          <div className="hidden lg:block leading-tight">
            <p className="font-bold text-sm text-gray-900">张店长</p>
            <p className="text-gray-500 text-[10px]">北京旗舰店</p>
          </div>
        </div>
      </div>
    </header>
  );
}
