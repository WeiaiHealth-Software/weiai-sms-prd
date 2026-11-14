import { Plus } from "@phosphor-icons/react";
import Select, { type SelectOption } from "../form/Select";
import { erpProducts, getSkuSpecText, type ErpSku } from "../../pages/inventory/mockData";
import { getMergedProductMap } from "../../pages/inventory/productStore";

/** 把 SKU 列表转成下拉选项：标签格式「商品名称 · 规格」 */
function buildSkuOptions(skus: ErpSku[]): SelectOption[] {
  const productMap = getMergedProductMap(erpProducts);
  return skus.map((sku) => ({
    value: sku.skuId,
    label: `${productMap[sku.spuId]?.name ?? sku.spuId} · ${getSkuSpecText(sku)}`,
  }));
}

type SkuSelectProps = {
  value: string;
  onChange: (value: string) => void;
  /** 直接传 SKU 列表，组件内部生成选项 */
  skus?: ErpSku[];
  /** 或直接传已构建好的选项 */
  options?: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  dropdownClassName?: string;
  searchable?: boolean;
  /** 提供后，下拉底部出现「去新建商品档案」入口（入库等场景只允许引用已有 SKU） */
  onCreateNew?: () => void;
  createNewLabel?: string;
};

/**
 * SKU 选择器。
 * 入库 / 出库 / 商城上架等场景共用同一套选项文案与「跳转建档」引导。
 */
export default function SkuSelect({
  value,
  onChange,
  skus,
  options,
  placeholder = "请选择 SKU",
  disabled,
  className,
  triggerClassName,
  dropdownClassName,
  searchable = true,
  onCreateNew,
  createNewLabel = "去新建商品档案",
}: SkuSelectProps) {
  const resolvedOptions = options ?? (skus ? buildSkuOptions(skus) : []);
  return (
    <Select
      value={value}
      onChange={onChange}
      options={resolvedOptions}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      triggerClassName={triggerClassName}
      dropdownClassName={dropdownClassName}
      searchable={searchable}
      searchPlaceholder="搜索商品名称 / 规格"
      footer={
        onCreateNew ? (
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={onCreateNew}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-primary-600 hover:bg-primary-50"
          >
            <Plus weight="bold" className="h-3.5 w-3.5" />
            {createNewLabel}
          </button>
        ) : undefined
      }
    />
  );
}
