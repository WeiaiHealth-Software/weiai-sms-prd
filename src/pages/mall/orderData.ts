// 商城管理 · 订单数据层
//
// 架构约定：
// - 订单商品明细为下单时的快照（商品名 / 规格 / 单价 / 图片），不随 ERP 商品档案变更而变动。
// - 订单状态流转：待付款 → 待发货 → 已发货 → 已完成；任意环节可取消（已取消）或发起售后（售后中）。
// - 发货时录入物流公司与快递单号，同时生成「销售出库」记录（与库存管理 · 出库管理联动）。
// - 库存口径：订单发货扣减店铺绑定仓库的 SKU 库存，与出库管理的「销售出库」保持一致。

import { erpProductMap, erpSkuMap, getSkuSpecText, initialWarehouses } from "../inventory/mockData";
import { initialShops, initialMallListings } from "./mockData";

/** 订单状态 */
export type OrderStatus = "待付款" | "待发货" | "已发货" | "已完成" | "已取消" | "售后中";

/** 支付方式 */
export type PayMethod = "微信支付" | "支付宝" | "余额支付";

/** 订单商品明细行（下单快照） */
export type OrderItem = {
  skuId: string;
  /** 商品名称（SPU 名称快照） */
  productName: string;
  /** 规格文本快照 */
  specText: string;
  /** SKU 图片快照 */
  image: string;
  /** 购买数量 */
  quantity: number;
  /** 成交单价（商城售价快照） */
  unitPrice: number;
};

/** 物流信息 */
export type OrderLogistics = {
  company: string;
  trackingNo: string;
  shippedAt: string;
};

/** 商城订单 */
export type MallOrder = {
  id: string;
  shopId: string;
  status: OrderStatus;
  /** 下单客户 */
  customerName: string;
  customerPhone: string;
  /** 收货信息 */
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  items: OrderItem[];
  /** 运费 */
  shippingFee: number;
  payMethod: PayMethod;
  paidAt?: string;
  logistics?: OrderLogistics;
  completedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  /** 商家备注 */
  remark: string;
  createdAt: string;
};

/** 订单商品总金额（不含运费） */
export function getOrderTotalAmount(order: MallOrder) {
  return order.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}

/** 订单实付金额 = 商品总额 + 运费 */
export function getOrderPayAmount(order: MallOrder) {
  return getOrderTotalAmount(order) + order.shippingFee;
}

/** 订单商品总件数 */
export function getOrderTotalQty(order: MallOrder) {
  return order.items.reduce((sum, item) => sum + item.quantity, 0);
}

/** 店铺名称 */
export function getShopName(shopId: string) {
  return initialShops.find((shop) => shop.id === shopId)?.name ?? shopId;
}

/** 店铺绑定的发货仓库（取第一个，用于发货出库） */
export function getShopWarehouse(shopId: string) {
  const shop = initialShops.find((item) => item.id === shopId);
  return shop?.warehouseIds[0];
}

/** 仓库名称 */
export function getWarehouseName(warehouseId: string) {
  return initialWarehouses.find((w) => w.id === warehouseId)?.name ?? warehouseId;
}

function snapshotItem(skuId: string, quantity: number): OrderItem | undefined {
  const sku = erpSkuMap[skuId];
  if (!sku) return undefined;
  const product = erpProductMap[sku.spuId];
  const listing = initialMallListings.find((l) => l.skuId === skuId);
  return {
    skuId,
    productName: product?.name ?? sku.spuId,
    specText: getSkuSpecText(sku),
    image: sku.image,
    quantity,
    unitPrice: listing?.mallPrice ?? sku.retailPrice,
  };
}

function buildItems(list: Array<[string, number]>): OrderItem[] {
  return list.map(([skuId, quantity]) => snapshotItem(skuId, quantity)).filter((item): item is OrderItem => Boolean(item));
}

/** 模拟订单数据：覆盖各店铺、各状态 */
export const initialOrders: MallOrder[] = [
  {
    id: "SO-20261103-007",
    shopId: "SHOP-001",
    status: "已完成",
    customerName: "陈女士",
    customerPhone: "138****6621",
    receiverName: "陈女士",
    receiverPhone: "138****6621",
    receiverAddress: "上海市浦东新区世纪大道 100 号环球金融中心 38 层",
    items: buildItems([
      ["SKU-1001-01", 2],
      ["SKU-1008-01", 2],
    ]),
    shippingFee: 0,
    payMethod: "微信支付",
    paidAt: "2026-11-03 10:22",
    logistics: { company: "顺丰速运", trackingNo: "SF1234567890", shippedAt: "2026-11-03 14:30" },
    completedAt: "2026-11-05 09:15",
    remark: "客户要求工作日送达",
    createdAt: "2026-11-03 10:18",
  },
  {
    id: "SO-20261109-012",
    shopId: "SHOP-001",
    status: "已发货",
    customerName: "王先生",
    customerPhone: "139****3344",
    receiverName: "王先生",
    receiverPhone: "139****3344",
    receiverAddress: "上海市徐汇区漕溪北路 333 号实业大厦 12 楼",
    items: buildItems([["SKU-1006-02", 10]]),
    shippingFee: 0,
    payMethod: "支付宝",
    paidAt: "2026-11-09 16:05",
    logistics: { company: "京东物流", trackingNo: "JD9876543210", shippedAt: "2026-11-09 18:20" },
    remark: "",
    createdAt: "2026-11-09 16:00",
  },
  {
    id: "SO-20261108-003",
    shopId: "SHOP-002",
    status: "已完成",
    customerName: "赵女士",
    customerPhone: "137****8899",
    receiverName: "赵女士",
    receiverPhone: "137****8899",
    receiverAddress: "北京市朝阳区建国路 88 号 SOHO 现代城 A 座 2201",
    items: buildItems([["SKU-1001-02", 3]]),
    shippingFee: 12,
    payMethod: "微信支付",
    paidAt: "2026-11-08 09:30",
    logistics: { company: "顺丰速运", trackingNo: "SF8888999900", shippedAt: "2026-11-08 11:00" },
    completedAt: "2026-11-10 14:20",
    remark: "",
    createdAt: "2026-11-08 09:25",
  },
  {
    id: "SO-20261113-018",
    shopId: "SHOP-001",
    status: "待发货",
    customerName: "刘先生",
    customerPhone: "135****1234",
    receiverName: "刘先生",
    receiverPhone: "135****1234",
    receiverAddress: "上海市静安区南京西路 1266 号恒隆广场 2 座 18 楼",
    items: buildItems([
      ["SKU-1003-01", 1],
      ["SKU-1005-01", 1],
    ]),
    shippingFee: 0,
    payMethod: "微信支付",
    paidAt: "2026-11-13 20:10",
    remark: "请尽快发货，客户急用",
    createdAt: "2026-11-13 20:05",
  },
  {
    id: "SO-20261113-019",
    shopId: "SHOP-003",
    status: "待发货",
    customerName: "黄女士",
    customerPhone: "136****5678",
    receiverName: "黄女士",
    receiverPhone: "136****5678",
    receiverAddress: "广州市天河区珠江新城华夏路 30 号富力盈通大厦 1503",
    items: buildItems([
      ["SKU-1002-01", 1],
      ["SKU-1005-01", 2],
    ]),
    shippingFee: 10,
    payMethod: "支付宝",
    paidAt: "2026-11-13 21:35",
    remark: "",
    createdAt: "2026-11-13 21:30",
  },
  {
    id: "SO-20261114-021",
    shopId: "SHOP-001",
    status: "待付款",
    customerName: "周先生",
    customerPhone: "133****9012",
    receiverName: "周先生",
    receiverPhone: "133****9012",
    receiverAddress: "上海市虹口区四川北路 1358 号嘉杰国际广场 8 楼",
    items: buildItems([["SKU-1010-01", 1]]),
    shippingFee: 0,
    payMethod: "微信支付",
    remark: "",
    createdAt: "2026-11-14 08:45",
  },
  {
    id: "SO-20261112-015",
    shopId: "SHOP-001",
    status: "已取消",
    customerName: "吴女士",
    customerPhone: "131****3456",
    receiverName: "吴女士",
    receiverPhone: "131****3456",
    receiverAddress: "上海市长宁区天山路 789 号长宁来福士广场 T2 16 楼",
    items: buildItems([["SKU-1006-01", 3]]),
    shippingFee: 0,
    payMethod: "微信支付",
    cancelledAt: "2026-11-12 15:00",
    cancelReason: "客户主动取消，重复下单",
    remark: "",
    createdAt: "2026-11-12 14:30",
  },
  {
    id: "SO-20261107-010",
    shopId: "SHOP-002",
    status: "售后中",
    customerName: "孙先生",
    customerPhone: "132****7890",
    receiverName: "孙先生",
    receiverPhone: "132****7890",
    receiverAddress: "北京市海淀区中关村大街 1 号海龙大厦 12 层",
    items: buildItems([["SKU-1003-01", 1]]),
    shippingFee: 12,
    payMethod: "微信支付",
    paidAt: "2026-11-07 11:00",
    logistics: { company: "顺丰速运", trackingNo: "SF5555666677", shippedAt: "2026-11-07 15:00" },
    completedAt: "2026-11-09 10:00",
    remark: "客户反馈设备有异响，申请换货处理中",
    createdAt: "2026-11-07 10:55",
  },
  {
    id: "SO-20261114-022",
    shopId: "SHOP-001",
    status: "待发货",
    customerName: "郑女士",
    customerPhone: "130****2345",
    receiverName: "郑女士",
    receiverPhone: "130****2345",
    receiverAddress: "上海市杨浦区五角场邯郸路 600 号复旦科技园 10 号楼",
    items: buildItems([
      ["SKU-1006-01", 5],
      ["SKU-1008-01", 3],
    ]),
    shippingFee: 0,
    payMethod: "余额支付",
    paidAt: "2026-11-14 10:20",
    remark: "老客户复购，附赠小样",
    createdAt: "2026-11-14 10:15",
  },
  {
    id: "SO-20261111-014",
    shopId: "SHOP-003",
    status: "已发货",
    customerName: "林先生",
    customerPhone: "134****6789",
    receiverName: "林先生",
    receiverPhone: "134****6789",
    receiverAddress: "深圳市南山区科技园南区高新南一道 9 号创维大厦 A 座 8 楼",
    items: buildItems([["SKU-1007-01", 4]]),
    shippingFee: 8,
    payMethod: "支付宝",
    paidAt: "2026-11-11 09:00",
    logistics: { company: "中通快递", trackingNo: "ZT1122334455", shippedAt: "2026-11-11 11:30" },
    remark: "",
    createdAt: "2026-11-11 08:55",
  },
];
