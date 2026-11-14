import clsx from "clsx";

export type StatusTone = "success" | "danger" | "warning" | "primary" | "neutral";

const toneClass: Record<StatusTone, string> = {
  success: "border-emerald-100 bg-emerald-50 text-emerald-700",
  danger: "border-rose-100 bg-rose-50 text-rose-600",
  warning: "border-orange-100 bg-orange-50 text-orange-600",
  primary: "border-primary-100 bg-primary-50 text-primary-600",
  neutral: "border-slate-200 bg-slate-100 text-slate-600",
};

type StatusTagProps = {
  status: string;
  tone?: StatusTone;
  className?: string;
};

/**
 * 通用状态标签（浅底 + 深字 + 细边框）。
 * 同一业务状态跨页面必须同名同色，颜色语义见 DESIGN.md §7。
 */
export default function StatusTag({ status, tone = "neutral", className }: StatusTagProps) {
  return (
    <span className={clsx("inline-flex rounded-full border px-3 py-1 text-xs font-semibold", toneClass[tone], className)}>{status}</span>
  );
}
