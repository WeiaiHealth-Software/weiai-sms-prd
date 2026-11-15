import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowRight, MagnifyingGlass, Plus, Storefront, X } from "@phosphor-icons/react";
import clsx from "clsx";
import StatusTag, { type StatusTone } from "../../components/product/StatusTag";
import { ORG_WAREHOUSES, STORES, getSharedStores, getWarehouseName, type Store, type StoreStatus } from "../../lib/org";
import { setCurrentStoreId } from "../../lib/storeContext";

const statusTone: Record<StoreStatus, StatusTone> = {
  营业中: "success",
  筹备中: "warning",
  已停用: "neutral",
};

function formatMoney(value: number) {
  return `¥ ${value.toLocaleString("zh-CN")}`;
}

function formatNumber(value: number) {
  return value.toLocaleString("zh-CN");
}

export default function StoreList() {
  const navigate = useNavigate();
  const [extraStores, setExtraStores] = useState<Store[]>([]);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<"全部状态" | StoreStatus>("全部状态");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const allStores = useMemo(() => [...STORES, ...extraStores], [extraStores]);

  const totals = useMemo(() => {
    const opening = allStores.filter((store) => store.status === "营业中");
    return {
      count: allStores.length,
      opening: opening.length,
      preparing: allStores.filter((store) => store.status === "筹备中").length,
      revenue: opening.reduce((sum, store) => sum + store.metrics.revenue, 0),
      orders: opening.reduce((sum, store) => sum + store.metrics.orders, 0),
      newClients: opening.reduce((sum, store) => sum + store.metrics.newClients, 0),
      lowStock: opening.reduce((sum, store) => sum + store.metrics.lowStock, 0),
    };
  }, [allStores]);

  const visibleStores = useMemo(
    () =>
      allStores.filter((store) => {
        const matchKeyword =
          keyword.trim().length === 0 ||
          store.name.includes(keyword.trim()) ||
          store.city.includes(keyword.trim()) ||
          store.code.toLowerCase().includes(keyword.trim().toLowerCase());
        const matchStatus = statusFilter === "全部状态" || store.status === statusFilter;
        return matchKeyword && matchStatus;
      }),
    [allStores, keyword, statusFilter]
  );

  const enterStore = (store: Store) => {
    // 记录当前门店上下文，再进入该门店的单店工作区
    setCurrentStoreId(store.id);
    navigate("/");
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      {/* 全门店关键指标 */}
      <div className="grid flex-none grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <div className="flex flex-col justify-between rounded-2xl bg-primary-500 p-4 text-white card-shadow">
          <div className="text-xs font-semibold text-white/80">门店总数</div>
          <div className="mt-2 text-2xl font-bold tracking-tight">{totals.count}</div>
          <div className="mt-1 text-[11px] text-white/80">
            营业中 {totals.opening} · 筹备中 {totals.preparing}
          </div>
        </div>
        {[
          { label: "近 30 天营收", value: formatMoney(totals.revenue), hint: "仅统计营业门店" },
          { label: "近 30 天成交", value: `${formatNumber(totals.orders)} 单`, hint: "全门店合计" },
          { label: "新增客户", value: formatNumber(totals.newClients), hint: "全门店合计" },
          { label: "低库存预警", value: `${totals.lowStock} 项`, hint: "共享仓按仓库去重" },
        ].map((card) => (
          <div key={card.label} className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-4 card-shadow">
            <div className="text-xs font-semibold text-gray-500">{card.label}</div>
            <div className="mt-2 text-xl font-bold tracking-tight text-gray-900">{card.value}</div>
            <div className="mt-1 text-[11px] text-gray-400">{card.hint}</div>
          </div>
        ))}
      </div>

      {/* 筛选与新建 */}
      <div className="flex flex-none flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
          <div className="relative">
            <MagnifyingGlass weight="bold" className="absolute left-3 top-2.5 text-gray-400" />
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="搜索门店名称/编号/城市..."
              className="w-64 rounded-lg border border-gray-200 py-2 pl-9 pr-4 text-sm transition focus:border-primary-500 focus:outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as "全部状态" | StoreStatus)}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 focus:border-primary-500 focus:outline-none"
          >
            <option value="全部状态">全部状态</option>
            <option value="营业中">营业中</option>
            <option value="筹备中">筹备中</option>
            <option value="已停用">已停用</option>
          </select>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-600"
        >
          <Plus weight="bold" className="mr-2" /> 新建门店
        </button>
      </div>

      {/* 门店列表 */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse text-left">
            <thead className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-600">门店</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-600">负责人</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-600">关联仓库</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-600">状态</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-600">近 30 天营收</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-600">预约 / 到诊</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visibleStores.map((store) => (
                <tr key={store.id} className="group transition-colors hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                        <Storefront weight="duotone" className="text-lg" />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-bold text-slate-800">{store.name}</div>
                        <div className="text-xs text-slate-400">
                          {store.code} · {store.city}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{store.manager}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {store.warehouseIds.map((warehouseId) => {
                        const shared = getSharedStores(warehouseId).length > 1;
                        return (
                          <span
                            key={warehouseId}
                            className={clsx(
                              "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold",
                              shared
                                ? "border-amber-200 bg-amber-50 text-amber-700"
                                : "border-slate-200 bg-slate-50 text-slate-600"
                            )}
                            title={shared ? "该仓库同时服务多家门店（共享仓）" : "门店专属仓库"}
                          >
                            {getWarehouseName(warehouseId)}
                            {shared ? " · 共享" : ""}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusTag status={store.status} tone={statusTone[store.status]} />
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-slate-800">
                    {store.status === "营业中" ? formatMoney(store.metrics.revenue) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-slate-600">
                    {store.status === "营业中"
                      ? `${formatNumber(store.metrics.appointments)} / ${formatNumber(store.metrics.arrived)}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => enterStore(store)}
                      disabled={store.status === "已停用"}
                      className="inline-flex items-center gap-1 rounded-lg border border-primary-200 bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700 transition hover:bg-primary-100 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-400"
                    >
                      进入门店工作区
                      <ArrowRight weight="bold" />
                    </button>
                  </td>
                </tr>
              ))}
              {visibleStores.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-sm text-gray-400">
                    没有符合条件的门店
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex-none border-t border-gray-100 px-4 py-2 text-xs text-gray-400">
          共 {visibleStores.length} 家门店 · 进入门店工作区后可查看该门店的完整业务明细
        </div>
      </div>

      {isCreateOpen && (
        <CreateStoreDialog
          onClose={() => setIsCreateOpen(false)}
          onCreate={(store) => {
            setExtraStores((prev) => [...prev, store]);
            setIsCreateOpen(false);
          }}
          existingCount={allStores.length}
        />
      )}
    </div>
  );
}

function CreateStoreDialog({
  onClose,
  onCreate,
  existingCount,
}: {
  onClose: () => void;
  onCreate: (store: Store) => void;
  existingCount: number;
}) {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [manager, setManager] = useState("");
  const [warehouseIds, setWarehouseIds] = useState<string[]>([]);

  const canSubmit = name.trim().length > 0 && city.trim().length > 0 && warehouseIds.length > 0;

  const toggleWarehouse = (id: string) => {
    setWarehouseIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="text-base font-bold text-gray-900">新建门店</h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <X weight="bold" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-gray-500">门店名称</label>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="如：惟爱深圳南山门店"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-500">城市</label>
              <input
                value={city}
                onChange={(event) => setCity(event.target.value)}
                placeholder="深圳"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-500">联系电话</label>
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="0755-0000 0000"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>
            <div className="col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-gray-500">门店地址</label>
              <input
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="深圳市南山区…"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>
            <div className="col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-gray-500">门店店长</label>
              <input
                value={manager}
                onChange={(event) => setManager(event.target.value)}
                placeholder="店长姓名"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-500">关联仓库（可多选，支持共享仓）</label>
            <div className="space-y-2">
              {ORG_WAREHOUSES.map((warehouse) => {
                const shared = getSharedStores(warehouse.id).length > 0;
                return (
                  <label
                    key={warehouse.id}
                    className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 px-3 py-2.5 transition hover:border-primary-200 hover:bg-primary-50/40"
                  >
                    <input
                      type="checkbox"
                      checked={warehouseIds.includes(warehouse.id)}
                      onChange={() => toggleWarehouse(warehouse.id)}
                      className="mt-0.5 h-4 w-4 flex-none accent-primary-500"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                        {warehouse.name}
                        {shared && (
                          <span className="rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                            已被其他门店关联
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 text-xs text-gray-400">{warehouse.address}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl bg-gray-50 px-3 py-2.5 text-xs text-gray-500">
            保存后门店为「筹备中」，需创建或指定店长账号后再启用；共享仓的可用库存由关联门店共用。
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            取消
          </button>
          <button
            disabled={!canSubmit}
            onClick={() =>
              onCreate({
                id: `ST-${String(existingCount + 1).padStart(3, "0")}`,
                name: name.trim(),
                code: `NEW-${String(existingCount + 1).padStart(2, "0")}`,
                city: city.trim(),
                address: address.trim() || "待补充",
                phone: phone.trim() || "待补充",
                manager: manager.trim() || "待指定",
                status: "筹备中",
                openedAt: "待开业",
                warehouseIds,
                metrics: { revenue: 0, orders: 0, newClients: 0, appointments: 0, arrived: 0, lowStock: 0 },
              })
            }
            className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-primary-200"
          >
            保存门店
          </button>
        </div>
      </div>
    </div>
  );
}
