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
  ArrowCounterClockwise,
  CurrencyCircleDollar,
  ShieldCheck,
  XCircle,
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
  type AfterSaleRecord,
  type AfterSaleType,
  type AfterSaleStatus,
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

/** 售后状态色调 */
const afterSaleStatusTone: Record<AfterSaleStatus, StatusTone> = {
  待审核: "warning",
  已同意: "primary",
  已拒绝: "neutral",
  退款中: "primary",
  已完成: "success",
};

function money(value: number) {
  return `¥${value.toFixed(2)}`;
}

/** 物流轨迹节点 */
type LogisticsNode = {
  time: string;
  status: string;
  location?: string;
  /** 是否已完成（用于时间线图标着色） */
  done: boolean;
};

/** 从收货地址中提取城市名（取前两个汉字，覆盖上海 / 北京 / 广州 / 深圳等） */
function extractCity(address: string): string {
  return address.slice(0, 2);
}

/** 基于字符串的确定性 hash，返回 0 ~ max-1 */
function hashStr(str: string, max: number): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h % max;
}

const courierNames = ["张伟", "李强", "王磊", "赵军", "刘洋", "陈刚", "杨涛", "周明"];
const courierPhones = ["138****1234", "139****5678", "137****9012", "136****3456", "135****7890", "133****2468"];

const cityHubs: Record<string, string> = {
  上海: "上海浦东中转场",
  北京: "北京顺义中转场",
  广州: "广州白云中转场",
  深圳: "深圳宝安中转场",
};
const cityDistricts: Record<string, string[]> = {
  上海: ["徐汇", "浦东", "长宁", "静安", "虹口", "杨浦"],
  北京: ["朝阳", "海淀", "西城", "东城", "通州", "丰台"],
  广州: ["天河", "越秀", "海珠", "番禺", "白云", "黄埔"],
  深圳: ["南山", "福田", "罗湖", "宝安", "龙岗", "龙华"],
};
const outletStreets = ["中山公园", "徐家汇", "望京", "国贸", "天河城", "珠江新城", "科技园", "华强北"];

/**
 * 根据订单发货信息生成物流轨迹。
 * 由于没有对接真实物流 API，此处根据发货仓库、收货城市与订单状态生成模拟轨迹。
 */
function getLogisticsTrack(order: MallOrder): LogisticsNode[] {
  const logistics = order.logistics;
  if (!logistics) return [];

  const shippedAt = logistics.shippedAt;
  // 从 "YYYY-MM-DD HH:mm" 解析，便于时间推算
  const shippedDate = new Date(shippedAt.replace(" ", "T"));
  if (Number.isNaN(shippedDate.getTime())) return [];

  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  const addHours = (h: number) => new Date(shippedDate.getTime() + h * 3600 * 1000);

  // 始发城市：根据店铺绑定仓库推断
  const warehouseId = getShopWarehouse(order.shopId);
  const warehouseName = warehouseId ? getWarehouseName(warehouseId) : "惟爱上海仓库";
  const originCity = warehouseName.includes("北京") ? "北京" : warehouseName.includes("广州") ? "广州" : "上海";

  // 目的城市：从收货地址提取
  const destCity = extractCity(order.receiverAddress);
  const isCrossCity = originCity !== destCity;

  // 基于订单号确定性选择快递员、网点，保证同一订单轨迹稳定
  const seed = order.id;
  const courierIdx = hashStr(seed, courierNames.length);
  const courier = `${courierNames[courierIdx]} ${courierPhones[hashStr(seed + "p", courierPhones.length)]}`;
  const originHub = cityHubs[originCity] ?? `${originCity}中转场`;
  const destDistricts = cityDistricts[destCity] ?? ["中心"];
  const destDistrict = destDistricts[hashStr(seed + "d", destDistricts.length)];
  const destStreet = outletStreets[hashStr(seed + "s", outletStreets.length)];
  // 同城时目的分拨中心用不同区，避免与始发中转场重名；跨城则用目的城市中转场
  const destHub = isCrossCity
    ? cityHubs[destCity] ?? `${destCity}分拨中心`
    : `${destCity}${destDistrict}分拨中心`;
  const destOutlet = `${destCity}${destDistrict}${destStreet}营业点`;

  const nodes: LogisticsNode[] = [
    {
      time: shippedAt,
      status: `快件已揽收 · ${logistics.company}`,
      location: `${warehouseName}（${originCity}）`,
      done: true,
    },
    {
      time: fmt(addHours(2)),
      status: `快件已出库，发往【${originHub}】`,
      location: originCity,
      done: true,
    },
    {
      time: fmt(addHours(5)),
      status: `快件到达【${originHub}】，正在分拣`,
      location: originCity,
      done: true,
    },
  ];

  if (isCrossCity) {
    nodes.push({
      time: fmt(addHours(9)),
      status: `快件离开【${originHub}】，发往【${destHub}】`,
      done: true,
    });
    nodes.push({
      time: fmt(addHours(22)),
      status: `快件到达【${destHub}】，正在分拣`,
      location: destCity,
      done: true,
    });
  } else {
    nodes.push({
      time: fmt(addHours(11)),
      status: `快件到达【${destHub}】，正在分拣`,
      location: destCity,
      done: true,
    });
  }

  nodes.push({
    time: fmt(addHours(isCrossCity ? 27 : 15)),
    status: `快件已到达【${destOutlet}】`,
    location: destCity,
    done: true,
  });

  const deliveringNode: LogisticsNode = {
    time: fmt(addHours(isCrossCity ? 29 : 17)),
    status: `快件正在派送，快递员：${courier}`,
    location: destCity,
    done: false,
  };

  const signedNode: LogisticsNode = {
    time: order.completedAt ?? fmt(addHours(isCrossCity ? 35 : 21)),
    status: `快件已签收，签收人：${order.receiverName}`,
    location: destCity,
    done: true,
  };

  // 已完成 / 售后中：走完签收全链路
  const isCompleted = order.status === "已完成" || order.status === "售后中";
  if (isCompleted) {
    deliveringNode.done = true;
    nodes.push(deliveringNode, signedNode);
  } else {
    // 已发货：停在派送中
    nodes.push(deliveringNode);
  }

  // 倒序：最新节点在前
  return nodes.reverse();
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

  // 售后处理弹窗
  const [afterSaleCandidate, setAfterSaleCandidate] = useState<MallOrder | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  // 发起售后弹窗（已完成订单模拟客户申请）
  const [applyCandidate, setApplyCandidate] = useState<MallOrder | null>(null);
  const [applyType, setApplyType] = useState<AfterSaleType>("仅退款");
  const [applyReason, setApplyReason] = useState("");

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

  // —— 售后处理 ——
  function openAfterSale(order: MallOrder) {
    setAfterSaleCandidate(order);
    setReviewNote("");
    setRefundAmount(order.afterSale?.refundAmount ? String(order.afterSale.refundAmount) : String(getOrderPayAmount(order)));
  }

  /** 同意售后：仅退款直接进入退款中；退货退款进入已同意（待客户寄回） */
  function approveAfterSale() {
    if (!afterSaleCandidate) return;
    const now = new Date();
    const ts = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`;
    const record = afterSaleCandidate.afterSale;
    if (!record) return;
    const nextStatus: AfterSaleStatus = record.type === "仅退款" ? "退款中" : "已同意";
    setOrders((prev) =>
      prev.map((order) =>
        order.id === afterSaleCandidate.id
          ? {
              ...order,
              afterSale: {
                ...record,
                status: nextStatus,
                reviewedAt: ts,
                reviewNote: reviewNote.trim() || "商家同意售后申请",
                refundAmount: Number(refundAmount) || getOrderPayAmount(order),
              },
            }
          : order
      )
    );
    setAfterSaleCandidate(null);
  }

  /** 拒绝售后 */
  function rejectAfterSale() {
    if (!afterSaleCandidate) return;
    const now = new Date();
    const ts = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`;
    const record = afterSaleCandidate.afterSale;
    if (!record) return;
    setOrders((prev) =>
      prev.map((order) =>
        order.id === afterSaleCandidate.id
          ? {
              ...order,
              status: order.completedAt ? "已完成" : order.status,
              afterSale: {
                ...record,
                status: "已拒绝",
                reviewedAt: ts,
                reviewNote: reviewNote.trim() || "商家拒绝售后申请",
              },
            }
          : order
      )
    );
    setAfterSaleCandidate(null);
  }

  /** 确认退款完成：仅退款流程完结 */
  function confirmRefund() {
    if (!afterSaleCandidate) return;
    const now = new Date();
    const ts = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`;
    const record = afterSaleCandidate.afterSale;
    if (!record) return;
    setOrders((prev) =>
      prev.map((order) =>
        order.id === afterSaleCandidate.id
          ? {
              ...order,
              status: order.completedAt ? "已完成" : order.status,
              afterSale: {
                ...record,
                status: "已完成",
                refundedAt: ts,
                refundAmount: record.refundAmount ?? getOrderPayAmount(order),
              },
            }
          : order
      )
    );
    setAfterSaleCandidate(null);
  }

  /** 确认收到退货：退货退款流程进入退款中 */
  function confirmReturnReceived() {
    if (!afterSaleCandidate) return;
    const now = new Date();
    const ts = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`;
    const record = afterSaleCandidate.afterSale;
    if (!record) return;
    setOrders((prev) =>
      prev.map((order) =>
        order.id === afterSaleCandidate.id
          ? {
              ...order,
              afterSale: {
                ...record,
                status: "退款中",
                receivedAt: ts,
              },
            }
          : order
      )
    );
    setAfterSaleCandidate(null);
  }

  /** 模拟客户发起售后申请（已完成订单） */
  function openApplyAfterSale(order: MallOrder) {
    setApplyCandidate(order);
    setApplyType("仅退款");
    setApplyReason("");
  }

  function confirmApplyAfterSale() {
    if (!applyCandidate || !applyReason.trim()) return;
    const now = new Date();
    const ts = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`;
    const record: AfterSaleRecord = {
      type: applyType,
      reason: applyReason.trim(),
      status: "待审核",
      appliedAt: ts,
    };
    setOrders((prev) =>
      prev.map((order) =>
        order.id === applyCandidate.id ? { ...order, status: "售后中", afterSale: record } : order
      )
    );
    setApplyCandidate(null);
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
          <div className="fixed inset-0 z-[120] bg-slate-950/35" onClick={() => setDetail(null)}>
            <div
              className="absolute right-0 top-0 flex h-full w-full max-w-[680px] flex-col overflow-hidden bg-white shadow-2xl"
              style={{ animation: "drawer-slide-in 0.25s ease-out" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-[18px] font-bold leading-7 text-gray-900">{detail.id}</span>
                    <StatusTag status={detail.status} tone={statusToneMap[detail.status]} />
                  </div>
                  <div className="mt-1 text-sm font-medium leading-6 text-slate-500">{shopName(detail.shopId)} · 下单于 {detail.createdAt}</div>
                </div>
                <button className="rounded-2xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200" onClick={() => setDetail(null)}>
                  关闭
                </button>
              </div>

              <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
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
                  <table className="w-full min-w-[460px] text-left">
                    <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400">
                      <tr>
                        <th className="px-3 py-2.5 font-semibold">商品</th>
                        <th className="px-3 py-2.5 font-semibold">规格</th>
                        <th className="w-[60px] px-3 py-2.5 text-center font-semibold">数量</th>
                        <th className="w-[80px] px-3 py-2.5 text-right font-semibold">单价</th>
                        <th className="w-[90px] px-3 py-2.5 text-right font-semibold">金额</th>
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

                <div className="space-y-4">
                  {/* 支付信息 */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
                    <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                      <Info weight="bold" className="h-3.5 w-3.5" />
                      支付信息
                    </div>
                    <div className="space-y-2.5">
                      <InfoRow label="支付方式" value={detail.payMethod} />
                      <InfoRow label="支付时间" value={detail.paidAt ?? "—"} />
                    </div>
                  </div>

                  {/* 物流信息 */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
                    <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                      <Truck weight="bold" className="h-3.5 w-3.5" />
                      物流信息
                    </div>
                    {detail.logistics ? (
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-500">物流公司</span>
                          <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <CompanyLogo name={detail.logistics.company} size={20} />
                            {detail.logistics.company}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm text-slate-500">快递单号</span>
                          <span className="inline-flex items-center gap-1.5">
                            <span className="text-sm font-semibold text-slate-700">{detail.logistics.trackingNo}</span>
                            <a
                              href={`https://www.kuaidi100.com/chaxun?nu=${detail.logistics.trackingNo}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary-600 underline decoration-dotted underline-offset-2 hover:text-primary-700"
                            >
                              查物流
                            </a>
                          </span>
                        </div>
                        <InfoRow label="发货时间" value={detail.logistics.shippedAt} />
                      </div>
                    ) : (
                      <div className="py-2 text-sm text-slate-400">暂未发货</div>
                    )}
                  </div>

                  {/* 物流轨迹 */}
                  {detail.logistics && (() => {
                    const track = getLogisticsTrack(detail);
                    if (track.length === 0) return null;
                    return (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
                        <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                          <Package weight="bold" className="h-3.5 w-3.5" />
                          物流轨迹
                        </div>
                        <ol className="relative space-y-0">
                          {track.map((node, index) => {
                            const isLast = index === track.length - 1;
                            const isFirst = index === 0;
                            return (
                              <li key={index} className="relative flex gap-3 pb-5 last:pb-0">
                                {/* 连接线 */}
                                {!isLast && (
                                  <span
                                    className={clsx(
                                      "absolute left-[7px] top-4 h-[calc(100%-1rem)] w-0.5",
                                      node.done ? "bg-primary-300" : "bg-slate-200"
                                    )}
                                  />
                                )}
                                {/* 节点圆点 */}
                                <span
                                  className={clsx(
                                    "relative z-10 mt-1.5 flex h-3.5 w-3.5 flex-none items-center justify-center rounded-full ring-4 ring-white",
                                    isFirst
                                      ? "bg-primary-500"
                                      : node.done
                                        ? "bg-emerald-500"
                                        : "bg-slate-300"
                                  )}
                                />
                                <div className="min-w-0 flex-1">
                                  <div className={clsx("text-sm font-semibold", isFirst ? "text-primary-700" : "text-slate-700")}>
                                    {node.status}
                                  </div>
                                  {node.location && (
                                    <div className="mt-0.5 text-xs text-slate-400">{node.location}</div>
                                  )}
                                  <div className="mt-0.5 text-xs text-slate-400">{node.time}</div>
                                </div>
                              </li>
                            );
                          })}
                        </ol>
                      </div>
                    );
                  })()}

                  {/* 订单轨迹 */}
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

                {/* 售后信息 */}
                {detail.afterSale && (() => {
                  const as = detail.afterSale;
                  return (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-500">
                          <ArrowCounterClockwise weight="bold" className="h-3.5 w-3.5" />
                          售后信息
                        </div>
                        <StatusTag status={as.status} tone={afterSaleStatusTone[as.status]} />
                      </div>
                      <div className="space-y-3 text-sm">
                        <InfoRow label="售后类型" value={as.type} />
                        <InfoRow label="申请时间" value={as.appliedAt} />
                        <div>
                          <div className="text-xs font-medium text-slate-400">申请原因</div>
                          <div className="mt-1 rounded-xl bg-white/70 px-3 py-2 text-slate-700">{as.reason}</div>
                        </div>
                        {as.reviewedAt && (
                          <>
                            <InfoRow label="审核时间" value={as.reviewedAt} />
                            {as.reviewNote && (
                              <div>
                                <div className="text-xs font-medium text-slate-400">审核备注</div>
                                <div className="mt-1 rounded-xl bg-white/70 px-3 py-2 text-slate-700">{as.reviewNote}</div>
                              </div>
                            )}
                          </>
                        )}
                        {as.refundAmount !== undefined && (
                          <InfoRow label="退款金额" value={money(as.refundAmount)} />
                        )}
                        {as.refundedAt && <InfoRow label="退款完成时间" value={as.refundedAt} />}
                        {as.returnLogistics && (
                          <InfoRow
                            label="退货物流"
                            value={`${as.returnLogistics.company} ${as.returnLogistics.trackingNo}`}
                          />
                        )}
                        {as.receivedAt && <InfoRow label="确认收货时间" value={as.receivedAt} />}
                      </div>
                      {as.status !== "已完成" && as.status !== "已拒绝" && (
                        <button
                          className="mt-4 w-full rounded-xl bg-amber-500 py-2.5 text-sm font-semibold text-white hover:bg-amber-600"
                          onClick={() => {
                            setDetail(null);
                            openAfterSale(detail);
                          }}
                        >
                          处理售后
                        </button>
                      )}
                    </div>
                  );
                })()}

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

  // —— 售后处理弹窗 ——
  const afterSaleModal =
    afterSaleCandidate && afterSaleCandidate.afterSale && typeof document !== "undefined"
      ? createPortal(
          <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/35 px-4 py-8" onClick={() => setAfterSaleCandidate(null)}>
            <div
              className="w-full max-w-[560px] max-h-[90vh] overflow-y-auto rounded-[28px] bg-white px-7 py-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <ArrowCounterClockwise size={22} weight="bold" />
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-800">售后处理</div>
                  <div className="text-xs text-slate-500">
                    订单 {afterSaleCandidate.id} · {shopName(afterSaleCandidate.shopId)}
                  </div>
                </div>
                <div className="ml-auto">
                  <StatusTag
                    status={afterSaleCandidate.afterSale.status}
                    tone={afterSaleStatusTone[afterSaleCandidate.afterSale.status]}
                  />
                </div>
              </div>

              {/* 售后申请信息 */}
              <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm">
                <InfoRow label="售后类型" value={afterSaleCandidate.afterSale.type} />
                <InfoRow label="申请时间" value={afterSaleCandidate.afterSale.appliedAt} />
                <InfoRow label="实付金额" value={money(getOrderPayAmount(afterSaleCandidate))} />
                <div className="mt-2">
                  <div className="text-xs font-medium text-slate-400">申请原因</div>
                  <div className="mt-1 rounded-xl bg-white px-3 py-2 text-slate-700">
                    {afterSaleCandidate.afterSale.reason}
                  </div>
                </div>
              </div>

              {/* 待审核：同意 / 拒绝 */}
              {afterSaleCandidate.afterSale.status === "待审核" && (
                <div className="mt-5 space-y-4">
                  {afterSaleCandidate.afterSale.type === "仅退款" && (
                    <div>
                      <div className="text-sm font-semibold text-slate-700">退款金额</div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-lg font-bold text-slate-800">¥</span>
                        <input
                          type="number"
                          value={refundAmount}
                          onChange={(e) => setRefundAmount(e.target.value)}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-base font-semibold text-slate-700 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                        />
                      </div>
                      <div className="mt-1 text-xs text-slate-400">
                        可部分退款，最高不超过实付金额 {money(getOrderPayAmount(afterSaleCandidate))}
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-semibold text-slate-700">审核备注</div>
                    <textarea
                      value={reviewNote}
                      onChange={(e) => setReviewNote(e.target.value)}
                      rows={3}
                      placeholder="选填，告知客户审核结果说明"
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700 outline-none placeholder:text-slate-400 focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={approveAfterSale}
                      className="flex-1 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600"
                    >
                      <ShieldCheck weight="bold" className="mr-1 inline h-4 w-4" />
                      同意售后
                    </button>
                    <button
                      type="button"
                      onClick={rejectAfterSale}
                      className="flex-1 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50"
                    >
                      <XCircle weight="bold" className="mr-1 inline h-4 w-4" />
                      拒绝售后
                    </button>
                  </div>
                </div>
              )}

              {/* 已同意（退货退款）：确认收到退货 */}
              {afterSaleCandidate.afterSale.status === "已同意" && (
                <div className="mt-5 space-y-4">
                  <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-blue-700">
                    <Package weight="bold" className="mr-1 inline h-4 w-4" />
                    客户已同意退货，待客户寄回商品。确认收到退货后将进入退款流程。
                  </div>
                  <InfoRow label="退款金额" value={money(afterSaleCandidate.afterSale.refundAmount ?? getOrderPayAmount(afterSaleCandidate))} />
                  <button
                    type="button"
                    onClick={confirmReturnReceived}
                    className="w-full rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600"
                  >
                    <CheckCircle weight="bold" className="mr-1 inline h-4 w-4" />
                    确认收到退货
                  </button>
                </div>
              )}

              {/* 退款中：确认退款完成 */}
              {afterSaleCandidate.afterSale.status === "退款中" && (
                <div className="mt-5 space-y-4">
                  <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-blue-700">
                    <CurrencyCircleDollar weight="bold" className="mr-1 inline h-4 w-4" />
                    退款金额 {money(afterSaleCandidate.afterSale.refundAmount ?? getOrderPayAmount(afterSaleCandidate))}，原路退回至客户支付账户。
                  </div>
                  <button
                    type="button"
                    onClick={confirmRefund}
                    className="w-full rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600"
                  >
                    <Check weight="bold" className="mr-1 inline h-4 w-4" />
                    确认退款完成
                  </button>
                </div>
              )}

              {/* 已完成 / 已拒绝：仅展示 */}
              {(afterSaleCandidate.afterSale.status === "已完成" || afterSaleCandidate.afterSale.status === "已拒绝") && (
                <div className="mt-5">
                  {afterSaleCandidate.afterSale.reviewedAt && (
                    <InfoRow label="审核时间" value={afterSaleCandidate.afterSale.reviewedAt} />
                  )}
                  {afterSaleCandidate.afterSale.reviewNote && (
                    <div className="mt-3">
                      <div className="text-xs font-medium text-slate-400">审核备注</div>
                      <div className="mt-1 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
                        {afterSaleCandidate.afterSale.reviewNote}
                      </div>
                    </div>
                  )}
                  {afterSaleCandidate.afterSale.refundedAt && (
                    <InfoRow label="退款完成时间" value={afterSaleCandidate.afterSale.refundedAt} />
                  )}
                  <button
                    type="button"
                    onClick={() => setAfterSaleCandidate(null)}
                    className="mt-5 w-full rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200"
                  >
                    关闭
                  </button>
                </div>
              )}

              {afterSaleCandidate.afterSale.status === "待审核" && (
                <button
                  type="button"
                  onClick={() => setAfterSaleCandidate(null)}
                  className="mt-4 w-full text-center text-xs text-slate-400 hover:text-slate-600"
                >
                  关闭
                </button>
              )}
            </div>
          </div>,
          document.body
        )
      : null;

  // —— 发起售后弹窗（模拟客户申请） ——
  const applyAfterSaleModal =
    applyCandidate && typeof document !== "undefined"
      ? createPortal(
          <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/35 px-4 py-8" onClick={() => setApplyCandidate(null)}>
            <div
              className="w-full max-w-[520px] rounded-[28px] bg-white px-7 py-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <ArrowCounterClockwise size={22} weight="bold" />
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-800">发起售后申请</div>
                  <div className="text-xs text-slate-500">订单 {applyCandidate.id}（模拟客户发起）</div>
                </div>
              </div>
              <div className="mt-5 space-y-4">
                <div>
                  <div className="text-sm font-semibold text-slate-700">售后类型</div>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    {(["仅退款", "退货退款"] as AfterSaleType[]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setApplyType(t)}
                        className={clsx(
                          "rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors",
                          applyType === t
                            ? "border-amber-400 bg-amber-50 text-amber-700"
                            : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                        )}
                      >
                        {t === "仅退款" ? <CurrencyCircleDollar weight="bold" className="mr-1 inline h-4 w-4" /> : <Package weight="bold" className="mr-1 inline h-4 w-4" />}
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-700">申请原因</div>
                  <textarea
                    value={applyReason}
                    onChange={(e) => setApplyReason(e.target.value)}
                    rows={3}
                    placeholder="请描述售后原因，例如商品质量问题、发错货、七天无理由等"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700 outline-none placeholder:text-slate-400 focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setApplyCandidate(null)}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={confirmApplyAfterSale}
                    disabled={!applyReason.trim()}
                    className="flex-1 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    提交申请
                  </button>
                </div>
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
                        {order.status === "售后中" && order.afterSale && (
                          <button
                            className="rounded-md bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-600 hover:bg-amber-100 hover:text-amber-700"
                            onClick={() => openAfterSale(order)}
                          >
                            处理售后
                          </button>
                        )}
                        {order.status === "已完成" && !order.afterSale && (
                          <button
                            className="text-xs font-medium text-amber-500 hover:text-amber-600"
                            onClick={() => openApplyAfterSale(order)}
                          >
                            发起售后
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
      {afterSaleModal}
      {applyAfterSaleModal}
    </div>
  );
}
