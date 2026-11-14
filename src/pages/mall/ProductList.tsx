import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { Plus, UploadSimple, ImageSquare, X, Info, Check, WarningCircle } from "@phosphor-icons/react";
import Select, { type SelectOption } from "../../components/form/Select";
import ProductCell from "../../components/product/ProductCell";
import SkuSpecTags from "../../components/product/SkuSpecTags";
import StatusTag from "../../components/product/StatusTag";
import ValidityCell from "../../components/product/ValidityCell";
import ProductRefCard from "../../components/product/ProductRefCard";
import { clamp, getPageItems } from "../../lib/pagination";
import { getMergedProductMap, getMergedSkus, getMergedSkuMap } from "../inventory/productStore";
import {
  erpProducts,
  erpSkus,
  initialMallListings,
  initialShops,
  initialWarehouses,
  productCategoryOptions,
  getSkuTotalStock,
  getSkuSpecText,
  getShopStockCapacity,
  getShopAvailableStock,
  type ErpSku,
  type MallListing,
  type ProductCategory,
} from "./mockData";

type StatusFilter = "全部状态" | MallListing["status"];
type CategoryFilter = "全部分类" | ProductCategory;
type ShopFilter = "全部店铺" | string;

type ListingDraft = {
  mallPrice: string;
  listedStock: string;
  sort: string;
  status: MallListing["status"];
  showQualification: boolean;
  gallery: string[];
  detail: string;
};

const statusFilterOptions: SelectOption[] = ["全部状态", "已上架", "已下架"].map((item) => ({ value: item, label: item }));
const categoryFilterOptions: SelectOption[] = ["全部分类", ...productCategoryOptions].map((item) => ({ value: item, label: item }));
const statusEditOptions: SelectOption[] = ["已上架", "已下架"].map((item) => ({ value: item, label: item }));
const shopFilterOptions: SelectOption[] = [
  { value: "全部店铺", label: "全部店铺" },
  ...initialShops.map((shop) => ({ value: shop.id, label: shop.name })),
];

const pageSize = 10;

export default function MallProductList() {
  const [listings, setListings] = useState<MallListing[]>(initialMallListings);
  const [shopFilter, setShopFilter] = useState<ShopFilter>("全部店铺");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("全部分类");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("全部状态");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);

  const [configSkuId, setConfigSkuId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ListingDraft | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [addKeyword, setAddKeyword] = useState("");
  const [addShopId, setAddShopId] = useState(initialShops[0].id);
  const [addQty, setAddQty] = useState<Record<string, string>>({});

  const [toggleCandidate, setToggleCandidate] = useState<(MallListing & { name: string; specText: string; nextStatus: MallListing["status"] }) | null>(null);

  const shopById = (shopId: string) => initialShops.find((shop) => shop.id === shopId);
  const shopName = (shopId: string) => shopById(shopId)?.name ?? shopId;
  const shopCapacityText = (shopId: string) => {
    const shop = shopById(shopId);
    if (!shop || shop.warehouseIds.length === 0) return "未绑定仓库";
    return shop.warehouseIds.map((id) => initialWarehouses.find((w) => w.id === id)?.name ?? id).join("、");
  };
  // ERP 商品主数据含本次会话在「库存管理 · 商品管理」中新增 / 编辑的档案
  const productMap = useMemo(() => getMergedProductMap(erpProducts), []);
  const skuMap = useMemo(() => getMergedSkuMap(erpSkus), []);
  const productOf = (sku: ErpSku) => productMap[sku.spuId];
  const skuSpecText = (sku: ErpSku) => getSkuSpecText(sku);

  const rows = useMemo(
    () =>
      listings
        .map((listing) => ({ listing, sku: skuMap[listing.skuId] }))
        .filter((item) => item.sku)
        .sort((a, b) => a.listing.sort - b.listing.sort),
    [listings, skuMap]
  );

  const filteredRows = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return rows.filter(({ listing, sku }) => {
      const product = productMap[sku.spuId];
      if (!product) return false;
      if (shopFilter !== "全部店铺" && listing.shopId !== shopFilter) return false;
      if (categoryFilter !== "全部分类" && product.category !== categoryFilter) return false;
      if (statusFilter !== "全部状态" && listing.status !== statusFilter) return false;
      if (kw && !`${product.name} ${skuSpecText(sku)} ${product.manufacturer}`.toLowerCase().includes(kw)) return false;
      return true;
    });
  }, [categoryFilter, keyword, productMap, rows, shopFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedRows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const pageItems = getPageItems(totalPages, currentPage);

  // 未在「当前添加店铺」上架的 SKU（多店铺下，不同店铺可各自上架同一 SKU）
  const unlistedSkus = useMemo(
    () => getMergedSkus(erpSkus).filter((sku) => !listings.some((listing) => listing.skuId === sku.skuId && listing.shopId === addShopId)),
    [addShopId, listings]
  );

  const addCandidates = useMemo(() => {
    const kw = addKeyword.trim().toLowerCase();
    return unlistedSkus.filter((sku) => {
      const product = productMap[sku.spuId];
      if (!product) return false;
      return kw ? `${product.name} ${skuSpecText(sku)} ${product.manufacturer}`.toLowerCase().includes(kw) : true;
    });
  }, [addKeyword, productMap, unlistedSkus]);

  const addShop = shopById(addShopId);

  /** 某 SKU 在「当前添加店铺」下的最大可上架数量 */
  const addMaxOf = (sku: ErpSku) => getShopAvailableStock(addShop, sku, sku.skuId, addShopId, listings);

  const addSelectedIds = Object.keys(addQty);
  const addInvalid = addSelectedIds.some((skuId) => {
    const sku = skuMap[skuId];
    const qty = Number(addQty[skuId]);
    return !sku || !Number.isInteger(qty) || qty <= 0 || qty > addMaxOf(sku);
  });

  function openConfig(skuId: string) {
    const listing = listings.find((item) => item.skuId === skuId);
    if (!listing) return;
    setDraft({
      mallPrice: String(listing.mallPrice),
      listedStock: String(listing.listedStock),
      sort: String(listing.sort),
      status: listing.status,
      showQualification: listing.showQualification,
      gallery: [...listing.gallery],
      detail: listing.detail,
    });
    setConfigSkuId(skuId);
  }

  function closeConfig() {
    setConfigSkuId(null);
    setDraft(null);
  }

  function saveConfig() {
    if (!configSkuId || !draft) return;
    const price = Number(draft.mallPrice);
    const sort = Number(draft.sort);
    const listing = listings.find((item) => item.skuId === configSkuId);
    const sku = listing ? skuMap[listing.skuId] : undefined;
    const max = listing && sku
      ? getShopAvailableStock(shopById(listing.shopId), sku, listing.skuId, listing.shopId, listings)
      : 0;
    const stock = clamp(Number(draft.listedStock) || 0, 0, max);
    setListings((prev) =>
      prev.map((item) =>
        item.skuId === configSkuId
          ? {
              ...item,
              mallPrice: Number.isFinite(price) ? price : item.mallPrice,
              listedStock: stock,
              sort: Number.isFinite(sort) ? sort : item.sort,
              status: draft.status,
              showQualification: draft.showQualification,
              gallery: draft.gallery,
              detail: draft.detail,
              updatedAt: new Date().toISOString().slice(0, 10),
            }
          : item
      )
    );
    closeConfig();
  }

  function requestToggle(listing: MallListing) {
    const sku = skuMap[listing.skuId];
    if (!sku) return;
    const nextStatus: MallListing["status"] = listing.status === "已上架" ? "已下架" : "已上架";
    if (nextStatus === "已上架" && (getSkuTotalStock(sku) <= 0 || listing.listedStock <= 0)) return;
    setToggleCandidate({ ...listing, name: productOf(sku)?.name ?? sku.spuId, specText: skuSpecText(sku), nextStatus });
  }

  function confirmToggle() {
    if (!toggleCandidate) return;
    setListings((prev) =>
      prev.map((item) =>
        item.skuId === toggleCandidate.skuId
          ? { ...item, status: toggleCandidate.nextStatus, updatedAt: new Date().toISOString().slice(0, 10) }
          : item
      )
    );
    setToggleCandidate(null);
  }

  function confirmAdd() {
    if (addSelectedIds.length === 0 || addInvalid) return;
    const baseSort = listings.reduce((max, item) => Math.max(max, item.sort), 0);
    const created: MallListing[] = addSelectedIds.map((skuId, idx) => {
      const sku = skuMap[skuId];
      return {
        skuId,
        shopId: addShopId,
        status: "已上架",
        mallPrice: sku.retailPrice,
        listedStock: Number(addQty[skuId]),
        sort: baseSort + idx + 1,
        showQualification: true,
        gallery: ["主图-默认"],
        detail: `${productOf(sku)?.name ?? skuId} 商城详情页文案（占位）。`,
        updatedAt: new Date().toISOString().slice(0, 10),
      };
    });
    setListings((prev) => [...prev, ...created]);
    setAddOpen(false);
    setAddQty({});
    setAddKeyword("");
    setPage(1);
    setStatusFilter("全部状态");
  }

  function exportCsv() {
    const header = ["商品名称", "规格", "SKU 编码", "分类", "生产厂家", "商城售价", "上架数量", "ERP总库存", "有效期至", "上架状态", "资质可见"];
    const lines = filteredRows.map(({ listing, sku }) => {
      const product = productOf(sku);
      return [
        product?.name ?? sku.spuId,
        skuSpecText(sku),
        sku.skuId,
        product?.category ?? "—",
        product?.manufacturer ?? "—",
        listing.mallPrice,
        listing.listedStock,
        getSkuTotalStock(sku),
        product?.validityTo ?? "—",
        listing.status,
        listing.showQualification ? "是" : "否",
      ]
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(",");
    });
    const csv = "\uFEFF" + [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `商城商品清单_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const configSku = configSkuId ? skuMap[configSkuId] : null;
  const configProduct = configSku ? productOf(configSku) : null;
  const configListing = configSkuId ? listings.find((item) => item.skuId === configSkuId) ?? null : null;
  const configShop = configListing ? shopById(configListing.shopId) : undefined;
  const configTotalStock = configSku ? getSkuTotalStock(configSku) : 0;
  const configMaxStock =
    configListing && configSku
      ? getShopAvailableStock(configShop, configSku, configListing.skuId, configListing.shopId, listings)
      : 0;

  const configModal =
    configSkuId && draft && configSku && configProduct && typeof document !== "undefined"
      ? createPortal(
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/35 px-4 py-8" onClick={closeConfig}>
            <div
              className="flex max-h-[88vh] w-full max-w-[860px] flex-col overflow-hidden rounded-[32px] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-8 py-6">
                <div>
                  <div className="text-[20px] font-bold leading-8 text-gray-900">商城上架配置</div>
                  <div className="mt-1 text-sm font-medium leading-6 text-slate-500">{configProduct.name} · {skuSpecText(configSku)} · {configShop?.name}</div>
                </div>
                <button className="rounded-2xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200" onClick={closeConfig}>
                  关闭
                </button>
              </div>

              <div className="flex-1 space-y-6 overflow-y-auto px-8 py-6">
                {/* ERP 主数据（只读引用） */}
                <ProductRefCard product={configProduct} sku={configSku} totalStock={configTotalStock} />

                {/* 商城专属字段 */}
                <div>
                  <div className="text-sm font-semibold text-slate-500">商城上架数量（可售库存）</div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="rounded-lg bg-slate-100 px-2 py-1 font-medium text-slate-600">店铺：{configShop?.name}</span>
                    <span className="rounded-lg bg-slate-100 px-2 py-1 font-medium text-slate-600">
                      货源仓库：{configListing ? shopCapacityText(configListing.shopId) : "—"}
                    </span>
                    <span className="rounded-lg bg-slate-100 px-2 py-1 font-medium text-slate-600">
                      店铺货源库存：{getShopStockCapacity(configShop, configSku)} 件
                    </span>
                  </div>
                  <input
                    value={draft.listedStock}
                    inputMode="numeric"
                    onChange={(e) => setDraft((prev) => (prev ? { ...prev, listedStock: e.target.value } : prev))}
                    className="mt-3 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-base font-semibold text-slate-700 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                  />
                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                    <WarningCircle weight="bold" className="h-4 w-4 flex-none text-orange-400" />
                    最多可上架 {configMaxStock} 件（受店铺货源仓库、全仓总库存 {configTotalStock} 件与其他店铺已上架量双重约束）；建议按需分配，余量留给线下门店使用。
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-500">商城售价（元）</div>
                    <input
                      value={draft.mallPrice}
                      inputMode="decimal"
                      onChange={(e) => setDraft((prev) => (prev ? { ...prev, mallPrice: e.target.value } : prev))}
                      className="mt-3 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-base font-semibold text-slate-700 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-500">排序值</div>
                    <input
                      value={draft.sort}
                      inputMode="numeric"
                      onChange={(e) => setDraft((prev) => (prev ? { ...prev, sort: e.target.value } : prev))}
                      className="mt-3 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-base font-semibold text-slate-700 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-500">上架状态</div>
                    <Select
                      value={draft.status}
                      onChange={(value) => setDraft((prev) => (prev ? { ...prev, status: value as MallListing["status"] } : prev))}
                      options={statusEditOptions}
                      className="mt-3"
                      triggerClassName="h-12 rounded-2xl px-4 text-base font-semibold"
                      dropdownClassName="rounded-2xl"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-3 text-sm font-semibold text-slate-500">产品展示图（多图）</div>
                  <div className="flex flex-wrap gap-3">
                    {draft.gallery.map((item, idx) => (
                      <div key={`${item}-${idx}`} className="group relative flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-2xl border border-slate-200 bg-slate-50 text-slate-400">
                        <ImageSquare className="h-6 w-6" />
                        <span className="px-1 text-center text-[11px] font-medium leading-tight">{item}</span>
                        <button
                          type="button"
                          onClick={() => setDraft((prev) => (prev ? { ...prev, gallery: prev.gallery.filter((_, i) => i !== idx) } : prev))}
                          className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-rose-500 shadow ring-1 ring-slate-200 hover:bg-rose-50"
                        >
                          <X weight="bold" className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setDraft((prev) => (prev ? { ...prev, gallery: [...prev.gallery, `展示图${prev.gallery.length + 1}`] } : prev))}
                      className="flex h-24 w-24 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white text-slate-400 hover:border-primary-300 hover:text-primary-500"
                    >
                      <Plus weight="bold" className="h-5 w-5" />
                      <span className="text-xs font-semibold">添加图片</span>
                    </button>
                  </div>
                </div>

                <div>
                  <div className="mb-3 text-sm font-semibold text-slate-500">商品详情（富文本占位）</div>
                  <textarea
                    value={draft.detail}
                    rows={4}
                    onChange={(e) => setDraft((prev) => (prev ? { ...prev, detail: e.target.value } : prev))}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setDraft((prev) => (prev ? { ...prev, showQualification: !prev.showQualification } : prev))}
                  className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left hover:bg-slate-50"
                >
                  <div>
                    <div className="text-sm font-semibold text-slate-700">资质信息对消费者可见</div>
                    <div className="mt-1 text-xs text-slate-500">开启后，生产厂家、注册证号、说明书与资质图片将在商品详情页对外展示。</div>
                  </div>
                  <span
                    className={clsx(
                      "relative h-6 w-11 flex-none rounded-full transition-colors",
                      draft.showQualification ? "bg-primary-500" : "bg-slate-300"
                    )}
                  >
                    <span
                      className={clsx(
                        "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
                        draft.showQualification ? "left-[22px]" : "left-0.5"
                      )}
                    />
                  </span>
                </button>
              </div>

              <div className="flex justify-end gap-4 border-t border-gray-100 px-8 py-5">
                <button className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-base font-semibold text-slate-600 hover:bg-slate-50" onClick={closeConfig}>
                  取消
                </button>
                <button className="rounded-2xl bg-primary-500 px-5 py-2.5 text-base font-semibold text-white hover:bg-primary-600" onClick={saveConfig}>
                  保存配置
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  const addModal =
    addOpen && typeof document !== "undefined"
      ? createPortal(
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/35 px-4 py-8" onClick={() => setAddOpen(false)}>
            <div
              className="flex max-h-[88vh] w-full max-w-[820px] flex-col overflow-hidden rounded-[32px] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-8 py-6">
                <div>
                  <div className="text-[20px] font-bold leading-8 text-gray-900">从 ERP 商品库上架</div>
                  <div className="mt-1 text-sm font-medium leading-6 text-slate-500">按 SKU 规格上架：选择上架店铺并指定每个规格的上架数量，数量不得超过该店铺货源仓库可用库存。</div>
                </div>
                <button className="rounded-2xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200" onClick={() => setAddOpen(false)}>
                  关闭
                </button>
              </div>

              <div className="flex flex-col gap-3 border-b border-gray-100 px-8 py-4 xl:flex-row xl:items-center">
                <Select
                  value={addShopId}
                  onChange={(value) => {
                    setAddShopId(value);
                    setAddQty({});
                  }}
                  options={initialShops.map((shop) => ({ value: shop.id, label: shop.name }))}
                  className="min-w-[180px]"
                  triggerClassName="h-11 rounded-2xl px-4 text-sm font-semibold"
                  dropdownClassName="rounded-2xl"
                />
                <input
                  value={addKeyword}
                  onChange={(e) => setAddKeyword(e.target.value)}
                  placeholder="搜索商品名称 / 规格 / 厂家"
                  className="h-11 w-full flex-1 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                />
              </div>
              <div className="flex items-center gap-2 border-b border-gray-100 bg-slate-50/60 px-8 py-2.5 text-xs text-slate-500">
                <Info weight="bold" className="h-4 w-4 flex-none text-primary-500" />
                当前店铺「{addShop?.name}」货源仓库：{shopCapacityText(addShopId)}
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto px-8 py-4">
                {addCandidates.length === 0 && (
                  <div className="py-10 text-center text-sm text-slate-400">ERP 商品库中没有可上架的 SKU</div>
                )}
                {addCandidates.map((sku) => {
                  const product = productOf(sku);
                  const max = addMaxOf(sku);
                  const selected = sku.skuId in addQty;
                  const qty = Number(addQty[sku.skuId] ?? "");
                  const qtyInvalid = selected && (!Number.isInteger(qty) || qty <= 0 || qty > max);
                  return (
                    <div
                      key={sku.skuId}
                      className={clsx(
                        "flex items-center gap-4 rounded-2xl border px-4 py-3 transition",
                        selected ? "border-primary-300 bg-primary-50" : "border-slate-200 bg-white hover:bg-slate-50"
                      )}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setAddQty((prev) => {
                            const next = { ...prev };
                            if (sku.skuId in next) delete next[sku.skuId];
                            else next[sku.skuId] = "0";
                            return next;
                          })
                        }
                        className={clsx(
                          "flex h-5 w-5 flex-none items-center justify-center rounded-md border",
                          selected ? "border-primary-500 bg-primary-500 text-white" : "border-slate-300 bg-white text-transparent"
                        )}
                      >
                        <Check weight="bold" className="h-3 w-3" />
                      </button>
                      <ProductCell
                        name={product?.name ?? sku.spuId}
                        image={sku.image || product?.images[0]}
                        subtitle={<span>{skuSpecText(sku)} · {sku.skuId} · {product?.manufacturer}</span>}
                        className="min-w-0 flex-1"
                      />
                      <div className="flex flex-none items-center gap-2">
                        <span className="text-xs text-slate-400">可上架 {max}</span>
                        <input
                          value={addQty[sku.skuId] ?? ""}
                          disabled={!selected}
                          inputMode="numeric"
                          onChange={(e) => setAddQty((prev) => ({ ...prev, [sku.skuId]: e.target.value }))}
                          placeholder="上架数量"
                          className={clsx(
                            "h-10 w-24 rounded-xl border px-3 text-sm font-semibold outline-none",
                            !selected
                              ? "border-slate-200 bg-slate-100 text-slate-400"
                              : qtyInvalid
                              ? "border-rose-300 bg-white text-rose-600 focus:border-rose-400"
                              : "border-slate-200 bg-white text-slate-700 focus:border-primary-300"
                          )}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 px-8 py-5">
                <div className="text-sm text-slate-500">
                  已选 <span className="font-semibold text-slate-700">{addSelectedIds.length}</span> 个 SKU
                  {!addInvalid && addSelectedIds.length > 0 && <span className="ml-2 text-emerald-600">数量校验通过</span>}
                  {addInvalid && <span className="ml-2 text-rose-500">请填写 1 ~ 店铺可上架上限之间的整数</span>}
                </div>
                <div className="flex gap-4">
                  <button className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-base font-semibold text-slate-600 hover:bg-slate-50" onClick={() => setAddOpen(false)}>
                    取消
                  </button>
                  <button
                    className="rounded-2xl bg-primary-500 px-5 py-2.5 text-base font-semibold text-white hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-primary-300"
                    disabled={addSelectedIds.length === 0 || addInvalid}
                    onClick={confirmAdd}
                  >
                    确认上架
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  const toggleModal =
    toggleCandidate && typeof document !== "undefined"
      ? createPortal(
          <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/35 px-4 py-8" onClick={() => setToggleCandidate(null)}>
            <div
              className="w-full max-w-md rounded-[28px] border border-slate-100 bg-white px-6 py-7 shadow-[0_24px_80px_rgba(15,23,42,0.18)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                <UploadSimple size={24} weight="bold" />
              </div>
              <div className="mt-5 text-center text-xl font-bold text-slate-800">
                确认{toggleCandidate.nextStatus === "已上架" ? "上架" : "下架"}
              </div>
              <div className="mt-2 text-center text-sm leading-6 text-slate-500">
                确认将 <span className="font-semibold text-slate-700">“{toggleCandidate.name} · {toggleCandidate.specText}”</span>
                {toggleCandidate.nextStatus === "已上架" ? " 上架到商城吗？上架后消费者即可浏览与下单。" : " 从商城下架吗？下架后消费者将无法浏览与下单。"}
              </div>
              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => setToggleCandidate(null)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={confirmToggle}
                  className="flex-1 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-600"
                >
                  确认{toggleCandidate.nextStatus === "已上架" ? "上架" : "下架"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div className="min-h-full flex flex-col gap-4">
      <div className="bg-white rounded-2xl card-shadow border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100">
          <div className="flex flex-col gap-3 p-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
              <Select
                value={shopFilter}
                onChange={(value) => {
                  setShopFilter(value);
                  setPage(1);
                }}
                options={shopFilterOptions}
                className="min-w-[150px]"
                triggerClassName="h-[46px] rounded-2xl border-gray-200 px-4"
              />
              <Select
                value={categoryFilter}
                onChange={(value) => {
                  setCategoryFilter(value as CategoryFilter);
                  setPage(1);
                }}
                options={categoryFilterOptions}
                className="min-w-[140px]"
                triggerClassName="h-[46px] rounded-2xl border-gray-200 px-4"
              />
              <Select
                value={statusFilter}
                onChange={(value) => {
                  setStatusFilter(value as StatusFilter);
                  setPage(1);
                }}
                options={statusFilterOptions}
                className="min-w-[128px]"
                triggerClassName="h-[46px] rounded-2xl border-gray-200 px-4"
              />
              <input
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setPage(1);
                }}
                placeholder="搜索商品名称 / 规格 / 厂家"
                className="h-[46px] w-full max-w-[280px] rounded-2xl border border-gray-200 bg-white px-4 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
              />
            </div>
            <div className="flex items-center justify-end gap-3">
              <span aria-hidden="true" className="hidden h-6 w-px bg-gray-200 xl:block"></span>
              <button
                className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                onClick={exportCsv}
              >
                导出商品清单
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-2xl bg-primary-500 px-4 py-3 text-sm font-semibold text-white hover:bg-primary-600 active:bg-primary-700"
                onClick={() => {
                  setAddQty({});
                  setAddKeyword("");
                  setAddShopId(shopFilter === "全部店铺" ? initialShops[0].id : shopFilter);
                  setAddOpen(true);
                }}
              >
                <Plus weight="bold" className="h-4 w-4" />
                从 ERP 商品库上架
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 border-t border-gray-100 bg-slate-50/60 px-4 py-2.5 text-xs text-slate-500">
            <Info weight="bold" className="h-4 w-4 flex-none text-primary-500" />
            商品主数据（SPU）与 SKU 库存由 ERP 统一维护；商城按 SKU 规格上架，上架数量受「店铺绑定发货仓库」与 ERP 总库存双重约束，商城不持有库存。
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] table-fixed text-center">
            <colgroup>
              <col className="w-[20%]" />
              <col className="w-[16%]" />
              <col className="w-[8%]" />
              <col className="w-[10%]" />
              <col className="w-[12%]" />
              <col className="w-[11%]" />
              <col className="w-[7%]" />
              <col className="w-[16%]" />
            </colgroup>
            <thead className="bg-gray-50 text-xs uppercase tracking-[0.18em] text-gray-400">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">商品</th>
                <th className="px-4 py-3 text-left font-semibold">规格 / SKU</th>
                <th className="px-4 py-3 text-center font-semibold">分类</th>
                <th className="px-4 py-3 text-center font-semibold">商城售价</th>
                <th className="px-4 py-3 text-center font-semibold">上架数量</th>
                <th className="px-4 py-3 text-center font-semibold">有效期</th>
                <th className="px-4 py-3 text-center font-semibold">状态</th>
                <th className="px-4 py-3 text-center font-semibold">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {pagedRows.map(({ listing, sku }) => {
                const product = productOf(sku);
                const specAttrs = product?.specAttributes ?? Object.keys(sku.specValues);
                const total = getSkuTotalStock(sku);
                const max = getShopAvailableStock(shopById(listing.shopId), sku, listing.skuId, listing.shopId, listings);
                const overStock = listing.listedStock > max;
                return (
                  <tr key={listing.skuId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-left">
                      <ProductCell
                        name={product?.name ?? sku.spuId}
                        image={sku.image || product?.images[0]}
                        subtitle={<span>{sku.spuId} · {shopName(listing.shopId)}</span>}
                      />
                    </td>
                    <td className="px-4 py-3 text-left">
                      <SkuSpecTags sku={sku} attributes={specAttrs} />
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">{product?.category ?? "—"}</td>
                    <td className="px-4 py-3 text-center font-semibold text-gray-900">¥{listing.mallPrice}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={clsx("font-semibold", overStock ? "text-rose-600" : "text-gray-900")}>
                          可售 {listing.listedStock}
                        </span>
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">
                          上限 {max} · 全仓 {total}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <ValidityCell validityTo={product?.validityTo ?? ""} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusTag status={listing.status} tone={listing.status === "已上架" ? "success" : "neutral"} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          className="rounded-md bg-primary-50 px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-100 hover:text-primary-700"
                          onClick={() => openConfig(listing.skuId)}
                        >
                          上架配置
                        </button>
                        <button
                          className={clsx(
                            "text-sm font-medium",
                            listing.status === "已上架" ? "text-rose-500 hover:text-rose-600" : "text-emerald-600 hover:text-emerald-700"
                          )}
                          onClick={() => requestToggle(listing)}
                        >
                          {listing.status === "已上架" ? "下架" : "上架"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {pagedRows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-sm text-gray-400">
                    暂无符合条件的商城 SKU
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-3 text-sm text-gray-500 lg:flex-row lg:items-center lg:justify-between">
          <div>共 {filteredRows.length} 个商城 SKU，当前第 {currentPage} / {totalPages} 页</div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 disabled:cursor-not-allowed disabled:text-gray-300"
              disabled={currentPage === 1}
              onClick={() => setPage((prev) => clamp(prev - 1, 1, totalPages))}
            >
              上一页
            </button>
            {pageItems.map((item, idx) =>
              item === "ellipsis" ? (
                <span key={`ellipsis-${idx}`} className="px-2 text-sm text-gray-400">
                  ...
                </span>
              ) : (
                <button
                  key={item}
                  onClick={() => setPage(item)}
                  className={
                    item === currentPage
                      ? "rounded-xl bg-primary-500 px-3 py-2 text-sm font-semibold text-white"
                      : "rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  }
                >
                  {item}
                </button>
              )
            )}
            <button
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 disabled:cursor-not-allowed disabled:text-gray-300"
              disabled={currentPage === totalPages}
              onClick={() => setPage((prev) => clamp(prev + 1, 1, totalPages))}
            >
              下一页
            </button>
          </div>
        </div>
      </div>
      {configModal}
      {addModal}
      {toggleModal}
    </div>
  );
}
