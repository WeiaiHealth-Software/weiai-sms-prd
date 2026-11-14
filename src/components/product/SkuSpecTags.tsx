import clsx from "clsx";
import { erpProductMap, type ErpSku } from "../../pages/inventory/mockData";

type SkuSpecTagsProps = {
  sku: ErpSku;
  /** 指定规格属性顺序；缺省时取商品档案的 specAttributes */
  attributes?: string[];
  /** vertical（表格列，纵向堆叠）/ horizontal（行内排布） */
  direction?: "vertical" | "horizontal";
  /** 在标签组末尾追加 SKU 编码 */
  showSkuId?: boolean;
  className?: string;
};

/** SKU 规格标签组：把「度数 -1.00D / 片型 标准片」拆成一个个 Tag */
export default function SkuSpecTags({ sku, attributes, direction = "vertical", showSkuId, className }: SkuSpecTagsProps) {
  const attrs = attributes ?? erpProductMap[sku.spuId]?.specAttributes ?? Object.keys(sku.specValues);
  return (
    <div className={clsx("flex gap-1.5", direction === "vertical" ? "flex-col items-start" : "flex-wrap items-center", className)}>
      {attrs.map((attr) => (
        <span
          key={attr}
          className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-medium text-slate-600"
        >
          {attr} {sku.specValues[attr] ?? "—"}
        </span>
      ))}
      {showSkuId ? <span className="text-[11px] text-slate-400">{sku.skuId}</span> : null}
    </div>
  );
}
