import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Plus, Info } from "@phosphor-icons/react";
import Select, { type SelectOption } from "../../components/form/Select";
import ProductCell from "../../components/product/ProductCell";
import ValidityCell from "../../components/product/ValidityCell";
import {
  erpProducts,
  erpSkus,
  initialWarehouses,
  productCategoryOptions,
  getSkuTotalStock,
  getSkuWarehouseStock,
  type ErpProduct,
  type ProductCategory,
} from "./mockData";
import { getMergedProducts, getMergedSkus } from "./productStore";

type CategoryFilter = "全部分类" | ProductCategory;
type WarehouseFilter = "全部仓库" | string;

const categoryFilterOptions: SelectOption[] = ["全部分类", ...productCategoryOptions].map((item) => ({ value: item, label: item }));
const warehouseFilterOptions: SelectOption[] = [
  { value: "全部仓库", label: "全部仓库" },
  ...initialWarehouses.map((warehouse) => ({ value: warehouse.id, label: warehouse.name })),
];

export default function InventoryProductList() {
  const navigate = useNavigate();
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("全部分类");
  const [warehouseFilter, setWarehouseFilter] = useState<WarehouseFilter>("全部仓库");
  const [keyword, setKeyword] = useState("");

  // 商品档案由「新增 / 编辑商品」页面写入本地存储，这里读取合并结果
  const products = useMemo<ErpProduct[]>(() => getMergedProducts(erpProducts), []);
  const skus = useMemo(() => getMergedSkus(erpSkus), []);

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return products.filter((product) => {
      if (categoryFilter !== "全部分类" && product.category !== categoryFilter) return false;
      if (kw && !`${product.name} ${product.spuId} ${product.manufacturer} ${product.registrationNo}`.toLowerCase().includes(kw)) return false;
      return true;
    });
  }, [categoryFilter, keyword, products]);

  const skusOf = (spuId: string) => skus.filter((sku) => sku.spuId === spuId);

  function stockOf(spuId: string) {
    return skusOf(spuId).reduce(
      (sum, sku) => sum + (warehouseFilter === "全部仓库" ? getSkuTotalStock(sku) : getSkuWarehouseStock(sku, warehouseFilter)),
      0
    );
  }

  function priceRangeOf(spuId: string) {
    const prices = skusOf(spuId).map((sku) => sku.retailPrice);
    if (prices.length === 0) return "—";
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max ? `¥${min}` : `¥${min} ~ ¥${max}`;
  }

  function exportCsv() {
    const header = ["商品名称", "SPU 编码", "规格", "SKU 编码", "条码", "分类", "生产厂家", "有效期至", "注册证/备案号", "生产许可证号", "总库存", "成本价", "建议零售价", "状态"];
    const lines = filtered.flatMap((product) =>
      skusOf(product.spuId).map((sku) =>
        [
          product.name,
          product.spuId,
          product.specAttributes.map((attr) => `${attr} ${sku.specValues[attr] ?? ""}`).join(" / "),
          sku.skuId,
          sku.barcode,
          product.category,
          product.manufacturer,
          product.validityTo,
          product.registrationNo,
          product.productionLicenseNo,
          getSkuTotalStock(sku),
          sku.costPrice,
          sku.retailPrice,
          sku.status,
        ]
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(",")
      )
    );
    const csv = "\uFEFF" + [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ERP商品库_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-full flex flex-col gap-4">
      <div className="bg-white rounded-2xl card-shadow border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100">
          <div className="flex flex-col gap-3 p-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
              <Select
                value={categoryFilter}
                onChange={(value) => setCategoryFilter(value as CategoryFilter)}
                options={categoryFilterOptions}
                className="min-w-[140px]"
                triggerClassName="h-[46px] rounded-2xl border-gray-200 px-4"
              />
              <Select
                value={warehouseFilter}
                onChange={(value) => setWarehouseFilter(value)}
                options={warehouseFilterOptions}
                className="min-w-[150px]"
                triggerClassName="h-[46px] rounded-2xl border-gray-200 px-4"
              />
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="搜索商品名称 / SPU 编码 / 厂家 / 注册证号"
                className="h-[46px] w-full max-w-[320px] rounded-2xl border border-gray-200 bg-white px-4 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
              />
            </div>
            <div className="flex items-center justify-end gap-3">
              <span aria-hidden="true" className="hidden h-6 w-px bg-gray-200 xl:block"></span>
              <button
                className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                onClick={exportCsv}
              >
                导出商品库
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-2xl bg-primary-500 px-4 py-3 text-sm font-semibold text-white hover:bg-primary-600 active:bg-primary-700"
                onClick={() => navigate("/inventory/product/new")}
              >
                <Plus weight="bold" className="h-4 w-4" />
                新增商品
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 border-t border-gray-100 bg-slate-50/60 px-4 py-2.5 text-xs text-slate-500">
            <Info weight="bold" className="h-4 w-4 flex-none text-primary-500" />
            一个商品（SPU）可包含多个 SKU（规格）；库存与价格以 SKU 为准，商城上架按 SKU 引用本库。
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1020px] table-fixed text-center">
            <colgroup>
              <col className="w-[24%]" />
              <col className="w-[10%]" />
              <col className="w-[13%]" />
              <col className="w-[11%]" />
              <col className="w-[10%]" />
              <col className="w-[13%]" />
              <col className="w-[9%]" />
            </colgroup>
            <thead className="bg-gray-50 text-xs uppercase tracking-[0.18em] text-gray-400">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">商品</th>
                <th className="px-4 py-3 text-center font-semibold">分类</th>
                <th className="px-4 py-3 text-center font-semibold">有效期</th>
                <th className="px-4 py-3 text-center font-semibold">库存</th>
                <th className="px-4 py-3 text-center font-semibold">SKU</th>
                <th className="px-4 py-3 text-center font-semibold">零售价</th>
                <th className="px-4 py-3 text-center font-semibold">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filtered.map((product) => (
                <tr key={product.spuId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-left">
                    <ProductCell name={product.name} image={product.images[0]} subtitle={<span>{product.spuId}</span>} />
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">{product.category}</td>
                  <td className="px-4 py-3">
                    <ValidityCell validityTo={product.validityTo} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-base font-bold text-gray-900">{stockOf(product.spuId)}</span>
                      <span className="text-[11px] text-slate-400">
                        {warehouseFilter === "全部仓库" ? `共 ${initialWarehouses.length} 仓合计` : "当前仓库"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                      {skusOf(product.spuId).length} 个规格
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-gray-900">{priceRangeOf(product.spuId)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      <button
                        className="rounded-md bg-primary-50 px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-100 hover:text-primary-700"
                        onClick={() => navigate(`/inventory/product/${product.spuId}/edit`)}
                      >
                        编辑档案
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-sm text-gray-400">
                    暂无符合条件的商品
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-sm text-gray-500">
          <div>共 {filtered.length} 件商品 · {filtered.reduce((sum, product) => sum + skusOf(product.spuId).length, 0)} 个 SKU</div>
        </div>
      </div>
    </div>
  );
}
