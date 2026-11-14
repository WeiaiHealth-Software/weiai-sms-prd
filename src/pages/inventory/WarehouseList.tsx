import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { Plus, WarningCircle, Warehouse as WarehouseIcon } from "@phosphor-icons/react";
import { erpSkus, initialWarehouses, getSkuWarehouseStock, type Warehouse } from "./mockData";
import { getMergedSkus } from "./productStore";
import { initialShops } from "../mall/mockData";

type WarehouseDraft = {
  name: string;
  address: string;
  isDefault: boolean;
};

const initialDraft: WarehouseDraft = { name: "", address: "", isDefault: false };

export default function WarehouseList() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>(initialWarehouses);
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState<WarehouseDraft>(initialDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Warehouse | null>(null);

  // 含本次会话在「商品管理」中新增 / 编辑的商品档案
  const skus = useMemo(() => getMergedSkus(erpSkus), []);
  const skuCount = (warehouseId: string) => skus.filter((sku) => getSkuWarehouseStock(sku, warehouseId) > 0).length;
  const stockTotal = (warehouseId: string) => skus.reduce((sum, sku) => sum + getSkuWarehouseStock(sku, warehouseId), 0);
  const boundShops = (warehouseId: string) => initialShops.filter((shop) => shop.warehouseIds.includes(warehouseId));

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setDraft(initialDraft);
  }

  function openCreate() {
    setDraft(initialDraft);
    setEditingId(null);
    setModalOpen(true);
  }

  function openEdit(warehouse: Warehouse) {
    setDraft({ name: warehouse.name, address: warehouse.address, isDefault: warehouse.isDefault });
    setEditingId(warehouse.id);
    setModalOpen(true);
  }

  function saveWarehouse() {
    const name = draft.name.trim();
    if (!name) return;
    const today = new Date().toISOString().slice(0, 10);
    setWarehouses((prev) => {
      const next = editingId
        ? prev.map((item) => (item.id === editingId ? { ...item, name, address: draft.address.trim() } : item))
        : [
            ...prev,
            {
              id: `WH-${String(prev.length + 1).padStart(3, "0")}`,
              name,
              address: draft.address.trim(),
              isDefault: false,
              createdAt: today,
            },
          ];
      if (!draft.isDefault) return next;
      const targetId = editingId ?? next[next.length - 1].id;
      return next.map((item) => ({ ...item, isDefault: item.id === targetId }));
    });
    closeModal();
  }

  function setDefault(warehouse: Warehouse) {
    setWarehouses((prev) => prev.map((item) => ({ ...item, isDefault: item.id === warehouse.id })));
  }

  function confirmDelete() {
    if (!deleteCandidate) return;
    setWarehouses((prev) => prev.filter((item) => item.id !== deleteCandidate.id));
    setDeleteCandidate(null);
  }

  const modal =
    modalOpen && typeof document !== "undefined"
      ? createPortal(
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/35 px-4 py-8" onClick={closeModal}>
            <div
              className="w-full max-w-[640px] rounded-[32px] bg-white px-8 py-7 shadow-[0_24px_80px_rgba(15,23,42,0.18)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[20px] font-bold leading-8 text-gray-900">{editingId ? "编辑仓库" : "新增仓库"}</div>
                  <div className="mt-1 text-sm font-medium leading-6 text-slate-500">仓库作为商品库存的存放单元，支持多仓管理。</div>
                </div>
                <button className="rounded-2xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200" onClick={closeModal}>
                  关闭
                </button>
              </div>

              <div className="mt-7 space-y-5">
                <div>
                  <div className="text-sm font-semibold text-slate-500">仓库名称</div>
                  <input
                    value={draft.name}
                    onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="例如：惟爱上海仓库"
                    className="mt-3 h-14 w-full rounded-[24px] border border-slate-200 bg-white px-5 text-base font-semibold text-slate-700 outline-none placeholder:font-medium placeholder:text-slate-400 focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-500">仓库地址</div>
                  <input
                    value={draft.address}
                    onChange={(e) => setDraft((prev) => ({ ...prev, address: e.target.value }))}
                    placeholder="例如：上海市黄浦区中山南路 88 号 3 号楼 B1"
                    className="mt-3 h-14 w-full rounded-[24px] border border-slate-200 bg-white px-5 text-base font-semibold text-slate-700 outline-none placeholder:font-medium placeholder:text-slate-400 focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setDraft((prev) => ({ ...prev, isDefault: !prev.isDefault }))}
                  className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left hover:bg-slate-50"
                >
                  <div>
                    <div className="text-sm font-semibold text-slate-700">设为默认仓库</div>
                    <div className="mt-1 text-xs text-slate-500">默认仓库用于商城订单发货的优先扣减仓。</div>
                  </div>
                  <span className={clsx("relative h-6 w-11 flex-none rounded-full transition-colors", draft.isDefault ? "bg-primary-500" : "bg-slate-300")}>
                    <span className={clsx("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", draft.isDefault ? "left-[22px]" : "left-0.5")} />
                  </span>
                </button>
              </div>

              <div className="mt-8 flex justify-end gap-4">
                <button className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-base font-semibold text-slate-600 hover:bg-slate-50" onClick={closeModal}>
                  取消
                </button>
                <button
                  className="rounded-2xl bg-primary-500 px-5 py-2.5 text-base font-semibold text-white hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-primary-300"
                  disabled={!draft.name.trim()}
                  onClick={saveWarehouse}
                >
                  确认保存
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  const deleteModal =
    deleteCandidate && typeof document !== "undefined"
      ? createPortal(
          <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/35 px-4 py-8" onClick={() => setDeleteCandidate(null)}>
            <div
              className="w-full max-w-md rounded-[28px] border border-slate-100 bg-white px-6 py-7 shadow-[0_24px_80px_rgba(15,23,42,0.18)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <WarningCircle size={24} weight="fill" />
              </div>
              <div className="mt-5 text-center text-xl font-bold text-slate-800">确认删除</div>
              <div className="mt-2 text-center text-sm leading-6 text-slate-500">
                确认删除仓库 <span className="font-semibold text-slate-700">“{deleteCandidate.name}”</span> 吗？删除前请确认该仓库已无库存。
              </div>
              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteCandidate(null)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  取消
                </button>
                <button type="button" onClick={confirmDelete} className="flex-1 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700">
                  确认删除
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
            <div className="flex min-w-0 flex-1 items-center gap-3 text-sm text-slate-500">
              <WarehouseIcon weight="duotone" className="h-5 w-5 text-primary-500" />
              共 {warehouses.length} 个仓库，默认仓库与已被店铺绑定的仓库不可删除。
            </div>
            <div className="flex items-center justify-end gap-3">
              <span aria-hidden="true" className="hidden h-6 w-px bg-gray-200 xl:block"></span>
              <button
                className="inline-flex items-center gap-2 rounded-2xl bg-primary-500 px-4 py-3 text-sm font-semibold text-white hover:bg-primary-600 active:bg-primary-700"
                onClick={openCreate}
              >
                <Plus weight="bold" className="h-4 w-4" />
                新增仓库
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed text-center">
            <colgroup>
              <col className="w-[24%]" />
              <col className="w-[34%]" />
              <col className="w-[12%]" />
              <col className="w-[10%]" />
              <col className="w-[20%]" />
            </colgroup>
            <thead className="bg-gray-50 text-xs uppercase tracking-[0.18em] text-gray-400">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">仓库名称</th>
                <th className="px-4 py-3 text-left font-semibold">仓库地址</th>
                <th className="px-4 py-3 text-center font-semibold">在库 SKU</th>
                <th className="px-4 py-3 text-center font-semibold">库存总量</th>
                <th className="px-4 py-3 text-center font-semibold">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {warehouses.map((warehouse) => (
                <tr key={warehouse.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{warehouse.name}</span>
                      {warehouse.isDefault && (
                        <span className="rounded-full border border-primary-100 bg-primary-50 px-2 py-0.5 text-[11px] font-semibold text-primary-600">默认仓库</span>
                      )}
                    </div>
                    <div className="mt-0.5 text-xs text-gray-400">{warehouse.id}</div>
                    <div className="mt-0.5 text-xs text-gray-400">
                      {boundShops(warehouse.id).length === 0
                        ? "未被店铺使用"
                        : `已绑定店铺：${boundShops(warehouse.id).map((shop) => shop.name).join("、")}`}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-left text-gray-600">
                    <span className="line-clamp-2 text-xs leading-5">{warehouse.address || "—"}</span>
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-gray-800">{skuCount(warehouse.id)}</td>
                  <td className="px-4 py-3 text-center font-semibold text-gray-800">{stockTotal(warehouse.id)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-4">
                      <button
                        className="rounded-md bg-primary-50 px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-100 hover:text-primary-700"
                        onClick={() => openEdit(warehouse)}
                      >
                        编辑
                      </button>
                      <button
                        className="text-sm font-medium text-emerald-600 hover:text-emerald-700 disabled:cursor-not-allowed disabled:text-gray-300"
                        disabled={warehouse.isDefault}
                        onClick={() => setDefault(warehouse)}
                      >
                        设为默认
                      </button>
                      <button
                        className="text-sm font-medium text-rose-500 hover:text-rose-600 disabled:cursor-not-allowed disabled:text-gray-300"
                        disabled={warehouse.isDefault || boundShops(warehouse.id).length > 0}
                        onClick={() => setDeleteCandidate(warehouse)}
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {modal}
      {deleteModal}
    </div>
  );
}
