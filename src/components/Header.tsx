
import { Bell, Gear, CaretRight } from "@phosphor-icons/react";
import { useLocation } from "react-router";
import { menuConfig } from "../config/menu";

export function Header({ toggleSettings }: { toggleSettings: () => void }) {
  const location = useLocation();

  let title = "仪表盘";
  let subTitle = null;

  for (const item of menuConfig) {
    if (item.path === location.pathname) {
      title = item.label;
      break;
    }
    const sub = item.subs.find((s) => location.pathname === s.path);
    if (sub) {
      title = item.label;
      subTitle = sub.label;
      break;
    }
  }

  return (
    <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-6 lg:px-8 flex-none z-40">
      {/* Left: Breadcrumb / Title */}
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <div className="flex items-center gap-1">
          {subTitle && (
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <CaretRight weight="bold" className="text-xs" />
              <span className="text-gray-900">{subTitle}</span>
            </div>
          )}
        </div>
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
