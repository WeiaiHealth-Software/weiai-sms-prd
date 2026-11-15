import clsx from "clsx";

export type StatusTone =
  | "success"
  | "danger"
  | "warning"
  | "primary"
  | "neutral"
  | "blue"
  | "cyan"
  | "green"
  | "teal"
  | "violet"
  | "orange"
  | "amber"
  | "rose";

const toneClass: Record<StatusTone, string> = {
  success: "border-emerald-100 bg-emerald-50 text-emerald-700",
  danger: "border-rose-100 bg-rose-50 text-rose-600",
  warning: "border-orange-100 bg-orange-50 text-orange-600",
  primary: "border-primary-100 bg-primary-50 text-primary-600",
  neutral: "border-slate-200 bg-slate-100 text-slate-600",
  blue: "border-blue-100 bg-blue-50 text-blue-700",
  cyan: "border-cyan-100 bg-cyan-50 text-cyan-700",
  green: "border-green-100 bg-green-50 text-green-700",
  teal: "border-teal-100 bg-teal-50 text-teal-700",
  violet: "border-violet-100 bg-violet-50 text-violet-700",
  orange: "border-orange-100 bg-orange-50 text-orange-700",
  amber: "border-amber-100 bg-amber-50 text-amber-700",
  rose: "border-rose-100 bg-rose-50 text-rose-700",
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
