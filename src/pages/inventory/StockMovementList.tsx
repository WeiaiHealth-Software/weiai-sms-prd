import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router";
import clsx from "clsx";
import { Plus, Info, Trash, WarningCircle, ArrowDown, ArrowUp } from "@phosphor-icons/react";
import Select, { type SelectOption } from "../../components/form/Select";
import InfoRow from "../../components/product/InfoRow";
import StatusTag from "../../components/product/StatusTag";
import SkuSelect from "../../components/product/SkuSelect";
import type { StatusTone } from "../../components/product/StatusTag";
import {
  erpProducts,
  erpSkus,
  getSkuSpecText,
  getSkuWarehouseStock,
  getMovementTotalQty,
  getMovementTotalAmount,
  initialStockMovements,
  initialWarehouses,
  movementTypesByDirection,
  type MovementDirection,
  type MovementStatus,
  type MovementType,
  type StockMovement,
} from "./mockData";
import { getMergedProductMap, getMergedSkus, getMergedSkuMap } from "./productStore";

type TypeFilter = "全部类型" | MovementType;
type WarehouseFilter = "全部仓库" | string;
type StatusFilter = "全部状态" | MovementStatus;

type ItemDraft = { skuId: string; quantity: string; unitPrice: string };

type MovementDraft = {
  type: MovementType;
  warehouseId: string;
  partner: string;
  operator: string;
  remark: string;
  items: ItemDraft[];
};

const statusFilterOptions: SelectOption[] = ["全部状态", "草稿", "已确认", "已作废"].map((item) => ({ value: item, label: item }));

const inputCls =
  "h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none placeholder:font-medium placeholder:text-slate-400 focus:border-primary-300 focus:ring-2 focus:ring-primary-100";

const cellInputCls =
  "h-9 w-full rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 outline-none placeholder:font-medium placeholder:text-slate-300 focus:border-primary-300 focus:ring-2 focus:ring-primary-100";

const statusToneMap: Record<MovementStatus, StatusTone> = {
  已确认: "success",
  已作废: "danger",
  草稿: "neutral",
};

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-sm font-semibold text-slate-500">{label}</div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function money(value: number) {
  return `¥${value.toFixed(2)}`;
}

export default function StockMovementList({ direction }: { direction: MovementDirection }) {
  const isInbound = direction === "入库";
  const docLabel = isInbound ? "入库单" : "出库单";
  const navigate = useNavigate();
  // 只能引用「商品管理」中已建档的 SKU，含本次会话新增的商品档案
  const skus = useMemo(() => getMergedSkus(erpSkus), []);
  const productMap = useMemo(() => getMergedProductMap(erpProducts), []);
  const skuMap = useMemo(() => getMergedSkuMap(erpSkus), []);

  const [movements, setMovements] = useState<StockMovement[]>(() =>
    initialStockMovements.filter((movement) => movement.direction === direction)
  );
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("全部类型");
  const [warehouseFilter, setWarehouseFilter] = useState<WarehouseFilter>("全部仓库");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("全部状态");
  const [keyword, setKeyword] = useState("");

  const [draft, setDraft] = useState<MovementDraft | null>(null);
  const [detail, setDetail] = useState<StockMovement | null>(null);
  const [voidCandidate, setVoidCandidate] = useState<StockMovement | null>(null);

  const typeFilterOptions: SelectOption[] = useMemo(
    () => [{ value: "全部类型", label: "全部类型" }, ...movementTypesByDirection[direction].map((item) => ({ value: item, label: item }))],
    [direction]
  );
  const typeEditOptions: SelectOption[] = movementTypesByDirection[direction].map((item) => ({ value: item, label: item }));
  const warehouseFilterOptions: SelectOption[] = useMemo(
    () => [{ value: "全部仓库", label: "全部仓库" }, ...initialWarehouses.map((item) => ({ value: item.id, label: item.name }))],
    []
  );
  const warehouseEditOptions: SelectOption[] = initialWarehouses.map((item) => ({ value: item.id, label: item.name }));

  const warehouseName = (id: string) => initialWarehouses.find((item) => item.id === id)?.name ?? id;

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return movements.filter((movement) => {
      if (typeFilter !== "全部类型" && movement.type !== typeFilter) return false;
      if (warehouseFilter !== "全部仓库" && movement.warehouseId !== warehouseFilter) return false;
      if (statusFilter !== "全部状态" && movement.status !== statusFilter) return false;
      if (kw && !`${movement.id} ${movement.partner} ${movement.operator}`.toLowerCase().includes(kw)) return false;
      return true;
    });
  }, [keyword, movements, statusFilter, typeFilter, warehouseFilter]);

  const summaryOf = (movement: StockMovement) => {
    const first = movement.items[0];
    if (!first) return { name: "—", spec: "", more: 0 };
    const sku = skuMap[first.skuId];
    return {
      name: sku ? productMap[sku.spuId]?.name ?? sku.spuId : first.skuId,
      spec: sku ? getSkuSpecText(sku) : "",
      more: movement.items.length - 1,
    };
  };

  function openCreate() {
    setDraft({
      type: movementTypesByDirection[direction][0],
      warehouseId: initialWarehouses[0].id,
      partner: "",
      operator: "",
      remark: "",
      items: [{ skuId: "", quantity: "", unitPrice: "" }],
    });
  }

  function closeCreate() {
    setDraft(null);
  }

  const patchDraft = (patch: Partial<MovementDraft>) => setDraft((prev) => (prev ? { ...prev, ...patch } : prev));

  const patchItem = (index: number, patch: Partial<ItemDraft>) =>
    setDraft((prev) => (prev ? { ...prev, items: prev.items.map((item, i) => (i === index ? { ...item, ...patch } : item)) } : prev));

  const addItemRow = () => setDraft((prev) => (prev ? { ...prev, items: [...prev.items, { skuId: "", quantity: "", unitPrice: "" }] } : prev));

  const removeItemRow = (index: number) => setDraft((prev) => (prev ? { ...prev, items: prev.items.filter((_, i) => i !== index) } : prev));

  /** 单行可出库上限 = 该 SKU 在单据仓库的库存（出库方向才校验） */
  const maxQtyOf = (item: ItemDraft) => {
    if (!item.skuId) return 0;
    const sku = skuMap[item.skuId];
    return sku && draft ? getSkuWarehouseStock(sku, draft.warehouseId) : 0;
  };

  const itemInvalid = (item: ItemDraft) => {
    const qty = Number(item.quantity);
    if (!item.skuId) return true;
    if (!Number.isInteger(qty) || qty <= 0) return true;
    if (!isInbound && qty > maxQtyOf(item)) return true;
    return false;
  };

  const canSave = Boolean(
    draft &&
      draft.partner.trim() &&
      draft.operator.trim() &&
      draft.items.length > 0 &&
      draft.items.every((item) => !itemInvalid(item))
  );

  function save() {
    if (!draft || !canSave) return;
    const today = new Date();
    const dateKey = today.toISOString().slice(0, 10).replace(/-/g, "");
    const prefix = isInbound ? "RK" : "CK";
    const todayCount = movements.filter((movement) => movement.id.includes(dateKey)).length;
    const id = `${prefix}-${dateKey}-${String(todayCount + 1).padStart(3, "0")}`;
    const created: StockMovement = {
      id,
      direction,
      type: draft.type,
      warehouseId: draft.warehouseId,
      partner: draft.partner.trim(),
      operator: draft.operator.trim(),
      remark: draft.remark.trim(),
      status: "已确认",
      createdAt: today.toISOString().slice(0, 10),
      items: draft.items.map((item) => ({
        skuId: item.skuId,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice) || (skuMap[item.skuId]?.costPrice ?? 0),
      })),
    };
    setMovements((prev) => [created, ...prev]);
    closeCreate();
  }

  function confirmVoid() {
    if (!voidCandidate) return;
    setMovements((prev) => prev.map((item) => (item.id === voidCandidate.id ? { ...item, status: "已作废" } : item)));
    setVoidCandidate(null);
  }

  function exportCsv() {
    const header = ["单据号", "方向", "类型", "仓库", "往来单位", "SKU 编码", "商品名称", "规格", "数量", "单价", "金额", "经办人", "状态", "单据日期"];
    const lines = filtered.flatMap((movement) =>
      movement.items.map((item) => {
        const sku = skuMap[item.skuId];
        return [
          movement.id,
          movement.direction,
          movement.type,
          warehouseName(movement.warehouseId),
          movement.partner,
          item.skuId,
          sku ? productMap[sku.spuId]?.name ?? sku.spuId : item.skuId,
          sku ? getSkuSpecText(sku) : "",
          item.quantity,
          item.unitPrice,
          item.quantity * item.unitPrice,
          movement.operator,
          movement.status,
          movement.createdAt,
        ]
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(",");
      })
    );
    const csv = "\uFEFF" + [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${direction}单据_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const createModal =
    draft && typeof document !== "undefined"
      ? createPortal(
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/35 px-4 py-8" onClick={closeCreate}>
            <div
              className="flex max-h-[88vh] w-full max-w-[960px] flex-col overflow-hidden rounded-[32px] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-8 py-6">
                <div>
                  <div className="text-[20px] font-bold leading-8 text-gray-900">新建{docLabel}</div>
                  <div className="mt-1 text-sm font-medium leading-6 text-slate-500">
                    {isInbound ? "入库确认后增加仓库库存，商城可上架上限随之提高。" : "出库确认后扣减仓库库存，商城可上架上限随之降低。"}
                  </div>
                </div>
                <button className="rounded-2xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200" onClick={closeCreate}>
                  关闭
                </button>
              </div>

              <div className="flex-1 space-y-7 overflow-y-auto px-8 py-6">
                <section className="space-y-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">单据信息</div>
                  <div className="grid gap-5 md:grid-cols-2">
                    <FieldRow label="仓库">
                      <Select
                        value={draft.warehouseId}
                        onChange={(value) => patchDraft({ warehouseId: value })}
                        options={warehouseEditOptions}
                        triggerClassName="h-12 rounded-2xl px-4 text-sm font-semibold"
                        dropdownClassName="rounded-2xl"
                      />
                    </FieldRow>
                    <FieldRow label="单据类型">
                      <Select
                        value={draft.type}
                        onChange={(value) => patchDraft({ type: value as MovementType })}
                        options={typeEditOptions}
                        triggerClassName="h-12 rounded-2xl px-4 text-sm font-semibold"
                        dropdownClassName="rounded-2xl"
                      />
                    </FieldRow>
                    <FieldRow label={isInbound ? "供应商 / 往来单位" : "领用部门 / 客户"}>
                      <input
                        className={inputCls}
                        value={draft.partner}
                        onChange={(e) => patchDraft({ partner: e.target.value })}
                        placeholder={isInbound ? "例如：上海美尼康光学有限公司" : "例如：线上商城订单 SO-20261103-007"}
                      />
                    </FieldRow>
                    <FieldRow label="经办人">
                      <input className={inputCls} value={draft.operator} onChange={(e) => patchDraft({ operator: e.target.value })} placeholder="例如：仓管员 · 李伟" />
                    </FieldRow>
                  </div>
                  <FieldRow label="备注">
                    <textarea
                      rows={2}
                      value={draft.remark}
                      onChange={(e) => patchDraft({ remark: e.target.value })}
                      placeholder="选填，例如物流单号、到货批次说明"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700 outline-none placeholder:text-slate-400 focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                    />
                  </FieldRow>
                </section>

                <section className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">商品明细</div>
                    <button
                      type="button"
                      onClick={addItemRow}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      <Plus weight="bold" className="h-3.5 w-3.5" />
                      新增明细
                    </button>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full min-w-[760px] text-left">
                      <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400">
                        <tr>
                          <th className="px-3 py-2.5 font-semibold">商品 / 规格</th>
                          <th className="w-[110px] px-3 py-2.5 font-semibold">数量</th>
                          <th className="w-[110px] px-3 py-2.5 font-semibold">单价</th>
                          <th className="w-[130px] px-3 py-2.5 font-semibold">仓内库存</th>
                          <th className="w-[60px] px-3 py-2.5" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {draft.items.map((item, index) => {
                          const sku = item.skuId ? skuMap[item.skuId] : undefined;
                          const qty = Number(item.quantity);
                          const overStock = !isInbound && item.skuId && Number.isInteger(qty) && qty > maxQtyOf(item);
                          return (
                            <tr key={index}>
                              <td className="px-3 py-2.5">
                                <SkuSelect
                                  value={item.skuId}
                                  onChange={(value) => {
                                    const picked = skuMap[value];
                                    patchItem(index, { skuId: value, unitPrice: item.unitPrice || String(picked?.costPrice ?? "") });
                                  }}
                                  skus={skus}
                                  placeholder="请选择 SKU"
                                  triggerClassName="h-9 rounded-xl px-2.5 text-xs font-semibold"
                                  dropdownClassName="rounded-xl"
                                  onCreateNew={() => navigate("/inventory/product/new")}
                                />
                              </td>
                              <td className="px-3 py-2.5">
                                <input
                                  className={clsx(cellInputCls, overStock && "border-rose-300 text-rose-600")}
                                  inputMode="numeric"
                                  value={item.quantity}
                                  placeholder="0"
                                  onChange={(e) => patchItem(index, { quantity: e.target.value })}
                                />
                              </td>
                              <td className="px-3 py-2.5">
                                <input
                                  className={cellInputCls}
                                  inputMode="decimal"
                                  value={item.unitPrice}
                                  placeholder={sku ? String(sku.costPrice) : "0"}
                                  onChange={(e) => patchItem(index, { unitPrice: e.target.value })}
                                />
                              </td>
                              <td className="px-3 py-2.5">
                                <span className={clsx("text-[11px] font-semibold", overStock ? "text-rose-500" : "text-slate-500")}>
                                  {item.skuId ? `${getSkuWarehouseStock(skuMap[item.skuId], draft.warehouseId)} 件` : "—"}
                                  {overStock && " · 超出库存"}
                                </span>
                              </td>
                              <td className="px-3 py-2.5 text-right">
                                <button
                                  type="button"
                                  onClick={() => removeItemRow(index)}
                                  className="rounded-lg p-1.5 text-slate-300 hover:bg-rose-50 hover:text-rose-500"
                                >
                                  <Trash weight="bold" className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                        {draft.items.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-400">
                              暂无明细，请点击「新增明细」添加商品
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  {!isInbound && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <WarningCircle weight="bold" className="h-4 w-4 flex-none text-orange-400" />
                      出库数量不得超过该 SKU 在「{warehouseName(draft.warehouseId)}」的现有库存。
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Info weight="bold" className="h-4 w-4 flex-none text-primary-500" />
                    {docLabel}只能引用「库存管理 · 商品管理」中已建档的 SKU；下拉底部可跳转新建商品档案。
                  </div>
                </section>
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-gray-100 px-8 py-5">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Info weight="bold" className="h-4 w-4 flex-none text-primary-500" />
                  本单{direction}合计 <span className="font-semibold text-slate-700">{draft.items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)}</span> 件
                </div>
                <div className="flex gap-4">
                  <button className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-base font-semibold text-slate-600 hover:bg-slate-50" onClick={closeCreate}>
                    取消
                  </button>
                  <button
                    className="rounded-2xl bg-primary-500 px-5 py-2.5 text-base font-semibold text-white hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-primary-300"
                    disabled={!canSave}
                    onClick={save}
                  >
                    确认{direction}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  const detailModal =
    detail && typeof document !== "undefined"
      ? createPortal(
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/35 px-4 py-8" onClick={() => setDetail(null)}>
            <div
              className="flex max-h-[88vh] w-full max-w-[880px] flex-col overflow-hidden rounded-[32px] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-8 py-6">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-[20px] font-bold leading-8 text-gray-900">{detail.id}</span>
                    <StatusTag status={detail.status} tone={statusToneMap[detail.status]} />
                  </div>
                  <div className="mt-1 text-sm font-medium leading-6 text-slate-500">{detail.type} · {detail.createdAt}</div>
                </div>
                <button className="rounded-2xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200" onClick={() => setDetail(null)}>
                  关闭
                </button>
              </div>

              <div className="flex-1 space-y-6 overflow-y-auto px-8 py-6">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
                  <div className="grid gap-3 md:grid-cols-2">
                    <InfoRow label="方向" value={detail.direction} labelClassName="w-24" />
                    <InfoRow label="类型" value={detail.type} labelClassName="w-24" />
                    <InfoRow label="仓库" value={warehouseName(detail.warehouseId)} labelClassName="w-24" />
                    <InfoRow label={detail.direction === "入库" ? "供应商" : "领用部门 / 客户"} value={detail.partner} labelClassName="w-24" />
                    <InfoRow label="经办人" value={detail.operator} labelClassName="w-24" />
                    <InfoRow label="单据日期" value={detail.createdAt} labelClassName="w-24" />
                    <InfoRow label="备注" value={detail.remark || "—"} labelClassName="w-24" />
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full min-w-[680px] text-left">
                    <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400">
                      <tr>
                        <th className="px-3 py-2.5 font-semibold">商品</th>
                        <th className="px-3 py-2.5 font-semibold">规格</th>
                        <th className="w-[80px] px-3 py-2.5 font-semibold">数量</th>
                        <th className="w-[100px] px-3 py-2.5 font-semibold">单价</th>
                        <th className="w-[110px] px-3 py-2.5 font-semibold">金额</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {detail.items.map((item) => {
                        const sku = skuMap[item.skuId];
                        return (
                          <tr key={item.skuId}>
                            <td className="px-3 py-2.5">
                              <div className="text-sm font-semibold text-slate-700">{sku ? productMap[sku.spuId]?.name ?? sku.spuId : item.skuId}</div>
                              <div className="text-[11px] text-slate-400">{item.skuId}</div>
                            </td>
                            <td className="px-3 py-2.5 text-xs text-slate-500">{sku ? getSkuSpecText(sku) : "—"}</td>
                            <td className="px-3 py-2.5 text-sm font-semibold text-slate-700">{item.quantity}</td>
                            <td className="px-3 py-2.5 text-sm text-slate-500">{money(item.unitPrice)}</td>
                            <td className="px-3 py-2.5 text-sm font-semibold text-slate-700">{money(item.quantity * item.unitPrice)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-slate-50 text-sm">
                      <tr>
                        <td className="px-3 py-2.5 font-semibold text-slate-500" colSpan={2}>
                          合计
                        </td>
                        <td className="px-3 py-2.5 font-bold text-slate-800">{getMovementTotalQty(detail)}</td>
                        <td />
                        <td className="px-3 py-2.5 font-bold text-slate-800">{money(getMovementTotalAmount(detail))}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  const voidModal =
    voidCandidate && typeof document !== "undefined"
      ? createPortal(
          <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/35 px-4 py-8" onClick={() => setVoidCandidate(null)}>
            <div
              className="w-full max-w-md rounded-[28px] border border-slate-100 bg-white px-6 py-7 shadow-[0_24px_80px_rgba(15,23,42,0.18)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <WarningCircle size={24} weight="fill" />
              </div>
              <div className="mt-5 text-center text-xl font-bold text-slate-800">确认作废{docLabel}</div>
              <div className="mt-2 text-center text-sm leading-6 text-slate-500">
                确认作废单据 <span className="font-semibold text-slate-700">“{voidCandidate.id}”</span> 吗？作废后该单据不再影响库存。
              </div>
              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => setVoidCandidate(null)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  取消
                </button>
                <button type="button" onClick={confirmVoid} className="flex-1 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700">
                  确认作废
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
                value={typeFilter}
                onChange={(value) => setTypeFilter(value as TypeFilter)}
                options={typeFilterOptions}
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
              <Select
                value={statusFilter}
                onChange={(value) => setStatusFilter(value as StatusFilter)}
                options={statusFilterOptions}
                className="min-w-[128px]"
                triggerClassName="h-[46px] rounded-2xl border-gray-200 px-4"
              />
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder={`搜索单据号 / ${isInbound ? "供应商" : "往来单位"} / 经办人`}
                className="h-[46px] w-full max-w-[300px] rounded-2xl border border-gray-200 bg-white px-4 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
              />
            </div>
            <div className="flex items-center justify-end gap-3">
              <span aria-hidden="true" className="hidden h-6 w-px bg-gray-200 xl:block"></span>
              <button
                className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                onClick={exportCsv}
              >
                导出{docLabel}
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-2xl bg-primary-500 px-4 py-3 text-sm font-semibold text-white hover:bg-primary-600 active:bg-primary-700"
                onClick={openCreate}
              >
                <Plus weight="bold" className="h-4 w-4" />
                新建{docLabel}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 border-t border-gray-100 bg-slate-50/60 px-4 py-2.5 text-xs text-slate-500">
            {isInbound ? (
              <ArrowDown weight="bold" className="h-4 w-4 flex-none text-emerald-500" />
            ) : (
              <ArrowUp weight="bold" className="h-4 w-4 flex-none text-rose-500" />
            )}
            {isInbound
              ? "入库增加仓库库存，商城可上架上限随之提高；库存以「仓库 + SKU」为最小单元。"
              : "出库扣减仓库库存，商城可上架上限随之降低；商城订单发货将自动生成销售出库单。"}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] table-fixed text-center">
            <colgroup>
              <col className="w-[15%]" />
              <col className="w-[13%]" />
              <col className="w-[20%]" />
              <col className="w-[9%]" />
              <col className="w-[12%]" />
              <col className="w-[10%]" />
              <col className="w-[11%]" />
              <col className="w-[10%]" />
            </colgroup>
            <thead className="bg-gray-50 text-xs uppercase tracking-[0.18em] text-gray-400">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">单据号</th>
                <th className="px-4 py-3 text-left font-semibold">类型</th>
                <th className="px-4 py-3 text-left font-semibold">商品明细</th>
                <th className="px-4 py-3 text-center font-semibold">数量</th>
                <th className="px-4 py-3 text-left font-semibold">仓库</th>
                <th className="px-4 py-3 text-left font-semibold">经办人</th>
                <th className="px-4 py-3 text-center font-semibold">状态</th>
                <th className="px-4 py-3 text-center font-semibold">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filtered.map((movement) => {
                const summary = summaryOf(movement);
                return (
                  <tr key={movement.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-left">
                      <div className="truncate font-semibold text-gray-900">{movement.id}</div>
                      <div className="mt-0.5 truncate text-xs text-gray-500">{movement.createdAt}</div>
                    </td>
                    <td className="px-4 py-3 text-left">
                      <span className="inline-flex rounded-full border border-primary-100 bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-600">
                        {movement.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-left">
                      <div className="truncate text-gray-700">{summary.name}</div>
                      <div className="mt-0.5 truncate text-xs text-gray-400">
                        {summary.spec}
                        {summary.more > 0 ? ` 等 ${movement.items.length} 项` : ""}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-gray-900">{getMovementTotalQty(movement)}</td>
                    <td className="px-4 py-3 text-left text-gray-600">
                      <span className="line-clamp-2 text-xs leading-5">{warehouseName(movement.warehouseId)}</span>
                    </td>
                    <td className="px-4 py-3 text-left text-gray-600">
                      <span className="line-clamp-2 text-xs leading-5">{movement.operator}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusTag status={movement.status} tone={statusToneMap[movement.status]} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          className="rounded-md bg-primary-50 px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-100 hover:text-primary-700"
                          onClick={() => setDetail(movement)}
                        >
                          查看
                        </button>
                        <button
                          className="text-sm font-medium text-rose-500 hover:text-rose-600 disabled:cursor-not-allowed disabled:text-gray-300"
                          disabled={movement.status === "已作废"}
                          onClick={() => setVoidCandidate(movement)}
                        >
                          作废
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-sm text-gray-400">
                    暂无符合条件的{docLabel}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-sm text-gray-500">
          <div>
            共 {filtered.length} 张{docLabel} · 合计 {filtered.reduce((sum, movement) => sum + getMovementTotalQty(movement), 0)} 件
          </div>
        </div>
      </div>
      {createModal}
      {detailModal}
      {voidModal}
    </div>
  );
}
