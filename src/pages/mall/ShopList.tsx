import { useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { Plus, WarningCircle, Storefront, Check } from "@phosphor-icons/react";
import Select, { type SelectOption } from "../../components/form/Select";
import { initialShops, initialWarehouses, type Shop } from "./mockData";

type ShopDraft = {
  name: string;
  status: Shop["status"];
  remark: string;
  warehouseIds: string[];
};

const statusOptions: SelectOption[] = [
  { value: "启用", label: "启用" },
  { value: "停用", label: "停用" },
];

const initialDraft: ShopDraft = { name: "", status: "启用", remark: "", warehouseIds: [] };

export default function ShopList() {
  const [shops, setShops] = useState<Shop[]>(initialShops);
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState<ShopDraft>(initialDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Shop | null>(null);

  const warehouseName = (warehouseId: string) => initialWarehouses.find((item) => item.id === warehouseId)?.name ?? warehouseId;

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

  function openEdit(shop: Shop) {
    setDraft({ name: shop.name, status: shop.status, remark: shop.remark, warehouseIds: [...shop.warehouseIds] });
    setEditingId(shop.id);
    setModalOpen(true);
  }

  function toggleWarehouse(warehouseId: string) {
    setDraft((prev) => {
      const exists = prev.warehouseIds.includes(warehouseId);
      return {
        ...prev,
        warehouseIds: exists ? prev.warehouseIds.filter((id) => id !== warehouseId) : [...prev.warehouseIds, warehouseId],
      };
    });
  }

  function saveShop() {
    const name = draft.name.trim();
    if (!name || draft.warehouseIds.length === 0) return;
    const today = new Date().toISOString().slice(0, 10);
    if (editingId) {
      setShops((prev) =>
        prev.map((item) =>
          item.id === editingId ? { ...item, name, status: draft.status, remark: draft.remark, warehouseIds: draft.warehouseIds } : item
        )
      );
    } else {
      setShops((prev) => [
        ...prev,
        {
          id: `SHOP-${String(prev.length + 1).padStart(3, "0")}`,
          name,
          status: draft.status,
          remark: draft.remark,
          warehouseIds: draft.warehouseIds,
          isDefault: false,
          createdAt: today,
        },
      ]);
    }
    closeModal();
  }

  function toggleStatus(shop: Shop) {
    setShops((prev) => prev.map((item) => (item.id === shop.id ? { ...item, status: item.status === "启用" ? "停用" : "启用" } : item)));
  }

  function confirmDelete() {
    if (!deleteCandidate) return;
    setShops((prev) => prev.filter((item) => item.id !== deleteCandidate.id));
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
                  <div className="text-[20px] font-bold leading-8 text-gray-900">{editingId ? "编辑店铺" : "新增店铺"}</div>
                  <div className="mt-1 text-sm font-medium leading-6 text-slate-500">商城支持多店铺，商品上架时可按店铺分别配置。</div>
                </div>
                <button className="rounded-2xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200" onClick={closeModal}>
                  关闭
                </button>
              </div>

              <div className="mt-7 space-y-5">
                <div className="grid gap-5 md:grid-cols-[1.4fr_1fr]">
                  <div>
                    <div className="text-sm font-semibold text-slate-500">店铺名称</div>
                    <input
                      value={draft.name}
                      onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="例如：惟爱线上商城"
                      className="mt-3 h-14 w-full rounded-[24px] border border-slate-200 bg-white px-5 text-base font-semibold text-slate-700 outline-none placeholder:font-medium placeholder:text-slate-400 focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-500">状态</div>
                    <Select
                      value={draft.status}
                      onChange={(value) => setDraft((prev) => ({ ...prev, status: value as Shop["status"] }))}
                      options={statusOptions}
                      className="mt-3"
                      triggerClassName="h-14 rounded-[24px] px-5 text-base font-semibold"
                      dropdownClassName="rounded-[24px]"
                    />
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-500">发货仓库</div>
                  <div className="mt-1 text-xs text-slate-400">店铺商品的上架数量受所选仓库可用库存约束，可多选。</div>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {initialWarehouses.map((warehouse) => {
                      const selected = draft.warehouseIds.includes(warehouse.id);
                      return (
                        <button
                          key={warehouse.id}
                          type="button"
                          onClick={() => toggleWarehouse(warehouse.id)}
                          className={clsx(
                            "inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition",
                            selected
                              ? "border-primary-300 bg-primary-50 text-primary-700"
                              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
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
                          {warehouse.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-500">备注</div>
                  <textarea
                    value={draft.remark}
                    rows={3}
                    onChange={(e) => setDraft((prev) => ({ ...prev, remark: e.target.value }))}
                    placeholder="店铺用途、渠道等说明"
                    className="mt-3 w-full rounded-[24px] border border-slate-200 bg-white px-5 py-3 text-sm leading-6 text-slate-700 outline-none placeholder:text-slate-400 focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-4">
                <button className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-base font-semibold text-slate-600 hover:bg-slate-50" onClick={closeModal}>
                  取消
                </button>
                <button
                  className="rounded-2xl bg-primary-500 px-5 py-2.5 text-base font-semibold text-white hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-primary-300"
                  disabled={!draft.name.trim() || draft.warehouseIds.length === 0}
                  onClick={saveShop}
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
                确认删除店铺 <span className="font-semibold text-slate-700">“{deleteCandidate.name}”</span> 吗？删除后该店铺下的商品上架配置将失效。
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
              <Storefront weight="duotone" className="h-5 w-5 text-primary-500" />
              共 {shops.length} 个店铺，默认店铺不可删除。
            </div>
            <div className="flex items-center justify-end gap-3">
              <span aria-hidden="true" className="hidden h-6 w-px bg-gray-200 xl:block"></span>
              <button
                className="inline-flex items-center gap-2 rounded-2xl bg-primary-500 px-4 py-3 text-sm font-semibold text-white hover:bg-primary-600 active:bg-primary-700"
                onClick={openCreate}
              >
                <Plus weight="bold" className="h-4 w-4" />
                新增店铺
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed text-center">
            <colgroup>
              <col className="w-[22%]" />
              <col className="w-[10%]" />
              <col className="w-[20%]" />
              <col className="w-[16%]" />
              <col className="w-[14%]" />
              <col className="w-[18%]" />
            </colgroup>
            <thead className="bg-gray-50 text-xs uppercase tracking-[0.18em] text-gray-400">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">店铺名称</th>
                <th className="px-4 py-3 text-center font-semibold">状态</th>
                <th className="px-4 py-3 text-left font-semibold">发货仓库</th>
                <th className="px-4 py-3 text-left font-semibold">备注</th>
                <th className="px-4 py-3 text-center font-semibold">创建时间</th>
                <th className="px-4 py-3 text-center font-semibold">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {shops.map((shop) => (
                <tr key={shop.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{shop.name}</span>
                      {shop.isDefault && (
                        <span className="rounded-full border border-primary-100 bg-primary-50 px-2 py-0.5 text-[11px] font-semibold text-primary-600">默认店铺</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={clsx(
                        "inline-flex rounded-full border px-3 py-1 text-xs font-semibold",
                        shop.status === "启用" ? "border-emerald-100 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-100 text-slate-600"
                      )}
                    >
                      {shop.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-left">
                    <div className="flex flex-wrap gap-1.5">
                      {shop.warehouseIds.length === 0 ? (
                        <span className="text-xs text-slate-400">未绑定</span>
                      ) : (
                        shop.warehouseIds.map((warehouseId) => (
                          <span key={warehouseId} className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                            {warehouseName(warehouseId)}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-left text-gray-600">
                    <span className="line-clamp-2 text-xs leading-5">{shop.remark || "—"}</span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600 whitespace-nowrap">{shop.createdAt}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-4">
                      <button
                        className="rounded-md bg-primary-50 px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-100 hover:text-primary-700"
                        onClick={() => openEdit(shop)}
                      >
                        编辑
                      </button>
                      <button
                        className={clsx("text-sm font-medium", shop.status === "启用" ? "text-orange-500 hover:text-orange-600" : "text-emerald-600 hover:text-emerald-700")}
                        onClick={() => toggleStatus(shop)}
                      >
                        {shop.status === "启用" ? "停用" : "启用"}
                      </button>
                      <button
                        className="text-sm font-medium text-rose-500 hover:text-rose-600 disabled:cursor-not-allowed disabled:text-gray-300"
                        disabled={shop.isDefault}
                        onClick={() => setDeleteCandidate(shop)}
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
