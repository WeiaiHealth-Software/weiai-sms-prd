import clsx from "clsx";
import { MiniGridIcon, MiniHomeIcon, MiniUserIcon } from "./icons";

export function MiniTabBar({
  active,
  onChange,
  onCenter,
}: {
  active: "home" | "profile";
  onChange: (t: "home" | "profile") => void;
  onCenter: () => void;
}) {
  const activeColor = "text-[#07C160]";
  const idleColor = "text-gray-400";

  return (
    <div className="bg-white border-t border-gray-200 flex justify-between items-end px-4 pb-6 pt-2 z-40 shrink-0 shadow-[0_-1px_3px_rgba(0,0,0,0.02)] relative">
      <button
        type="button"
        onClick={() => onChange("home")}
        className={clsx(
          "flex-1 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors",
          active === "home" ? activeColor : idleColor
        )}
        aria-label="首页"
      >
        <MiniHomeIcon className="w-6 h-6" />
        <span className="text-[10px] font-medium tracking-wide">首页</span>
      </button>

      <div className="w-20 relative flex justify-center pointer-events-none">
        <button
          type="button"
          onClick={onCenter}
          className="absolute bottom-2 pointer-events-auto w-[52px] h-[52px] rounded-full bg-[#07C160] border-[4px] border-white shadow-[0_4px_12px_rgba(7,193,96,0.3)] flex items-center justify-center text-white active:scale-95 transition-transform"
          aria-label="中间按钮"
        >
          <MiniGridIcon className="w-7 h-7" />
        </button>
      </div>

      <button
        type="button"
        onClick={() => onChange("profile")}
        className={clsx(
          "flex-1 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors",
          active === "profile" ? activeColor : idleColor
        )}
        aria-label="个人中心"
      >
        <MiniUserIcon className="w-6 h-6" />
        <span className="text-[10px] font-medium tracking-wide">个人中心</span>
      </button>
    </div>
  );
}

