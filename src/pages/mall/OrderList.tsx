import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import {
  Info,
  WarningCircle,
  Truck,
  X,
  Download,
  Package,
  MapPin,
  Phone,
  User,
  Clock,
  NotePencil,
  CheckCircle,
  Check,
} from "@phosphor-icons/react";
import Select, { type SelectOption } from "../../components/form/Select";
import InfoRow from "../../components/product/InfoRow";
import StatusTag, { type StatusTone } from "../../components/product/StatusTag";
import {
  initialShops,
} from "./mockData";
import {
  initialOrders,
  getOrderPayAmount,
  getOrderTotalQty,
  getShopName,
  getShopWarehouse,
  getWarehouseName,
  type MallOrder,
  type OrderStatus,
} from "./orderData";

type StatusFilter = "全部状态" | OrderStatus;
type ShopFilter = "全部店铺" | string;

const statusFilterOptions: SelectOption[] = [
  "全部状态",
  "待付款",
  "待发货",
  "已发货",
  "已完成",
  "已取消",
  "售后中",
].map((item) => ({ value: item, label: item }));

const shopFilterOptions: SelectOption[] = [
  { value: "全部店铺", label: "全部店铺" },
  ...initialShops.map((shop) => ({ value: shop.id, label: shop.name })),
];

const logisticsCompanyOptions: SelectOption[] = [
  "顺丰速运",
  "京东物流",
  "中通快递",
  "圆通速递",
  "韵达快递",
  "申通快递",
  "EMS",
].map((item) => ({ value: item, label: item }));

/** 物流公司品牌色与缩写，用于在下拉中渲染彩色 logo 方块 */
const logisticsCompanyMeta: Record<string, { color: string; abbr: string }> = {
  顺丰速运: { color: "#1A1A1A", abbr: "顺" },
  京东物流: { color: "#E1251B", abbr: "京" },
  中通快递: { color: "#0099FF", abbr: "中" },
  圆通速递: { color: "#FF6600", abbr: "圆" },
  韵达快递: { color: "#FFA500", abbr: "韵" },
  申通快递: { color: "#FF5000", abbr: "申" },
  EMS: { color: "#006633", abbr: "E" },
};

/** 物流公司 logo：品牌色圆角方块 + 白色首字，不依赖外部图片资源 */
function CompanyLogo({ name, size = 22 }: { name: string; size?: number }) {
  const meta = logisticsCompanyMeta[name];
  if (!meta) return null;
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-md font-bold text-white"
      style={{ width: size, height: size, backgroundColor: meta.color, fontSize: size * 0.5 }}
    >
      {meta.abbr}
    </span>
  );
}

const statusToneMap: Record<OrderStatus, StatusTone> = {
  待付款: "warning",
  待发货: "primary",
  已发货: "primary",
  已完成: "success",
  已取消: "neutral",
  售后中: "danger",
};

function money(value: number) {
  return `¥${value.toFixed(2)}`;
}

export default function OrderList() {
  const [orders, setOrders] = useState<MallOrder[]>(initialOrders);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("全部状态");
  const [shopFilter, setShopFilter] = useState<ShopFilter>("全部店铺");
  const [keyword, setKeyword] = useState("");

  const [detail, setDetail] = useState<MallOrder | null>(null);
  const [shipCandidate, setShipCandidate] = useState<MallOrder | null>(null);
  const [shipCompany, setShipCompany] = useState("顺丰速运");
  const [shipTrackingNo, setShipTrackingNo] = useState("");
  const [cancelCandidate, setCancelCandidate] = useState<MallOrder | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [remarkOrder, setRemarkOrder] = useState<MallOrder | null>(null);
  const [remarkText, setRemarkText] = useState("");

  const shopName = (shopId: string) => getShopName(shopId);

  const summaryOf = (order: MallOrder) => {
    const first = order.items[0];
    if (!first) return { name: "—", spec: "", more: 0 };
    return {
      name: first.productName,
      spec: first.specText,
      more: order.items.length - 1,
    };
  };

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return orders
      .filter((order) => {
        if (statusFilter !== "全部状态" && order.status !== statusFilter) return false;
        if (shopFilter !== "全部店铺" && order.shopId !== shopFilter) return false;
        if (kw) {
          const haystack = `${order.id} ${order.customerName} ${order.customerPhone} ${order.receiverName} ${order.receiverPhone} ${order.items.map((i) => i.productName).join(" ")}`.toLowerCase();
          if (!haystack.includes(kw)) return false;
        }
        return true;
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [keyword, orders, statusFilter, shopFilter]);

  const stats = useMemo(() => {
    const base: Record<OrderStatus, number> = { 待付款: 0, 待发货: 0, 已发货: 0, 已完成: 0, 已取消: 0, 售后中: 0 };
    for (const order of orders) base[order.status]++;
    return base;
  }, [orders]);

  function openShip(order: MallOrder) {
    setShipCandidate(order);
    setShipCompany("顺丰速运");
    setShipTrackingNo("");
  }

  function confirmShip() {
    if (!shipCandidate || !shipTrackingNo.trim()) return;
    const now = new Date();
    const shippedAt = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`;
    setOrders((prev) =>
      prev.map((order) =>
        order.id === shipCandidate.id
          ? { ...order, status: "已发货", logistics: { company: shipCompany, trackingNo: shipTrackingNo.trim(), shippedAt } }
          : order
      )
    );
    setShipCandidate(null);
  }

  function openCancel(order: MallOrder) {
    setCancelCandidate(order);
    setCancelReason("");
  }

  function confirmCancel() {
    if (!cancelCandidate) return;
    const now = new Date();
    const cancelledAt = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`;
    setOrders((prev) =>
      prev.map((order) =>
        order.id === cancelCandidate.id
          ? { ...order, status: "已取消", cancelledAt, cancelReason: cancelReason.trim() || "商家取消" }
          : order
      )
    );
    setCancelCandidate(null);
  }

  function openRemark(order: MallOrder) {
    setRemarkOrder(order);
    setRemarkText(order.remark);
  }

  function saveRemark() {
    if (!remarkOrder) return;
    setOrders((prev) =>
      prev.map((order) => (order.id === remarkOrder.id ? { ...order, remark: remarkText.trim() } : order))
    );
    setRemarkOrder(null);
  }

  function exportCsv() {
    const header = [
      "订单号",
      "店铺",
      "状态",
      "客户",
      "联系电话",
      "收货人",
      "收货电话",
      "收货地址",
      "商品",
      "规格",
      "数量",
      "单价",
      "金额",
      "运费",
      "实付金额",
      "支付方式",
      "物流公司",
      "快递单号",
      "下单时间",
      "商家备注",
    ];
    const lines = filtered.flatMap((order) =>
      order.items.map((item) =>
        [
          order.id,
          shopName(order.shopId),
          order.status,
          order.customerName,
          order.customerPhone,
          order.receiverName,
          order.receiverPhone,
          order.receiverAddress,
          item.productName,
          item.specText,
          item.quantity,
          item.unitPrice,
          item.quantity * item.unitPrice,
          order.shippingFee,
          getOrderPayAmount(order),
          order.payMethod,
          order.logistics?.company ?? "",
          order.logistics?.trackingNo ?? "",
          order.createdAt,
          order.remark,
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
    link.download = `商城订单_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

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
                  <div className="mt-1 text-sm font-medium leading-6 text-slate-500">{shopName(detail.shopId)} · 下单于 {detail.createdAt}</div>
                </div>
                <button className="rounded-2xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200" onClick={() => setDetail(null)}>
                  关闭
                </button>
              </div>

              <div className="flex-1 space-y-6 overflow-y-auto px-8 py-6">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
                  <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <User weight="bold" className="h-3.5 w-3.5" />
                    下单客户
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <InfoRow label="客户姓名" value={detail.customerName} />
                    <InfoRow label="联系电话" value={detail.customerPhone} />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
                  <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <MapPin weight="bold" className="h-3.5 w-3.5" />
                    收货信息
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-sm">
                      <Phone weight="bold" className="mt-0.5 h-3.5 w-3.5 flex-none text-slate-400" />
                      <span className="font-semibold text-slate-700">{detail.receiverName}</span>
                      <span className="text-slate-500">{detail.receiverPhone}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin weight="bold" className="mt-0.5 h-3.5 w-3.5 flex-none text-slate-400" />
                      <span className="flex-1 break-all text-slate-600">{detail.receiverAddress}</span>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full min-w-[560px] text-left">
                    <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400">
                      <tr>
                        <th className="px-3 py-2.5 font-semibold">商品</th>
                        <th className="px-3 py-2.5 font-semibold">规格</th>
                        <th className="w-[70px] px-3 py-2.5 text-center font-semibold">数量</th>
                        <th className="w-[100px] px-3 py-2.5 text-right font-semibold">单价</th>
                        <th className="w-[110px] px-3 py-2.5 text-right font-semibold">金额</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {detail.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-3">
                              {item.image ? (
                                <img src={item.image} alt={item.productName} className="h-11 w-11 flex-none rounded-lg object-cover" />
                              ) : (
                                <div className="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-slate-100">
                                  <Package className="h-5 w-5 text-slate-300" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="truncate text-sm font-semibold text-slate-700">{item.productName}</div>
                                <div className="text-[11px] text-slate-400">{item.skuId}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-xs text-slate-500">{item.specText}</td>
                          <td className="px-3 py-3 text-center text-sm font-semibold text-slate-700">{item.quantity}</td>
                          <td className="px-3 py-3 text-right text-sm text-slate-500">{money(item.unitPrice)}</td>
                          <td className="px-3 py-3 text-right text-sm font-semibold text-slate-700">{money(item.quantity * item.unitPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 text-sm">
                      <tr>
                        <td className="px-3 py-2.5 font-semibold text-slate-500" colSpan={2}>
                          合计 {getOrderTotalQty(detail)} 件
                        </td>
                        <td className="px-3 py-2.5" />
                        <td className="px-3 py-2.5 text-right text-slate-500">运费</td>
                        <td className="px-3 py-2.5 text-right text-slate-700">{money(detail.shippingFee)}</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2.5" colSpan={3} />
                        <td className="px-3 py-2.5 text-right font-semibold text-slate-700">实付金额</td>
                        <td className="px-3 py-2.5 text-right text-base font-bold text-primary-600">{money(getOrderPayAmount(detail))}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
                    <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                      <Info weight="bold" className="h-3.5 w-3.5" />
                      支付与物流
                    </div>
                    <div className="space-y-2.5">
                      <InfoRow label="支付方式" value={detail.payMethod} />
                      <InfoRow label="支付时间" value={detail.paidAt ?? "—"} />
                      <InfoRow label="物流公司" value={detail.logistics?.company ?? "—"} />
                      <InfoRow
                        label="快递单号"
                        value={
                          detail.logistics ? (
                            <span className="inline-flex items-center gap-1.5">
                              {detail.logistics.trackingNo}
                              <a
                                href={`https://www.kuaidi100.com/chaxun?nu=${detail.logistics.trackingNo}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary-600 underline decoration-dotted underline-offset-2 hover:text-primary-700"
                              >
                                查物流
                              </a>
                            </span>
                          ) : (
                            "—"
                          )
                        }
                      />
                      <InfoRow label="发货时间" value={detail.logistics?.shippedAt ?? "—"} />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
                    <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                      <Clock weight="bold" className="h-3.5 w-3.5" />
                      订单轨迹
                    </div>
                    <ol className="space-y-3 text-sm">
                      <li className="flex gap-3">
                        <CheckCircle weight="fill" className="mt-0.5 h-4 w-4 flex-none text-emerald-500" />
                        <div>
                          <div className="font-semibold text-slate-700">订单创建</div>
                          <div className="text-xs text-slate-400">{detail.createdAt}</div>
                        </div>
                      </li>
                      {detail.paidAt && (
                        <li className="flex gap-3">
                          <CheckCircle weight="fill" className="mt-0.5 h-4 w-4 flex-none text-emerald-500" />
                          <div>
                            <div className="font-semibold text-slate-700">买家付款</div>
                            <div className="text-xs text-slate-400">{detail.paidAt}</div>
                          </div>
                        </li>
                      )}
                      {detail.logistics && (
                        <li className="flex gap-3">
                          <Truck weight="fill" className="mt-0.5 h-4 w-4 flex-none text-primary-500" />
                          <div>
                            <div className="font-semibold text-slate-700">商家发货 · {detail.logistics.company}</div>
                            <div className="text-xs text-slate-400">{detail.logistics.shippedAt} · {detail.logistics.trackingNo}</div>
                          </div>
                        </li>
                      )}
                      {detail.completedAt && (
                        <li className="flex gap-3">
                          <CheckCircle weight="fill" className="mt-0.5 h-4 w-4 flex-none text-emerald-500" />
                          <div>
                            <div className="font-semibold text-slate-700">交易完成</div>
                            <div className="text-xs text-slate-400">{detail.completedAt}</div>
                          </div>
                        </li>
                      )}
                      {detail.cancelledAt && (
                        <li className="flex gap-3">
                          <X weight="fill" className="mt-0.5 h-4 w-4 flex-none text-slate-400" />
                          <div>
                            <div className="font-semibold text-slate-700">订单取消</div>
                            <div className="text-xs text-slate-400">{detail.cancelledAt}{detail.cancelReason ? ` · ${detail.cancelReason}` : ""}</div>
                          </div>
                        </li>
                      )}
                    </ol>
                  </div>
                </div>

                {detail.remark && (
                  <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4">
                    <div className="flex items-start gap-2 text-sm">
                      <NotePencil weight="bold" className="mt-0.5 h-4 w-4 flex-none text-amber-500" />
                      <div>
                        <div className="font-semibold text-amber-700">商家备注</div>
                        <div className="mt-0.5 text-amber-600">{detail.remark}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  const shipModal =
    shipCandidate && typeof document !== "undefined"
      ? createPortal(
          <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/35 px-4 py-8" onClick={() => setShipCandidate(null)}>
            <div
              className="w-full max-w-[520px] rounded-[28px] bg-white px-7 py-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                  <Truck size={22} weight="bold" />
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-800">确认发货</div>
                  <div className="text-xs text-slate-500">订单 {shipCandidate.id} · {shopName(shipCandidate.shopId)}</div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl bg-slate-50 p-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">发货仓库</span>
                    <span className="font-semibold text-slate-700">{getWarehouseName(getShopWarehouse(shipCandidate.shopId) ?? "")}</span>
                  </div>
                  <div className="mt-2 flex justify-between">
                    <span className="text-slate-500">商品件数</span>
                    <span className="font-semibold text-slate-700">{getOrderTotalQty(shipCandidate)} 件</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-500">物流公司</div>
                  <Select
                    value={shipCompany}
                    onChange={setShipCompany}
                    options={logisticsCompanyOptions}
                    className="mt-2"
                    triggerClassName="h-12 rounded-2xl px-4 text-sm font-semibold"
                    dropdownClassName="rounded-2xl"
                    renderValue={(option) =>
                      option ? (
                        <span className="flex items-center gap-2">
                          <CompanyLogo name={option.value} />
                          {option.label}
                        </span>
                      ) : null
                    }
                    renderOption={(option, state) => (
                      <>
                        <span className="flex items-center gap-2">
                          <CompanyLogo name={option.value} />
                          {option.label}
                        </span>
                        {state.selected ? <Check className="h-4 w-4 text-primary-600" /> : null}
                      </>
                    )}
                  />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-500">快递单号</div>
                  <input
                    value={shipTrackingNo}
                    onChange={(e) => setShipTrackingNo(e.target.value)}
                    placeholder="请输入快递单号"
                    className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none placeholder:font-medium placeholder:text-slate-400 focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
                <div className="flex items-start gap-2 rounded-xl bg-primary-50/60 p-3 text-xs text-primary-700">
                  <Info weight="bold" className="mt-0.5 h-3.5 w-3.5 flex-none" />
                  发货后将自动生成「销售出库」单据，扣减对应仓库库存。
                </div>
              </div>

              <div className="mt-7 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShipCandidate(null)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={confirmShip}
                  disabled={!shipTrackingNo.trim()}
                  className="flex-1 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-primary-300"
                >
                  确认发货
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  const cancelModal =
    cancelCandidate && typeof document !== "undefined"
      ? createPortal(
          <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/35 px-4 py-8" onClick={() => setCancelCandidate(null)}>
            <div
              className="w-full max-w-[520px] rounded-[28px] bg-white px-7 py-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                  <WarningCircle size={22} weight="fill" />
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-800">取消订单</div>
                  <div className="text-xs text-slate-500">订单 {cancelCandidate.id}</div>
                </div>
              </div>

              <div className="mt-6">
                <div className="text-sm font-semibold text-slate-500">取消原因</div>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={3}
                  placeholder="例如：客户主动取消、库存不足等"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700 outline-none placeholder:text-slate-400 focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                />
              </div>

              <div className="mt-7 flex gap-3">
                <button
                  type="button"
                  onClick={() => setCancelCandidate(null)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  返回
                </button>
                <button
                  type="button"
                  onClick={confirmCancel}
                  className="flex-1 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700"
                >
                  确认取消
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  const remarkModal =
    remarkOrder && typeof document !== "undefined"
      ? createPortal(
          <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/35 px-4 py-8" onClick={() => setRemarkOrder(null)}>
            <div
              className="w-full max-w-[520px] rounded-[28px] bg-white px-7 py-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="text-lg font-bold text-slate-800">编辑商家备注</div>
              <div className="mt-1 text-xs text-slate-500">订单 {remarkOrder.id}</div>
              <textarea
                value={remarkText}
                onChange={(e) => setRemarkText(e.target.value)}
                rows={4}
                placeholder="选填，例如客户特殊要求、发货注意事项等"
                className="mt-5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700 outline-none placeholder:text-slate-400 focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
              />
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setRemarkOrder(null)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={saveRemark}
                  className="flex-1 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-600"
                >
                  保存
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div className="min-h-full flex flex-col gap-4">
      {/* 状态统计卡片 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {(["待付款", "待发货", "已发货", "已完成", "已取消", "售后中"] as OrderStatus[]).map((status) => {
          const active = statusFilter === status;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(active ? "全部状态" : status)}
              className={clsx(
                "rounded-2xl border p-4 text-left transition",
                active
                  ? "border-primary-300 bg-primary-50/70 shadow-sm"
                  : "border-gray-100 bg-white card-shadow hover:border-gray-200"
              )}
            >
              <div className={clsx("text-sm font-medium", active ? "text-primary-700" : "text-slate-500")}>{status}</div>
              <div className={clsx("mt-1.5 text-2xl font-bold", active ? "text-primary-600" : "text-slate-800")}>{stats[status]}</div>
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl card-shadow border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100">
          <div className="flex flex-col gap-3 p-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
              <Select
                value={statusFilter}
                onChange={(value) => setStatusFilter(value as StatusFilter)}
                options={statusFilterOptions}
                className="min-w-[128px]"
                triggerClassName="h-[46px] rounded-2xl border-gray-200 px-4"
              />
              <Select
                value={shopFilter}
                onChange={(value) => setShopFilter(value)}
                options={shopFilterOptions}
                className="min-w-[150px]"
                triggerClassName="h-[46px] rounded-2xl border-gray-200 px-4"
              />
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="搜索订单号 / 客户 / 商品"
                className="h-[46px] w-full max-w-[280px] rounded-2xl border border-gray-200 bg-white px-4 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
              />
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                onClick={exportCsv}
              >
                <Download weight="bold" className="h-4 w-4" />
                导出订单
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 border-t border-gray-100 bg-slate-50/60 px-4 py-2.5 text-xs text-slate-500">
            <Info weight="bold" className="h-4 w-4 flex-none text-primary-500" />
            发货将自动生成「销售出库」单据并扣减库存；订单商品为下单时快照，不受商品档案变更影响。
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] table-fixed text-center">
            <colgroup>
              <col className="w-[15%]" />
              <col className="w-[9%]" />
              <col className="w-[22%]" />
              <col className="w-[8%]" />
              <col className="w-[10%]" />
              <col className="w-[10%]" />
              <col className="w-[8%]" />
              <col className="w-[18%]" />
            </colgroup>
            <thead className="bg-gray-50 text-xs uppercase tracking-[0.18em] text-gray-400">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">订单号</th>
                <th className="px-4 py-3 text-center font-semibold">状态</th>
                <th className="px-4 py-3 text-left font-semibold">商品明细</th>
                <th className="px-4 py-3 text-center font-semibold">件数</th>
                <th className="px-4 py-3 text-left font-semibold">客户</th>
                <th className="px-4 py-3 text-left font-semibold">店铺</th>
                <th className="px-4 py-3 text-right font-semibold">实付</th>
                <th className="px-4 py-3 text-center font-semibold">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filtered.map((order) => {
                const summary = summaryOf(order);
                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-left">
                      <div className="truncate font-semibold text-gray-900">{order.id}</div>
                      <div className="mt-0.5 truncate text-xs text-gray-500">{order.createdAt}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusTag status={order.status} tone={statusToneMap[order.status]} />
                    </td>
                    <td className="px-4 py-3 text-left">
                      <div className="truncate text-gray-700">{summary.name}</div>
                      <div className="mt-0.5 truncate text-xs text-gray-400">
                        {summary.spec}
                        {summary.more > 0 ? ` 等 ${order.items.length} 项` : ""}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-gray-900">{getOrderTotalQty(order)}</td>
                    <td className="px-4 py-3 text-left text-gray-600">
                      <div className="truncate text-xs font-medium">{order.customerName}</div>
                      <div className="truncate text-xs text-gray-400">{order.customerPhone}</div>
                    </td>
                    <td className="px-4 py-3 text-left text-gray-600">
                      <span className="line-clamp-2 text-xs leading-5">{shopName(order.shopId)}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">{money(getOrderPayAmount(order))}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5">
                        <button
                          className="rounded-md bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-600 hover:bg-primary-100 hover:text-primary-700"
                          onClick={() => setDetail(order)}
                        >
                          详情
                        </button>
                        {order.status === "待发货" && (
                          <button
                            className="rounded-md bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700"
                            onClick={() => openShip(order)}
                          >
                            发货
                          </button>
                        )}
                        {(order.status === "待付款" || order.status === "待发货") && (
                          <button
                            className="text-xs font-medium text-rose-500 hover:text-rose-600"
                            onClick={() => openCancel(order)}
                          >
                            取消
                          </button>
                        )}
                        <button
                          className="text-xs font-medium text-slate-500 hover:text-slate-700"
                          onClick={() => openRemark(order)}
                        >
                          备注
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-sm text-gray-400">
                    暂无符合条件的订单
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-sm text-gray-500">
          <div>
            共 {filtered.length} 个订单 · 合计 {filtered.reduce((sum, order) => sum + getOrderTotalQty(order), 0)} 件
            <span className="ml-3 text-slate-400">实付总额 {money(filtered.reduce((sum, order) => sum + getOrderPayAmount(order), 0))}</span>
          </div>
        </div>
      </div>
      {detailModal}
      {shipModal}
      {cancelModal}
      {remarkModal}
    </div>
  );
}
