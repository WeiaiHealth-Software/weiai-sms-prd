import { useState } from "react";

import { Link, useLocation, useNavigate } from "react-router";
import { menuConfig } from "../config/menu";
import { ArrowsClockwise, ArrowLineLeft, ArrowLineRight, CaretDown } from "@phosphor-icons/react";
import clsx from "clsx";

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(["store_mgmt"]));

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const toggleMenu = (id: string) => {
    setExpandedMenus((prev: Set<string>) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const isL1Active = (item: any) => {
    if (item.path === "/") return location.pathname === "/";
    if (item.subs.length === 0) return location.pathname === item.path;
    return location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
  };

  return (
    <aside
      className={clsx(
        "bg-white border-r border-gray-200 flex-none flex flex-col transition-all duration-300 z-50",
        isCollapsed ? "w-20" : "w-76"
      )}
    >
      {/* Logo Area */}
      <div className="h-20 flex items-center px-6 border-b border-gray-100 flex-none">
        <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
          <div className="w-8 h-8 flex-none text-primary-500">
            <svg
              className="w-full h-full"
              viewBox="0 0 1024 1024"
              fill="currentColor"
            >
              <path d="M512.047072 64.62588c-246.254543 0-445.883163 199.62862-445.883163 445.883163s199.62862 445.883163 445.883163 445.883163 445.883163-199.62862 445.883163-445.883163S758.301616 64.62588 512.047072 64.62588zM641.561821 743.301993 368.898815 743.301993c-119.712499-34.183544-77.214593-200.275349-77.214593-200.275349 26.542516 67.160609 86.865393 67.354014 86.865393 67.354014l258.052241 2.412956c74.93569-8.55791 103.890138-72.179926 103.890138-72.178903C777.789459 754.964614 641.561821 743.301993 641.561821 743.301993zM690.974207 538.254967c-67.562768-0.00614-91.692329-82.09474-91.692329-82.09474s0.343831 80.419588-86.119403 82.013899l0 0.070608c-0.384763 0-0.73678-0.030699-1.11745-0.034792-0.381693 0.004093-0.732687 0.033769-1.11745 0.034792l0-0.070608c-86.462211-1.593288-86.119403-82.013899-86.119403-82.013899s-24.12956 82.0886-91.692329 82.09474c-103.756085 0.00921-82.039481-84.506672-82.039481-84.506672l16.987906-120.937396c0 0 2.338255-47.591925 36.097126-55.207369L510.930645 277.603529l2.232854 0 206.765157 0c33.759895 7.615445 36.097126 55.207369 36.097126 55.207369l16.987906 120.937396C773.014712 453.748295 794.730293 538.263154 690.974207 538.254967z"></path>
            </svg>
          </div>
          {!isCollapsed && (
            <span className="font-bold text-2xl text-gray-900 tracking-tight">
              惟爱 · 门店管理系统
            </span>
          )}
        </div>
      </div>

      {/* Menu Area */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {menuConfig.map((item) => {
          const hasSubs = item.subs.length > 0;
          const isActive = isL1Active(item);
          const isExpanded = expandedMenus.has(item.id);
          const isExactL1 = location.pathname === item.path && !hasSubs;

          return (
            <div key={item.id} className="mb-1">
              <button
                onClick={() => {
                  if (hasSubs) toggleMenu(item.id);
                  else navigate(item.path);
                }}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2.5 transition-colors duration-200 group w-full text-left border-l-4",
                  isExactL1
                    ? "bg-primary-50 text-primary-600 border-primary-500"
                    : isActive
                    ? "bg-transparent text-gray-900 border-transparent"
                    : isExpanded
                    ? "text-gray-700 bg-gray-50/60 border-transparent"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-transparent"
                )}
                title={isCollapsed ? item.label : ""}
              >
                <item.icon
                  weight="bold"
                  className={clsx(
                    "text-xl flex-none",
                    isActive ? "text-primary-600" : "text-gray-400 group-hover:text-gray-600"
                  )}
                />
                {!isCollapsed && (
                  <span
                    className={clsx(
                      "font-medium whitespace-nowrap flex-1",
                      isExactL1
                        ? "text-primary-600 font-semibold"
                        : isActive
                        ? "text-gray-900 font-medium"
                        : "text-inherit"
                    )}
                  >
                    {item.label}
                  </span>
                )}
                {hasSubs && !isCollapsed && (
                  <CaretDown
                    weight="bold"
                    className={clsx(
                      "text-xs text-gray-400 transition-transform",
                      isExpanded && "rotate-180"
                    )}
                  />
                )}
              </button>

              {hasSubs && isExpanded && !isCollapsed && (
                <div className="ml-4 pl-4 border-l border-gray-200 space-y-1 mt-1">
                  {item.subs.map((sub) => {
                    const isSubActive =
                      location.pathname === sub.path ||
                      location.pathname.startsWith(`${sub.path}/`) ||
                      (sub.path === "/crm/client-list" && location.pathname.startsWith("/crm/client/"));
                    return (
                      <Link
                        key={sub.id}
                        to={sub.path}
                        className={clsx(
                          "block w-full text-left px-3 py-2 text-sm transition-colors border-l-2",
                          isSubActive
                            ? "border-primary-500 text-primary-700 font-semibold bg-primary-50"
                            : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50 hover:border-primary-300"
                        )}
                      >
                        {sub.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Area */}
      <div
        className={clsx(
          "p-4 border-t border-gray-100 flex-none flex items-center",
          isCollapsed ? "justify-center" : "justify-between"
        )}
      >
        {!isCollapsed && (
          <div className="flex items-center gap-3 overflow-hidden transition-all duration-300 ease-in-out">
            <button className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:text-primary-600 hover:border-primary-200 hover:bg-primary-50 transition flex-none shadow-sm bg-white group">
              <ArrowsClockwise
                weight="bold"
                className="text-lg group-hover:rotate-180 transition-transform duration-500"
              />
            </button>
            <div className="flex flex-col whitespace-nowrap overflow-hidden">
              <span className="font-normal text-gray-900 text-sm leading-none">v1.0.0</span>
              <span className="text-xs text-gray-400 mt-1 font-mono">ReactVer</span>
            </div>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition flex-none"
        >
          {isCollapsed ? (
            <ArrowLineRight weight="bold" className="text-xl" />
          ) : (
            <ArrowLineLeft weight="bold" className="text-xl" />
          )}
        </button>
      </div>
    </aside>
  );
}
