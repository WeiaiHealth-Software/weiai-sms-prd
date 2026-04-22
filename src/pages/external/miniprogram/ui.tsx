import { type ComponentPropsWithoutRef, type ReactNode } from "react";
import clsx from "clsx";

type SvgProps = ComponentPropsWithoutRef<"svg">;

export function MiniBackIcon({ className, ...props }: SvgProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={clsx("w-5 h-5", className)}
      {...props}
    >
      <path d="M15.5 19.25 8.25 12l7.25-7.25" />
    </svg>
  );
}

export function MiniHomeIcon({ className, ...props }: SvgProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={clsx("w-6 h-6", className)}
      {...props}
    >
      <path d="M12 3.2a1.3 1.3 0 0 1 .86.33l7.65 6.71a1.3 1.3 0 0 1 .44.98v8.28a1.8 1.8 0 0 1-1.8 1.8H4.85a1.8 1.8 0 0 1-1.8-1.8v-8.28c0-.37.16-.72.44-.98l7.65-6.71A1.3 1.3 0 0 1 12 3.2Zm0 2.85-6.35 5.57v7.63h3.65v-5.1c0-.72.58-1.3 1.3-1.3h2.8c.72 0 1.3.58 1.3 1.3v5.1h3.65v-7.63L12 6.05Z" />
    </svg>
  );
}

export function MiniUserIcon({ className, ...props }: SvgProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={clsx("w-6 h-6", className)}
      {...props}
    >
      <path d="M12 12.15a4.65 4.65 0 1 1 0-9.3 4.65 4.65 0 0 1 0 9.3Zm0-2.1a2.55 2.55 0 1 0 0-5.1 2.55 2.55 0 0 0 0 5.1Z" />
      <path d="M12 13.6c4.7 0 8.5 2.66 8.5 5.9 0 .83-.67 1.5-1.5 1.5h-14c-.83 0-1.5-.67-1.5-1.5 0-3.24 3.8-5.9 8.5-5.9Zm0 2.1c-3.52 0-6.2 1.85-6.4 3.3h12.8c-.2-1.45-2.88-3.3-6.4-3.3Z" />
    </svg>
  );
}

export function MiniGridIcon({ className, ...props }: SvgProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={clsx("w-6 h-6", className)}
      {...props}
    >
      <path d="M6.75 5.25h3A1.5 1.5 0 0 1 11.25 6.75v3A1.5 1.5 0 0 1 9.75 11.25h-3A1.5 1.5 0 0 1 5.25 9.75v-3A1.5 1.5 0 0 1 6.75 5.25ZM14.25 5.25h3A1.5 1.5 0 0 1 18.75 6.75v3A1.5 1.5 0 0 1 17.25 11.25h-3A1.5 1.5 0 0 1 12.75 9.75v-3A1.5 1.5 0 0 1 14.25 5.25ZM6.75 12.75h3A1.5 1.5 0 0 1 11.25 14.25v3A1.5 1.5 0 0 1 9.75 18.75h-3A1.5 1.5 0 0 1 5.25 17.25v-3A1.5 1.5 0 0 1 6.75 12.75ZM14.25 12.75h3A1.5 1.5 0 0 1 18.75 14.25v3A1.5 1.5 0 0 1 17.25 18.75h-3A1.5 1.5 0 0 1 12.75 17.25v-3A1.5 1.5 0 0 1 14.25 12.75Z" />
    </svg>
  );
}

export function MiniTopBar({
  title,
  onBack,
  rightSlot,
}: {
  title: string;
  onBack: () => void;
  rightSlot?: ReactNode;
}) {
  return (
    <div className="bg-white px-3 py-2.5 flex items-center justify-between z-10 sticky top-0 border-b border-gray-100 min-h-[44px] relative">
      <div className="flex-1 flex">
        <button 
          onClick={onBack} 
          className="w-10 h-10 flex items-center justify-center -ml-1 text-gray-800 active:bg-gray-50 rounded-full transition-colors"
          aria-label="返回"
        >
          <MiniBackIcon className="w-5 h-5" />
        </button>
      </div>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <h2 className="font-bold text-[17px] text-gray-900 tracking-wide">{title}</h2>
      </div>
      <div className="flex-1"></div>
      {rightSlot && (
        <div className="flex-1 flex justify-end">
          {rightSlot}
        </div>
      )}
    </div>
  );
}

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

      {/* Center Button */}
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
