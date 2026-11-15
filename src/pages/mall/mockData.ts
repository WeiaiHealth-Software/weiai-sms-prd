// 商城管理 · 数据层
//
// 架构约定（商品中心 + 商城上架层）：
// - 商品主数据（SPU）与 SKU、库存统一由「库存管理（ERP）」提供，见 ../inventory/mockData，商城侧只读引用。
// - MallListing 为商城上架记录，通过 skuId 引用 SKU，承载商城专属字段（售价、上架数量等）。
// - 商城只负责「上架哪个 SKU、上架多少」，不持有库存；ERP 库存是唯一口径。

import {
  erpProductMap,
  erpProducts,
  erpSkuMap,
  erpSkus,
  initialWarehouses,
  getSkuTotalStock,
  getSkuWarehouseStock,
  getSkuSpecText,
  getValidityWarn,
  type ErpSku,
} from "../inventory/mockData";

export {
  erpProducts,
  erpProductMap,
  erpSkus,
  erpSkuMap,
  initialWarehouses,
  getSkuTotalStock,
  getSkuWarehouseStock,
  getSkuSpecText,
  getValidityWarn,
};
export type { ErpProduct, ErpSku, ProductCategory, Warehouse } from "../inventory/mockData";

/** 店铺（支持多店铺）。每个店铺绑定一个或多个发货仓库，用于确定货源与可上架库存口径。 */
export type Shop = {
  id: string;
  name: string;
  status: "启用" | "停用";
  remark: string;
  /** 绑定的发货仓库 id 列表（货源仓库） */
  warehouseIds: string[];
  /** 是否为默认店铺（默认店铺不可删除） */
  isDefault: boolean;
  createdAt: string;
};

export const initialShops: Shop[] = [
  {
    id: "SHOP-001",
    name: "惟爱线上商城",
    status: "启用",
    remark: "默认店铺，承载微信网页商城主链路。",
    warehouseIds: ["WH-001"],
    isDefault: true,
    createdAt: "2026-01-05",
  },
  {
    id: "SHOP-002",
    name: "惟爱华北旗舰店",
    status: "启用",
    remark: "覆盖华北区域，从北京仓发货。",
    warehouseIds: ["WH-002"],
    isDefault: false,
    createdAt: "2026-02-20",
  },
  {
    id: "SHOP-003",
    name: "惟爱华南旗舰店",
    status: "启用",
    remark: "覆盖华南区域，从广州仓发货。",
    warehouseIds: ["WH-003"],
    isDefault: false,
    createdAt: "2026-03-12",
  },
];

/** 商城上架记录（MallListing，商城管理维护）。粒度为一个 SKU。 */
export type MallListing = {
  skuId: string;
  /** 所属店铺 */
  shopId: string;
  status: "已上架" | "已下架";
  /** 商城售价（SKU 级） */
  mallPrice: number;
  /** 商城上架数量（可售库存），不得超过该 SKU 的可用量 */
  listedStock: number;
  /** 商城排序（数字越小越靠前） */
  sort: number;
  /** 资质信息是否对消费者可见 */
  showQualification: boolean;
  /** 产品展示图（多图） */
  gallery: string[];
  /** 商品详情富文本（占位为纯文本） */
  detail: string;
  updatedAt: string;
};

const detailTemplate = (name: string) => `${name} 商城详情页文案（占位）。此处后续接入富文本编辑器，支持图文混排、卖点罗列与使用场景说明。`;

/** 商城上架记录（模拟）：按 SKU 上架，上架数量按需分配，剩余库存留给线下门店 */
export const initialMallListings: MallListing[] = [
  { skuId: "SKU-1001-01", shopId: "SHOP-001", status: "已上架", mallPrice: 3980, listedStock: 8, sort: 1, showQualification: true, gallery: ["主图-正面", "主图-包装"], detail: detailTemplate("角膜塑形镜（夜戴型）"), updatedAt: "2026-11-02" },
  { skuId: "SKU-1001-02", shopId: "SHOP-001", status: "已上架", mallPrice: 3980, listedStock: 12, sort: 2, showQualification: true, gallery: ["主图-正面", "主图-包装"], detail: detailTemplate("角膜塑形镜（夜戴型）"), updatedAt: "2026-11-02" },
  { skuId: "SKU-1001-03", shopId: "SHOP-001", status: "已上架", mallPrice: 4280, listedStock: 10, sort: 3, showQualification: true, gallery: ["主图-正面", "主图-包装"], detail: detailTemplate("角膜塑形镜（夜戴型）"), updatedAt: "2026-11-02" },
  { skuId: "SKU-1002-01", shopId: "SHOP-001", status: "已上架", mallPrice: 1980, listedStock: 4, sort: 4, showQualification: true, gallery: ["主图-镜片"], detail: detailTemplate("RGP 硬性透氧角膜接触镜"), updatedAt: "2026-11-03" },
  { skuId: "SKU-1002-02", shopId: "SHOP-001", status: "已上架", mallPrice: 2080, listedStock: 6, sort: 5, showQualification: true, gallery: ["主图-镜片"], detail: detailTemplate("RGP 硬性透氧角膜接触镜"), updatedAt: "2026-11-03" },
  { skuId: "SKU-1003-01", shopId: "SHOP-001", status: "已上架", mallPrice: 2680, listedStock: 20, sort: 6, showQualification: true, gallery: ["主图-整机", "主图-配件"], detail: detailTemplate("视功能训练仪（家用版）"), updatedAt: "2026-11-05" },
  { skuId: "SKU-1004-01", shopId: "SHOP-001", status: "已下架", mallPrice: 128, listedStock: 0, sort: 7, showQualification: false, gallery: ["主图-翻转拍"], detail: detailTemplate("翻转拍调节训练器"), updatedAt: "2026-10-28" },
  { skuId: "SKU-1005-01", shopId: "SHOP-001", status: "已上架", mallPrice: 1580, listedStock: 15, sort: 8, showQualification: true, gallery: ["主图-训练仪"], detail: detailTemplate("双眼平衡训练仪"), updatedAt: "2026-11-06" },
  { skuId: "SKU-1006-01", shopId: "SHOP-001", status: "已上架", mallPrice: 39, listedStock: 120, sort: 9, showQualification: true, gallery: ["主图-眼罩"], detail: detailTemplate("医用冷敷眼罩"), updatedAt: "2026-11-08" },
  { skuId: "SKU-1006-02", shopId: "SHOP-001", status: "已上架", mallPrice: 39, listedStock: 80, sort: 10, showQualification: true, gallery: ["主图-眼罩"], detail: detailTemplate("医用冷敷眼罩"), updatedAt: "2026-11-08" },
  { skuId: "SKU-1007-01", shopId: "SHOP-001", status: "已下架", mallPrice: 88, listedStock: 0, sort: 11, showQualification: false, gallery: ["主图-叶黄素"], detail: detailTemplate("叶黄素酯压片糖果（儿童型）"), updatedAt: "2026-10-30" },
  { skuId: "SKU-1008-01", shopId: "SHOP-001", status: "已上架", mallPrice: 128, listedStock: 80, sort: 12, showQualification: true, gallery: ["主图-护理液"], detail: detailTemplate("角膜塑形镜护理液套装"), updatedAt: "2026-11-09" },
  { skuId: "SKU-1009-01", shopId: "SHOP-001", status: "已上架", mallPrice: 26, listedStock: 100, sort: 13, showQualification: false, gallery: ["主图-遮盖贴"], detail: detailTemplate("弱视遮盖贴"), updatedAt: "2026-11-10" },
  { skuId: "SKU-1010-01", shopId: "SHOP-001", status: "已上架", mallPrice: 5980, listedStock: 5, sort: 14, showQualification: true, gallery: ["主图-验光仪", "主图-屏幕", "主图-接口"], detail: detailTemplate("智能验光仪（家用版）"), updatedAt: "2026-11-11" },
  // 华北旗舰店（SHOP-002，从北京仓 WH-002 发货）
  { skuId: "SKU-1001-01", shopId: "SHOP-002", status: "已上架", mallPrice: 3980, listedStock: 3, sort: 15, showQualification: true, gallery: ["主图-正面", "主图-包装"], detail: detailTemplate("角膜塑形镜（夜戴型）"), updatedAt: "2026-11-03" },
  { skuId: "SKU-1003-01", shopId: "SHOP-002", status: "已上架", mallPrice: 2680, listedStock: 8, sort: 16, showQualification: true, gallery: ["主图-整机", "主图-配件"], detail: detailTemplate("视功能训练仪（家用版）"), updatedAt: "2026-11-05" },
  { skuId: "SKU-1006-01", shopId: "SHOP-002", status: "已上架", mallPrice: 39, listedStock: 40, sort: 17, showQualification: true, gallery: ["主图-眼罩"], detail: detailTemplate("医用冷敷眼罩"), updatedAt: "2026-11-09" },
  { skuId: "SKU-1008-01", shopId: "SHOP-002", status: "已上架", mallPrice: 128, listedStock: 30, sort: 18, showQualification: true, gallery: ["主图-护理液"], detail: detailTemplate("角膜塑形镜护理液套装"), updatedAt: "2026-11-10" },
  // 华南旗舰店（SHOP-003，从广州仓 WH-003 发货）
  { skuId: "SKU-1002-01", shopId: "SHOP-003", status: "已上架", mallPrice: 1980, listedStock: 1, sort: 19, showQualification: true, gallery: ["主图-镜片"], detail: detailTemplate("RGP 硬性透氧角膜接触镜"), updatedAt: "2026-11-06" },
  { skuId: "SKU-1005-01", shopId: "SHOP-003", status: "已上架", mallPrice: 1580, listedStock: 3, sort: 20, showQualification: true, gallery: ["主图-训练仪"], detail: detailTemplate("双眼平衡训练仪"), updatedAt: "2026-11-07" },
  { skuId: "SKU-1007-01", shopId: "SHOP-003", status: "已上架", mallPrice: 88, listedStock: 30, sort: 21, showQualification: true, gallery: ["主图-叶黄素"], detail: detailTemplate("叶黄素酯压片糖果（儿童型）"), updatedAt: "2026-11-11" },
  { skuId: "SKU-1012-01", shopId: "SHOP-003", status: "已下架", mallPrice: 99, listedStock: 0, sort: 22, showQualification: false, gallery: ["主图-镜架"], detail: detailTemplate("儿童防蓝光眼镜"), updatedAt: "2026-11-01" },
];

/** 某 SKU 在「某店铺绑定的发货仓库」中的库存合计，即该店铺对该 SKU 的最大货源量 */
export function getShopStockCapacity(shop: Shop | undefined, sku: ErpSku) {
  if (!shop) return 0;
  return shop.warehouseIds.reduce((sum, warehouseId) => sum + getSkuWarehouseStock(sku, warehouseId), 0);
}

/** 除指定店铺外，其他店铺对同一 SKU 已上架的数量合计（用于跨店铺防超卖） */
export function getOtherShopsListedStock(skuId: string, excludeShopId: string, listings: MallListing[]) {
  return listings
    .filter((listing) => listing.skuId === skuId && listing.shopId !== excludeShopId)
    .reduce((sum, listing) => sum + listing.listedStock, 0);
}

/**
 * 某店铺对某 SKU 的最大可上架数量，受双重约束：
 * 1. 不超过该店铺绑定仓库中该 SKU 的库存合计（店铺货源容量）；
 * 2. 各店铺上架合计不超过该 SKU 的全仓总库存（跨店铺防超卖）。
 */
export function getShopAvailableStock(
  shop: Shop | undefined,
  sku: ErpSku,
  skuId: string,
  excludeShopId: string,
  listings: MallListing[]
) {
  const capacity = getShopStockCapacity(shop, sku);
  const total = getSkuTotalStock(sku);
  const otherListed = getOtherShopsListedStock(skuId, excludeShopId, listings);
  return Math.max(0, Math.min(capacity, total - otherListed));
}

/** 某上架记录关联的 SKU（不存在时返回 undefined） */
export function getListingSku(listing: MallListing) {
  return erpSkuMap[listing.skuId];
}

/** 某 SKU 所属商品（SPU）名称 */
export function getSkuProductName(sku: ErpSku) {
  return erpProductMap[sku.spuId]?.name ?? sku.spuId;
}
