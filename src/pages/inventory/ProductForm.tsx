import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import clsx from "clsx";
import { ArrowLeft, Plus, Info, Trash, Check, UploadSimple, X, WarningCircle } from "@phosphor-icons/react";
import Select, { type SelectOption } from "../../components/form/Select";
import { readImages } from "../../lib/image";
import {
  erpProducts,
  erpSkus,
  categorySpecTemplates,
  initialWarehouses,
  productCategoryOptions,
  getSkuWarehouseStock,
  type ErpProduct,
  type ErpSku,
  type ProductCategory,
} from "./mockData";
import { getMergedProducts, getMergedSkus, nextSpuId, saveProductOverride } from "./productStore";

type SkuDraft = {
  skuId: string;
  specValues: Record<string, string>;
  barcode: string;
  /** SKU 图片（单张数据的 data URL） */
  image: string;
  costPrice: string;
  retailPrice: string;
  status: ErpSku["status"];
  /** 初始库存（仅新增商品时录入，保存后生成初始入库单） */
  initStock: string;
};

type ProductDraft = {
  name: string;
  manufacturer: string;
  category: ProductCategory;
  validityTo: string;
  registrationNo: string;
  productionLicenseNo: string;
  manualName: string;
  /** 商品图片（多张，第一张作为封面） */
  images: string[];
  /** 注册证 / 备案凭证等资质图片（多张） */
  certificateImages: string[];
  /** 启用的规格属性（取自类目规格属性模板） */
  specAttributes: string[];
  /** 初始入库仓库（仅新增商品时使用） */
  initWarehouseId: string;
  skus: SkuDraft[];
};

const categoryEditOptions: SelectOption[] = productCategoryOptions.map((item) => ({ value: item, label: item }));
const statusOptions: SelectOption[] = [
  { value: "启用", label: "启用" },
  { value: "停用", label: "停用" },
];

function toDraft(product: ErpProduct, skus: ErpSku[]): ProductDraft {
  return {
    name: product.name,
    manufacturer: product.manufacturer,
    category: product.category,
    validityTo: product.validityTo,
    registrationNo: product.registrationNo,
    productionLicenseNo: product.productionLicenseNo,
    manualName: product.manualName,
    images: [...product.images],
    certificateImages: [...product.certificateImages],
    specAttributes: [...product.specAttributes],
    initWarehouseId: initialWarehouses[0].id,
    skus: skus.map((sku) => ({
      skuId: sku.skuId,
      specValues: { ...sku.specValues },
      barcode: sku.barcode,
      image: sku.image,
      costPrice: String(sku.costPrice),
      retailPrice: String(sku.retailPrice),
      status: sku.status,
      initStock: "",
    })),
  };
}

function createEmptyDraft(): ProductDraft {
  return {
    name: "",
    manufacturer: "",
    category: "医疗器械类",
    validityTo: "",
    registrationNo: "",
    productionLicenseNo: "",
    manualName: "",
    images: [],
    certificateImages: [],
    specAttributes: ["型号"],
    initWarehouseId: initialWarehouses[0].id,
    skus: [{ skuId: "", specValues: {}, barcode: "", image: "", costPrice: "", retailPrice: "", status: "启用", initStock: "" }],
  };
}

function FieldRow({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <div className="flex items-baseline gap-2">
        <div className="text-sm font-semibold text-slate-500">{label}</div>
        {hint ? <div className="text-xs text-slate-400">{hint}</div> : null}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function FormSection({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5">
      <div className="mb-4">
        <div className="text-sm font-bold text-gray-900">{title}</div>
        {desc ? <div className="mt-1 text-xs text-slate-500">{desc}</div> : null}
      </div>
      {children}
    </section>
  );
}

/** 图片选择器：已选图片以缩略图排列，末位为上传入口；multiple 为 false 时单选（用于 SKU 图片）。 */
function ImagePicker({
  images,
  onChange,
  onError,
  multiple = true,
  size = "h-24 w-24",
  label = "上传图片",
  hint,
  max = 8,
  maxLabel,
  showLabels = true,
  /** 是否在第一张图上标注「封面」角标（仅多图场景有意义） */
  coverBadge = true,
}: {
  images: string[];
  onChange: (next: string[]) => void;
  onError: (message: string) => void;
  multiple?: boolean;
  size?: string;
  label?: string;
  hint?: string;
  max?: number;
  maxLabel?: string;
  showLabels?: boolean;
  coverBadge?: boolean;
}) {
  async function pick(files: FileList | null) {
    onError("");
    try {
      const picked = await readImages(files);
      if (picked.length === 0) return;
      onChange(multiple ? [...images, ...picked].slice(0, max) : picked.slice(-1));
    } catch (error) {
      onError(error instanceof Error ? error.message : "图片上传失败");
    }
  }

  return (
    <div className="flex flex-wrap items-start gap-3">
      {images.map((src, index) => (
        <div key={`${index}-${src.slice(-16)}`} className={clsx("group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50", size)}>
          <img src={src} alt={`已上传图片 ${index + 1}`} className="h-full w-full object-cover" />
          {coverBadge && multiple && index === 0 ? (
            <span className="absolute bottom-1 left-1 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold text-white">封面</span>
          ) : null}
          <button
            type="button"
            aria-label={`删除图片 ${index + 1}`}
            onClick={() => onChange(images.filter((_, i) => i !== index))}
            className="absolute right-1 top-1 hidden rounded-lg bg-black/50 p-1 text-white hover:bg-rose-500 group-hover:block"
          >
            <X weight="bold" className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      {multiple && images.length >= max ? (
        maxLabel ? (
          <div className={clsx("flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 text-[11px] text-slate-400", size)}>
            {maxLabel}
          </div>
        ) : null
      ) : (
        <label
          className={clsx(
            "flex cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-slate-400 transition hover:border-primary-300 hover:bg-primary-50/60 hover:text-primary-500",
            size
          )}
        >
          <UploadSimple weight="bold" className={showLabels ? "h-5 w-5" : "h-4 w-4"} />
          {showLabels ? <span className="text-[11px] font-medium">{images.length > 0 && multiple ? "继续添加" : label}</span> : null}
          {showLabels && hint ? <span className="text-[10px] text-slate-400">{hint}</span> : null}
          <input
            type="file"
            accept="image/*"
            multiple={multiple}
            className="hidden"
            onChange={(e) => {
              void pick(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      )}
    </div>
  );
}

/** 开关按钮：iOS 风格滑动切换 */
function Switch({ checked, onChange }: { checked: boolean; onChange: (next: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={clsx(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
        checked ? "bg-primary-500" : "bg-slate-300"
      )}
    >
      <span
        className={clsx(
          "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-4" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

const inputCls =
  "h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none placeholder:font-medium placeholder:text-slate-400 focus:border-primary-300 focus:ring-2 focus:ring-primary-100";

const cellInputCls =
  "h-9 w-full rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 outline-none placeholder:font-medium placeholder:text-slate-300 focus:border-primary-300 focus:ring-2 focus:ring-primary-100";

export default function InventoryProductForm() {
  const navigate = useNavigate();
  const { spuId } = useParams();
  const isEdit = Boolean(spuId);

  // 编辑态一次性读取既有档案，避免用 effect 回填表单
  const [initial] = useState(() => {
    if (!spuId) return null;
    const product = getMergedProducts(erpProducts).find((item) => item.spuId === spuId);
    if (!product) return null;
    return { product, skus: getMergedSkus(erpSkus).filter((sku) => sku.spuId === spuId) };
  });

  const [draft, setDraft] = useState<ProductDraft>(() => (initial ? toDraft(initial.product, initial.skus) : createEmptyDraft()));
  const [uploadError, setUploadError] = useState("");
  /** 是否在建档时同步登记初始库存（仅新增商品时生效） */
  const [useInitStock, setUseInitStock] = useState(true);

  const allProducts = useMemo(() => getMergedProducts(erpProducts), []);
  const allSkus = useMemo(() => getMergedSkus(erpSkus), []);

  const patchDraft = (patch: Partial<ProductDraft>) => setDraft((prev) => ({ ...prev, ...patch }));
  const patchSku = (index: number, patch: Partial<SkuDraft>) =>
    setDraft((prev) => ({ ...prev, skus: prev.skus.map((sku, i) => (i === index ? { ...sku, ...patch } : sku)) }));

  function toggleAttribute(attr: string) {
    setDraft((prev) => {
      const exists = prev.specAttributes.includes(attr);
      return { ...prev, specAttributes: exists ? prev.specAttributes.filter((item) => item !== attr) : [...prev.specAttributes, attr] };
    });
  }

  function addSkuRow() {
    setDraft((prev) => ({
      ...prev,
      skus: [...prev.skus, { skuId: "", specValues: {}, barcode: "", image: "", costPrice: "", retailPrice: "", status: "启用", initStock: "" }],
    }));
  }

  function removeSkuRow(index: number) {
    setDraft((prev) => ({ ...prev, skus: prev.skus.filter((_, i) => i !== index) }));
  }

  const skuComplete = draft.skus.every((sku) => draft.specAttributes.every((attr) => (sku.specValues[attr] ?? "").trim() !== ""));
  const canSave = Boolean(draft.name.trim() && draft.specAttributes.length > 0 && draft.skus.length > 0 && skuComplete);
  /** 表格是否展示库存列：编辑态只读库存、新增态且开启同步入库时可填初始库存 */
  const showStockCol = isEdit || useInitStock;

  function save() {
    if (!canSave) return;
    const today = new Date().toISOString().slice(0, 10);
    const targetSpuId = isEdit && spuId ? spuId : nextSpuId(allProducts);
    const suffix = targetSpuId.replace(/^SPU-/, "");

    // 复用已有 SKU 的自增序号，避免删除后编码重复
    let seq = allSkus
      .filter((sku) => sku.spuId === targetSpuId)
      .reduce((max, sku) => {
        const matched = /-(\d+)$/.exec(sku.skuId);
        return matched ? Math.max(max, Number(matched[1])) : max;
      }, 0);

    const nextSkus: ErpSku[] = draft.skus.map((skuDraft) => {
      const existing = skuDraft.skuId ? allSkus.find((sku) => sku.skuId === skuDraft.skuId) : undefined;
      const costPrice = Number(skuDraft.costPrice);
      const retailPrice = Number(skuDraft.retailPrice);
      // 新增 SKU 可录入初始库存 —— 相当于自动生成一张「初始入库单」
      const initQty = Number(skuDraft.initStock);
      const initStockByWarehouse =
        !existing && useInitStock && Number.isFinite(initQty) && initQty > 0
          ? { [draft.initWarehouseId]: Math.floor(initQty) }
          : {};
      return {
        skuId: skuDraft.skuId || `SKU-${suffix}-${String(++seq).padStart(2, "0")}`,
        spuId: targetSpuId,
        specValues: { ...skuDraft.specValues },
        barcode: skuDraft.barcode.trim(),
        image: skuDraft.image,
        costPrice: Number.isFinite(costPrice) && skuDraft.costPrice !== "" ? costPrice : existing?.costPrice ?? 0,
        retailPrice: Number.isFinite(retailPrice) && skuDraft.retailPrice !== "" ? retailPrice : existing?.retailPrice ?? 0,
        status: skuDraft.status,
        stockByWarehouse: existing?.stockByWarehouse ?? initStockByWarehouse,
        createdAt: existing?.createdAt ?? today,
      };
    });

    const nextProduct: ErpProduct = {
      spuId: targetSpuId,
      name: draft.name.trim(),
      manufacturer: draft.manufacturer.trim(),
      category: draft.category,
      validityTo: draft.validityTo,
      registrationNo: draft.registrationNo.trim(),
      productionLicenseNo: draft.productionLicenseNo.trim(),
      manualName: draft.manualName.trim(),
      images: [...draft.images],
      certificateImages: [...draft.certificateImages],
      specAttributes: [...draft.specAttributes],
      createdAt: initial?.product.createdAt ?? today,
    };

    saveProductOverride(nextProduct, nextSkus);
    navigate("/inventory/product");
  }

  if (isEdit && !initial) {
    return (
      <div className="min-h-full flex flex-col gap-4">
        <div className="bg-white rounded-2xl card-shadow border border-gray-100 p-8 text-center">
          <div className="text-base font-bold text-gray-900">未找到该商品档案</div>
          <div className="mt-2 text-sm text-slate-500">商品 SPU 编码 {spuId} 在商品库中不存在，可能已被移除。</div>
          <button
            className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            onClick={() => navigate("/inventory/product")}
          >
            <ArrowLeft weight="bold" className="h-4 w-4" />
            返回商品列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col gap-4">
      <div className="bg-white rounded-2xl card-shadow border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 p-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-start gap-3">
              <button
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                onClick={() => navigate("/inventory/product")}
              >
                <ArrowLeft weight="bold" className="h-4 w-4" />
                返回商品列表
              </button>
              <div>
                <div className="text-lg font-bold leading-7 text-gray-900">{isEdit ? "编辑商品档案" : "新增商品档案"}</div>
                <div className="mt-0.5 text-xs text-slate-500">
                  {isEdit
                    ? `${draft.name || "商品"} · ${spuId} · 商品（SPU）承载注册证 / 资质信息，SKU 承载规格与价格；库存请在「入库管理 / 出库管理」中维护。`
                    : useInitStock
                      ? "商品（SPU）承载注册证 / 资质信息，SKU 承载规格与价格；可在此登记初始库存，保存后自动生成一张初始入库单。"
                      : "商品（SPU）承载注册证 / 资质信息，SKU 承载规格与价格；本档案不登记初始库存，库存请在「入库管理」中录入。"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
                本档案属于「库存管理 · 商品管理」
              </span>
            </div>
          </div>
        </div>
      </div>

      <FormSection title="基础信息" desc="商品名称与分类决定规格属性模板；有效期用于临期与过期预警；商品图片支持多张。">
        <div className="grid gap-5 md:grid-cols-2">
          <FieldRow label="商品名称">
            <input className={inputCls} value={draft.name} onChange={(e) => patchDraft({ name: e.target.value })} placeholder="例如：角膜塑形镜（夜戴型）" />
          </FieldRow>
          <FieldRow label="生产厂家">
            <input className={inputCls} value={draft.manufacturer} onChange={(e) => patchDraft({ manufacturer: e.target.value })} placeholder="生产企业全称" />
          </FieldRow>
          <FieldRow label="商品分类">
            <Select
              value={draft.category}
              onChange={(value) => {
                const nextCategory = value as ProductCategory;
                setDraft((prev) => ({
                  ...prev,
                  category: nextCategory,
                  specAttributes: prev.specAttributes.filter((attr) => categorySpecTemplates[nextCategory].includes(attr)),
                }));
              }}
              options={categoryEditOptions}
              triggerClassName="h-12 rounded-2xl px-4 text-sm font-semibold"
              dropdownClassName="rounded-2xl"
            />
          </FieldRow>
          <FieldRow label="有效期至">
            <input type="date" className={inputCls} value={draft.validityTo} onChange={(e) => patchDraft({ validityTo: e.target.value })} />
          </FieldRow>
        </div>
        <div className="mt-5">
          <FieldRow label="商品图片" hint="可上传多张，第一张作为封面，商城侧可只读引用">
            <ImagePicker
              images={draft.images}
              onChange={(images) => patchDraft({ images })}
              onError={setUploadError}
              max={8}
              maxLabel="已达 8 张上限"
            />
          </FieldRow>
        </div>
      </FormSection>

      <FormSection title="资质信息" desc="注册证级信息挂在商品（SPU）上，商城与订单可只读引用。">
        <div className="grid gap-5 md:grid-cols-2">
          <FieldRow label="注册证 / 备案凭证编号">
            <input className={inputCls} value={draft.registrationNo} onChange={(e) => patchDraft({ registrationNo: e.target.value })} placeholder="例如：国械注准20163220147" />
          </FieldRow>
          <FieldRow label="生产许可证 / 备案凭证编号">
            <input className={inputCls} value={draft.productionLicenseNo} onChange={(e) => patchDraft({ productionLicenseNo: e.target.value })} placeholder="例如：皖食药监械生产许20160023" />
          </FieldRow>
          <FieldRow label="商品说明书文件名">
            <input className={inputCls} value={draft.manualName} onChange={(e) => patchDraft({ manualName: e.target.value })} placeholder="例如：角膜塑形镜用户说明书.pdf" />
          </FieldRow>
        </div>
        <div className="mt-5">
          <FieldRow label="产品注册证 / 备案凭证图片" hint="可上传多张，订单与商城资质展示时只读引用">
            <ImagePicker
              images={draft.certificateImages}
              onChange={(certificateImages) => patchDraft({ certificateImages })}
              onError={setUploadError}
              label="上传证照"
              max={6}
              maxLabel="已达 6 张上限"
              coverBadge={false}
            />
          </FieldRow>
        </div>
      </FormSection>

      <FormSection title={`规格属性（取自「${draft.category}」模板）`} desc="勾选后，下方 SKU 将按所选属性组合定义规格。">
        <div className="flex flex-wrap gap-3">
          {categorySpecTemplates[draft.category].map((attr) => {
            const selected = draft.specAttributes.includes(attr);
            return (
              <button
                key={attr}
                type="button"
                onClick={() => toggleAttribute(attr)}
                className={clsx(
                  "inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition",
                  selected ? "border-primary-300 bg-primary-50 text-primary-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                )}
              >
                <span
                  className={clsx(
                    "flex h-4 w-4 items-center justify-center rounded border",
                    selected ? "border-primary-500 bg-primary-500 text-white" : "border-slate-300 bg-white text-transparent"
                  )}
                >
                  <Check weight="bold" className="h-3 w-3" />
                </span>
                {attr}
              </button>
            );
          })}
        </div>
      </FormSection>

      <FormSection title="SKU 明细" desc="每一行是一个可独立入库、独立上架的规格；SKU 编码按商品号自动生成。">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {!isEdit ? (
            <div className="flex items-center gap-2">
              <Switch checked={useInitStock} onChange={setUseInitStock} />
              <span className="text-sm font-semibold text-slate-700">建档时同步入库</span>
            </div>
          ) : (
            <div />
          )}
          <div className="flex flex-wrap items-center gap-3">
            {!isEdit && useInitStock ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">初始入库仓库</span>
                <Select
                  value={draft.initWarehouseId}
                  onChange={(value) => patchDraft({ initWarehouseId: value })}
                  options={initialWarehouses.map((warehouse) => ({ value: warehouse.id, label: warehouse.name }))}
                  className="min-w-[160px]"
                  triggerClassName="h-9 rounded-xl px-3 text-xs font-semibold"
                  dropdownClassName="rounded-xl"
                />
              </div>
            ) : null}
            <button
              type="button"
              onClick={addSkuRow}
              disabled={draft.specAttributes.length === 0}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
            >
              <Plus weight="bold" className="h-3.5 w-3.5" />
              新增 SKU
            </button>
          </div>
        </div>

        {!isEdit ? (
          useInitStock ? (
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-primary-200 bg-primary-50/70 px-4 py-3">
              <Info weight="fill" className="mt-0.5 h-4 w-4 flex-none text-primary-500" />
              <div className="text-xs leading-5 text-primary-700">
                <span className="font-bold">关于初始库存：</span>
                在「初始库存」列填入数量，保存档案时会
                <span className="font-semibold">自动生成一张初始入库单</span>
                ，将该数量登记到上方所选仓库；若留空则不产生库存，后续可在「入库管理」中单独录入。
              </div>
            </div>
          ) : (
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-3">
              <WarningCircle weight="fill" className="mt-0.5 h-4 w-4 flex-none text-amber-500" />
              <div className="text-xs leading-5 text-amber-700">
                <span className="font-bold">未启用同步入库：</span>
                保存后只生成 SPU 与 SKU 档案，<span className="font-semibold">不产生任何库存</span>。后续入库、出库等库存变动请统一在「入库管理 / 出库管理」中操作，商品档案页不支持修改库存。
              </div>
            </div>
          )
        ) : null}

        <div className="mt-4">
          {draft.specAttributes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-5 py-8 text-center text-sm text-slate-400">
              请先在上方选择至少一个规格属性
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full min-w-[980px] text-left">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400">
                  <tr>
                    {draft.specAttributes.map((attr) => (
                      <th key={attr} className="px-3 py-2.5 font-semibold">
                        {attr}
                      </th>
                    ))}
                    <th className="px-3 py-2.5 font-semibold">条码</th>
                    <th className="w-[76px] px-3 py-2.5 font-semibold">图片</th>
                    <th className="w-[92px] px-3 py-2.5 font-semibold">成本价</th>
                    <th className="w-[92px] px-3 py-2.5 font-semibold">零售价</th>
                    <th className="w-[92px] px-3 py-2.5 font-semibold">状态</th>
                    {showStockCol ? (
                      <th className="w-[130px] px-3 py-2.5 font-semibold">
                        {isEdit ? (
                          "库存（只读）"
                        ) : (
                          <span
                            className="inline-flex items-center gap-1"
                            title="保存档案时自动生成初始入库单，将数量登记到所选仓库"
                          >
                            初始库存
                            <Info weight="bold" className="h-3 w-3 text-slate-400" />
                          </span>
                        )}
                      </th>
                    ) : null}
                    <th className="w-[60px] px-3 py-2.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {draft.skus.map((skuDraft, index) => {
                    const existing = skuDraft.skuId ? allSkus.find((sku) => sku.skuId === skuDraft.skuId) : undefined;
                    return (
                      <tr key={skuDraft.skuId || `new-${index}`}>
                        {draft.specAttributes.map((attr) => (
                          <td key={attr} className="px-3 py-2.5">
                            <input
                              className={cellInputCls}
                              value={skuDraft.specValues[attr] ?? ""}
                              placeholder={`请输入${attr}`}
                              onChange={(e) => patchSku(index, { specValues: { ...skuDraft.specValues, [attr]: e.target.value } })}
                            />
                          </td>
                        ))}
                        <td className="px-3 py-2.5">
                          <input className={cellInputCls} value={skuDraft.barcode} placeholder="条码" onChange={(e) => patchSku(index, { barcode: e.target.value })} />
                        </td>
                        <td className="px-3 py-2.5">
                          <ImagePicker
                            images={skuDraft.image ? [skuDraft.image] : []}
                            onChange={(next) => patchSku(index, { image: next[0] ?? "" })}
                            onError={setUploadError}
                            multiple={false}
                            max={1}
                            size="h-14 w-14"
                            showLabels={false}
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          <input className={cellInputCls} inputMode="decimal" value={skuDraft.costPrice} placeholder="0" onChange={(e) => patchSku(index, { costPrice: e.target.value })} />
                        </td>
                        <td className="px-3 py-2.5">
                          <input className={cellInputCls} inputMode="decimal" value={skuDraft.retailPrice} placeholder="0" onChange={(e) => patchSku(index, { retailPrice: e.target.value })} />
                        </td>
                        <td className="px-3 py-2.5">
                          <Select
                            value={skuDraft.status}
                            onChange={(value) => patchSku(index, { status: value as ErpSku["status"] })}
                            options={statusOptions}
                            triggerClassName="h-9 rounded-xl px-2.5 text-xs font-semibold"
                            dropdownClassName="rounded-xl"
                          />
                        </td>
                        {showStockCol ? (
                          <td className="px-3 py-2.5">
                            {isEdit ? (
                              <div className="flex flex-col gap-0.5 text-[11px] leading-5 text-slate-500">
                                {initialWarehouses.map((warehouse) => (
                                  <span key={warehouse.id}>
                                    {warehouse.name} {existing ? getSkuWarehouseStock(existing, warehouse.id) : 0}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <input
                                className={cellInputCls}
                                inputMode="numeric"
                                value={skuDraft.initStock}
                                placeholder="0"
                                onChange={(e) => patchSku(index, { initStock: e.target.value })}
                              />
                            )}
                          </td>
                        ) : null}
                        <td className="px-3 py-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => removeSkuRow(index)}
                            className="rounded-lg p-1.5 text-slate-300 hover:bg-rose-50 hover:text-rose-500"
                          >
                            <Trash weight="bold" className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {draft.skus.length === 0 && (
                    <tr>
                      <td colSpan={draft.specAttributes.length + (showStockCol ? 7 : 6)} className="px-4 py-10 text-center text-sm text-slate-400">
                        暂无 SKU，请点击「新增 SKU」添加规格
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </FormSection>

      <div className="sticky bottom-0 z-10 flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white/95 px-5 py-4 card-shadow backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          {uploadError ? (
            <>
              <WarningCircle weight="bold" className="h-4 w-4 flex-none text-rose-500" />
              <span className="text-rose-500">{uploadError}</span>
            </>
          ) : draft.skus.length > 0 && !skuComplete ? (
            <>
              <Info weight="bold" className="h-4 w-4 flex-none text-rose-500" />
              <span className="text-rose-500">每个 SKU 的所有规格属性都必须填写后才能保存</span>
            </>
          ) : (
            <>
              <Info weight="bold" className="h-4 w-4 flex-none text-primary-500" />
              <span>
                {isEdit
                  ? "保存后仅更新商品与 SKU 档案，库存变动仍需通过出入库单。"
                  : useInitStock
                    ? "保存后同时生成 SPU、SKU 与初始入库单。"
                    : "保存后仅生成 SPU 与 SKU 档案，库存请在「入库管理」中录入。"}
              </span>
            </>
          )}
        </div>
        <div className="flex justify-end gap-3">
          <button
            className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            onClick={() => navigate("/inventory/product")}
          >
            取消
          </button>
          <button
            className="rounded-2xl bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-primary-300"
            disabled={!canSave}
            onClick={save}
          >
            {isEdit ? "保存修改" : "保存档案"}
          </button>
        </div>
      </div>
    </div>
  );
}
