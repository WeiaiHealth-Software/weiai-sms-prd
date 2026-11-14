import clsx from "clsx";

type InfoRowProps = {
  label: string;
  value: React.ReactNode;
  labelClassName?: string;
  valueClassName?: string;
};

/** 详情 / 只读信息的「标签 : 值」行（表单、详情弹窗、ERP 引用卡共用） */
export default function InfoRow({ label, value, labelClassName, valueClassName }: InfoRowProps) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className={clsx("w-32 flex-none text-slate-400", labelClassName)}>{label}</span>
      <span className={clsx("min-w-0 flex-1 break-all font-medium text-slate-700", valueClassName)}>{value}</span>
    </div>
  );
}
