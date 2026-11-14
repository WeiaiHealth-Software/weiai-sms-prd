import clsx from "clsx";

type ProductCellProps = {
  /** 商品名称，用于取首字作为缩略图占位 */
  name: string;
  /** 缩略图（有图显示图片，无图显示名称首字） */
  image?: string;
  /** 副标题：如「SPU-1001 · 惟爱线上商城」 */
  subtitle?: React.ReactNode;
  titleClassName?: string;
  className?: string;
};

/** 列表「商品」列：缩略图 + 主标题 + 副标题（三处列表共用） */
export default function ProductCell({ name, image, subtitle, titleClassName, className }: ProductCellProps) {
  return (
    <div className={clsx("flex items-center gap-3", className)}>
      <div className="flex h-12 w-12 flex-none items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-primary-50 to-slate-100 text-base font-bold text-primary-600">
        {image ? <img src={image} alt={name} className="h-full w-full object-cover" /> : name.slice(0, 1) || "?"}
      </div>
      <div className="min-w-0">
        <div className={clsx("truncate font-semibold text-gray-900", titleClassName)}>{name}</div>
        {subtitle ? <div className="mt-0.5 truncate text-xs text-gray-500">{subtitle}</div> : null}
      </div>
    </div>
  );
}
