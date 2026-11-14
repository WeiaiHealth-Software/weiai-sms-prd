import clsx from "clsx";
import { getValidityWarn } from "../../lib/validity";

/** 有效期单元格：日期 + 临期 / 已过期预警标签 */
export default function ValidityCell({ validityTo }: { validityTo: string }) {
  if (!validityTo) return <span className="text-sm text-gray-400">—</span>;
  const warn = getValidityWarn(validityTo);
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-sm text-gray-700">{validityTo}</span>
      {warn.level !== "normal" && (
        <span
          className={clsx(
            "inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold",
            warn.level === "expired" ? "bg-rose-50 text-rose-600" : "bg-orange-50 text-orange-600"
          )}
        >
          {warn.label}
          {warn.level === "soon" ? ` · ${warn.days}天` : ""}
        </span>
      )}
    </div>
  );
}
