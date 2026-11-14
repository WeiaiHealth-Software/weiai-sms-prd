// 库存管理 · 商品档案本地存储
//
// 商品列表与商品档案表单（新增 / 编辑）是两个独立路由，需要一个跨路由共享的持久层。
// 这里只保存「被改动过的 SPU」覆盖记录，其余仍由 mockData 提供，避免复制全量数据。

import type { ErpProduct, ErpSku } from "./mockData";

const STORAGE_KEY = "weiai.erp.productOverrides";

export type ProductOverride = {
  product: ErpProduct;
  skus: ErpSku[];
};

type OverrideMap = Record<string, ProductOverride>;

function readOverrides(): OverrideMap {
  if (typeof window === "undefined") return {};
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}") as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as OverrideMap) : {};
  } catch {
    return {};
  }
}

/** 保存一个 SPU 及其全部 SKU 的覆盖记录；新增与编辑共用同一个入口。 */
export function saveProductOverride(product: ErpProduct, skus: ErpSku[]) {
  const next: OverrideMap = { ...readOverrides(), [product.spuId]: { product, skus } };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

/** 商品列表 = mock 中未改动的 SPU 原地替换为覆盖数据，新增的 SPU 追加在末尾。 */
export function getMergedProducts(mockProducts: ErpProduct[]): ErpProduct[] {
  const overrides = readOverrides();
  const mockIds = new Set(mockProducts.map((item) => item.spuId));
  return [
    ...mockProducts.map((item) => overrides[item.spuId]?.product ?? item),
    ...Object.values(overrides)
      .filter((item) => !mockIds.has(item.product.spuId))
      .map((item) => item.product),
  ];
}

/** SKU 列表与商品列表口径一致：覆盖过的 SPU 用覆盖数据，其余仍用 mock。 */
export function getMergedSkus(mockSkus: ErpSku[]): ErpSku[] {
  const overrides = readOverrides();
  return [
    ...mockSkus.filter((sku) => !overrides[sku.spuId]),
    ...Object.values(overrides).flatMap((item) => item.skus),
  ];
}

/** 生成下一个 SPU 编码，取现有最大序号 +1，避免改动后编码重复。 */
export function nextSpuId(products: ErpProduct[]): string {
  const max = products.reduce((acc, item) => {
    const matched = /^SPU-(\d+)$/.exec(item.spuId);
    return matched ? Math.max(acc, Number(matched[1])) : acc;
  }, 1000);
  return `SPU-${max + 1}`;
}

export function getMergedProductMap(mockProducts: ErpProduct[]): Record<string, ErpProduct> {
  return Object.fromEntries(getMergedProducts(mockProducts).map((item) => [item.spuId, item]));
}

export function getMergedSkuMap(mockSkus: ErpSku[]): Record<string, ErpSku> {
  return Object.fromEntries(getMergedSkus(mockSkus).map((item) => [item.skuId, item]));
}
