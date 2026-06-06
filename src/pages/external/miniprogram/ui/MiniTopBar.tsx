import type { ReactNode } from "react";
import { MiniBackIcon } from "./icons";

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
      {rightSlot && <div className="flex-1 flex justify-end items-center">{rightSlot}</div>}
    </div>
  );
}

