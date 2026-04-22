
import { Gear, X, Television, PaintBucket, UsersThree, LockKey, ArrowRight } from "@phosphor-icons/react";
import clsx from "clsx";

export function SettingsDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const switchTheme = (_theme: string) => {
    // Theme switching logic can be implemented later
  };

  return (
    <>
      <div
        onClick={onClose}
        className={clsx(
          "fixed inset-0 bg-black/20 z-[60] transition-opacity duration-300 backdrop-blur-sm",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none hidden"
        )}
      ></div>
      <div
        className={clsx(
          "fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-[70] transform transition-transform duration-300 flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Gear weight="duotone" className="text-primary-600" /> 系统设置
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition"
          >
            <X weight="bold" className="text-lg" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 bg-white">
          {/* Card to link to screen-list.html */}
          <a
            href="#"
            className="block bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-primary-200 transition group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition">
              <Television weight="duotone" className="text-6xl text-primary-500" />
            </div>
            <div className="flex items-start gap-4 mb-3 relative z-10">
              <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center flex-none">
                <Television weight="duotone" className="text-2xl" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg group-hover:text-primary-600 transition">诊室列表大屏</h3>
                <p className="text-xs text-gray-500 mt-1">大厅/走廊综合显示屏</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 relative z-10 leading-relaxed">
              点击查看所有诊室的实时排队叫号状态，支持大屏展示模式。
            </p>
            <div className="mt-4 flex items-center text-primary-600 text-sm font-bold opacity-0 group-hover:opacity-100 transition transform translate-x-[-10px] group-hover:translate-x-0">
              打开大屏 <ArrowRight weight="bold" className="ml-1" />
            </div>
          </a>

          {/* Placeholder for future settings */}
          <div className="mt-8">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">更多设置</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <PaintBucket weight="duotone" className="text-primary-500 text-xl" />
                  <span className="text-gray-900 font-medium">主题外观</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => switchTheme("forest")}
                    className="w-6 h-6 rounded-full bg-[#15803d] ring-2 ring-offset-2 ring-transparent hover:ring-gray-200 focus:ring-[#15803d] transition"
                    title="松林绿"
                  ></button>
                  <button
                    onClick={() => switchTheme("blue")}
                    className="w-6 h-6 rounded-full bg-[#3b82f6] ring-2 ring-offset-2 ring-transparent hover:ring-gray-200 focus:ring-[#3b82f6] transition"
                    title="科技蓝"
                  ></button>
                  <button
                    onClick={() => switchTheme("purple")}
                    className="w-6 h-6 rounded-full bg-[#a855f7] ring-2 ring-offset-2 ring-transparent hover:ring-gray-200 focus:ring-[#a855f7] transition"
                    title="优雅紫"
                  ></button>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 opacity-50 cursor-not-allowed">
                <div className="flex items-center gap-3">
                  <UsersThree weight="duotone" className="text-gray-400 text-xl" />
                  <span className="text-gray-500 font-medium">账号权限</span>
                </div>
                <LockKey weight="bold" className="text-gray-300" />
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-gray-100 bg-gray-50 text-center text-xs text-gray-400">
          EyeSight Management System v1.0.0
        </div>
      </div>
    </>
  );
}
