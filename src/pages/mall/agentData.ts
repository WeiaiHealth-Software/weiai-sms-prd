// 商城管理 · 代理商（分销）数据层
//
// 架构约定：
// - 代理商通过专属推广关系带来商城订单，订单成交后按「代理商分成比例」计算分成金额。
// - 代理商等级决定默认分成比例，创建代理商时可按等级套用默认比例，也可单独调整。
// - 分成结算：订单成交后进入「待结算」，确认后转为「已结算」；仅「已结算」的分成计入可提现金额。
// - 提现：「已结算分成 - 已提现（成功/待处理）」为当前可提现金额；提现需先绑定收款银行卡。

import { erpProductMap, erpSkuMap, getSkuSpecText } from "../inventory/mockData";

/** 代理商状态 */
export type AgentStatus = "启用" | "停用";

/** 代理商等级（可配置，默认四个梯队） */
export type AgentLevel = string;

/**
 * 代理等级配置：定义每个梯队的升级门槛与默认分成比例。
 * 代理商同时满足「分销成单数」与「累计分销金额」两项门槛后，即可升级到该等级。
 */
export type AgentLevelConfig = {
  level: AgentLevel;
  /** 默认分成比例（%） */
  rate: number;
  /** 升级门槛：分销成单数 ≥ minOrders（0 表示无门槛） */
  minOrders: number;
  /** 升级门槛：累计分销金额 ≥ minAmount（元，0 表示无门槛） */
  minAmount: number;
  desc: string;
};

/** 默认等级梯队配置 */
export const agentLevelConfigs: AgentLevelConfig[] = [
  { level: "普通代理", rate: 5, minOrders: 0, minAmount: 0, desc: "注册即享，适合个人推广起步" },
  { level: "银牌代理", rate: 10, minOrders: 20, minAmount: 20000, desc: "具备一定粉丝或渠道资源" },
  { level: "金牌代理", rate: 15, minOrders: 50, minAmount: 50000, desc: "稳定出单的渠道合作方" },
  { level: "钻石代理", rate: 20, minOrders: 100, minAmount: 100000, desc: "核心合作伙伴，享受最高分成" },
];

/** 按等级取默认分成比例 */
export function getLevelRate(level: AgentLevel, configs: AgentLevelConfig[] = agentLevelConfigs) {
  return configs.find((config) => config.level === level)?.rate ?? 0;
}

/** 按等级取完整配置 */
export function getLevelConfig(level: AgentLevel, configs: AgentLevelConfig[] = agentLevelConfigs) {
  return configs.find((config) => config.level === level);
}

/** 等级徽章配色：按梯队顺序依次增强，等级越高视觉越突出 */
const levelBadgePalette = [
  "border-slate-200 bg-slate-100 text-slate-600",
  "border-sky-100 bg-sky-50 text-sky-600",
  "border-amber-100 bg-amber-50 text-amber-600",
  "border-violet-100 bg-violet-50 text-violet-600",
  "border-rose-100 bg-rose-50 text-rose-600",
];

/** 按梯队序号取徽章配色 */
export function getLevelBadgeClassByIndex(index: number) {
  return levelBadgePalette[index >= 0 ? Math.min(index, levelBadgePalette.length - 1) : 0];
}

export function getLevelBadgeClass(level: AgentLevel, configs: readonly { level: AgentLevel }[] = agentLevelConfigs) {
  const index = configs.findIndex((config) => config.level === level);
  return getLevelBadgeClassByIndex(index);
}

/** 升级条件文案，例如「分销成单 ≥ 100 单 且 累计金额 ≥ 10万」 */
export function getLevelConditionText(config: AgentLevelConfig) {
  if (config.minOrders <= 0 && config.minAmount <= 0) return "注册即享，无升级门槛";
  const parts: string[] = [];
  if (config.minOrders > 0) parts.push(`分销成单 ≥ ${config.minOrders} 单`);
  if (config.minAmount > 0) parts.push(`累计金额 ≥ ${formatLevelAmount(config.minAmount)}`);
  return parts.join(" 且 ");
}

/** 金额门槛文案：整万显示为「N万」，否则显示千分位金额 */
function formatLevelAmount(value: number) {
  if (value >= 10000) {
    const wan = value / 10000;
    return `${Number.isInteger(wan) ? wan : wan.toFixed(1)}万`;
  }
  return `${value}元`;
}

/** 商城 H5 站点基地址（分销推广落地页） */
export const MALL_H5_BASE_URL = "https://h5.weiai.com/mall";

/**
 * 商城 H5 分销推广链接。
 * 代理商 ID 即分销 ID，直接作为 ref 参数拼接到链接中，
 * 买家通过该链接下单时，订单归属到该代理商名下并计算分成。
 */
export function getAgentShareUrl(agentId: string): string {
  return `${MALL_H5_BASE_URL}?ref=${encodeURIComponent(agentId)}`;
}

/** 收款银行卡 */
export type BankCard = {
  bankName: string;
  cardNo: string;
  holder: string;
  /** 预留手机号 */
  phone: string;
};

/** 代理商 */
export type Agent = {
  id: string;
  name: string;
  phone: string;
  level: AgentLevel;
  /** 分成比例（%）：默认取等级配置，可单独调整 */
  commissionRate: number;
  status: AgentStatus;
  /** 收款银行卡（未绑定时不可提现） */
  bankCard?: BankCard;
  remark: string;
  createdAt: string;
};

/** 代理商分销订单（谁通过该代理商购买了什么） */
export type AgentOrder = {
  id: string;
  /** 关联商城订单号 */
  orderId: string;
  agentId: string;
  buyerName: string;
  buyerPhone: string;
  skuId: string;
  quantity: number;
  /** 订单实付金额 */
  amount: number;
  /** 分成金额 */
  commission: number;
  /** 结算状态 */
  settleStatus: "待结算" | "已结算";
  createdAt: string;
};

/** 提现状态 */
export type WithdrawStatus = "待处理" | "成功" | "失败";

/** 提现记录 */
export type WithdrawRecord = {
  id: string;
  agentId: string;
  amount: number;
  status: WithdrawStatus;
  bankCard: BankCard;
  appliedAt: string;
  handledAt?: string;
  failReason?: string;
};

/** 分销订单对应的商品名称 / 规格（取自 SKU 主数据） */
export function getAgentOrderProduct(order: AgentOrder) {
  const sku = erpSkuMap[order.skuId];
  const product = sku ? erpProductMap[sku.spuId] : undefined;
  return {
    name: product?.name ?? order.skuId,
    spec: sku ? getSkuSpecText(sku) : "",
  };
}

/** 代理商分成 / 提现概览 */
export type AgentSettleSummary = {
  /** 累计分销金额 */
  totalAmount: number;
  /** 累计分成 */
  totalCommission: number;
  /** 已结算分成 */
  settledCommission: number;
  /** 待结算分成 */
  pendingCommission: number;
  /** 已提现（成功） */
  withdrawn: number;
  /** 提现处理中（待处理） */
  withdrawing: number;
  /** 当前可提现 */
  withdrawable: number;
  /** 分销订单数 */
  orderCount: number;
};

/** 金额保留两位小数，避免浮点累加误差（如 2100.3199999…）导致「全部提现」金额校验失败 */
function round2(value: number) {
  return Math.round(value * 100) / 100;
}

/** 汇总某代理商的分成与提现数据 */
export function getAgentSettleSummary(
  agentId: string,
  orders: AgentOrder[],
  withdraws: WithdrawRecord[]
): AgentSettleSummary {
  const mine = orders.filter((order) => order.agentId === agentId);
  const totalAmount = mine.reduce((sum, order) => sum + order.amount, 0);
  const totalCommission = mine.reduce((sum, order) => sum + order.commission, 0);
  const settledCommission = mine
    .filter((order) => order.settleStatus === "已结算")
    .reduce((sum, order) => sum + order.commission, 0);
  const pendingCommission = totalCommission - settledCommission;

  const myWithdraws = withdraws.filter((record) => record.agentId === agentId);
  const withdrawn = myWithdraws
    .filter((record) => record.status === "成功")
    .reduce((sum, record) => sum + record.amount, 0);
  const withdrawing = myWithdraws
    .filter((record) => record.status === "待处理")
    .reduce((sum, record) => sum + record.amount, 0);

  return {
    totalAmount: round2(totalAmount),
    totalCommission: round2(totalCommission),
    settledCommission: round2(settledCommission),
    pendingCommission: round2(pendingCommission),
    withdrawn: round2(withdrawn),
    withdrawing: round2(withdrawing),
    withdrawable: Math.max(0, round2(settledCommission - withdrawn - withdrawing)),
    orderCount: mine.length,
  };
}

/** 模拟代理商数据 */
export const initialAgents: Agent[] = [
  {
    id: "AGT-001",
    name: "张丽（眼科咨询师）",
    phone: "13812340001",
    level: "钻石代理",
    commissionRate: 20,
    status: "启用",
    bankCard: { bankName: "招商银行", cardNo: "6225 8800 1234 5678", holder: "张丽", phone: "13812340001" },
    remark: "核心合作渠道，主要引流角膜塑形镜客户。",
    createdAt: "2026-03-12",
  },
  {
    id: "AGT-002",
    name: "李明（校园渠道）",
    phone: "13812340002",
    level: "金牌代理",
    commissionRate: 15,
    status: "启用",
    bankCard: { bankName: "中国工商银行", cardNo: "6222 0212 3456 7890", holder: "李明", phone: "13812340002" },
    remark: "负责本地中小学渠道推广。",
    createdAt: "2026-04-20",
  },
  {
    id: "AGT-003",
    name: "王芳（宝妈社群）",
    phone: "13812340003",
    level: "银牌代理",
    commissionRate: 10,
    status: "启用",
    remark: "社群推广为主，尚未绑定收款银行卡。",
    createdAt: "2026-06-08",
  },
  {
    id: "AGT-004",
    name: "陈静（线上达人）",
    phone: "13812340004",
    level: "普通代理",
    commissionRate: 5,
    status: "停用",
    remark: "合作暂停，历史订单不结算。",
    createdAt: "2026-07-15",
  },
];

/** 模拟分销订单数据 */
export const initialAgentOrders: AgentOrder[] = [
  { id: "AGO-20261108-001", orderId: "SO-20261108-003", agentId: "AGT-001", buyerName: "赵女士", buyerPhone: "137****8899", skuId: "SKU-1001-02", quantity: 3, amount: 11952, commission: 2390.4, settleStatus: "已结算", createdAt: "2026-11-08 09:25" },
  { id: "AGO-20261107-002", orderId: "SO-20261107-010", agentId: "AGT-001", buyerName: "孙先生", buyerPhone: "132****7890", skuId: "SKU-1003-01", quantity: 1, amount: 2692, commission: 538.4, settleStatus: "已结算", createdAt: "2026-11-07 10:55" },
  { id: "AGO-20261110-003", orderId: "SO-20261110-016", agentId: "AGT-001", buyerName: "周女士", buyerPhone: "139****1122", skuId: "SKU-1008-01", quantity: 4, amount: 512, commission: 102.4, settleStatus: "待结算", createdAt: "2026-11-10 14:30" },
  { id: "AGO-20261113-004", orderId: "SO-20261113-018", agentId: "AGT-002", buyerName: "刘先生", buyerPhone: "135****1234", skuId: "SKU-1003-01", quantity: 2, amount: 5384, commission: 807.6, settleStatus: "已结算", createdAt: "2026-11-13 20:05" },
  { id: "AGO-20261114-005", orderId: "SO-20261114-022", agentId: "AGT-002", buyerName: "郑女士", buyerPhone: "130****2345", skuId: "SKU-1006-01", quantity: 8, amount: 579, commission: 86.85, settleStatus: "待结算", createdAt: "2026-11-14 10:15" },
  { id: "AGO-20261101-006", orderId: "SO-20261101-005", agentId: "AGT-002", buyerName: "林先生", buyerPhone: "134****6789", skuId: "SKU-1007-01", quantity: 3, amount: 264, commission: 39.6, settleStatus: "已结算", createdAt: "2026-11-01 16:08" },
  { id: "AGO-20261112-007", orderId: "SO-20261112-021", agentId: "AGT-003", buyerName: "吴女士", buyerPhone: "131****3456", skuId: "SKU-1006-02", quantity: 10, amount: 390, commission: 39, settleStatus: "已结算", createdAt: "2026-11-12 11:20" },
  { id: "AGO-20261113-008", orderId: "SO-20261113-025", agentId: "AGT-003", buyerName: "何女士", buyerPhone: "136****7788", skuId: "SKU-1009-01", quantity: 5, amount: 130, commission: 13, settleStatus: "待结算", createdAt: "2026-11-13 09:40" },
  { id: "AGO-20261030-009", orderId: "SO-20261030-002", agentId: "AGT-004", buyerName: "周先生", buyerPhone: "133****9012", skuId: "SKU-1010-01", quantity: 1, amount: 5980, commission: 299, settleStatus: "已结算", createdAt: "2026-10-30 19:30" },
];

/** 模拟提现记录数据 */
export const initialWithdraws: WithdrawRecord[] = [
  { id: "WD-20261105-001", agentId: "AGT-001", amount: 2000, status: "成功", bankCard: { bankName: "招商银行", cardNo: "6225 8800 1234 5678", holder: "张丽", phone: "13812340001" }, appliedAt: "2026-11-05 10:00", handledAt: "2026-11-06 15:30" },
  { id: "WD-20261110-002", agentId: "AGT-002", amount: 800, status: "成功", bankCard: { bankName: "中国工商银行", cardNo: "6222 0212 3456 7890", holder: "李明", phone: "13812340002" }, appliedAt: "2026-11-10 09:20", handledAt: "2026-11-11 14:00" },
  { id: "WD-20261113-003", agentId: "AGT-002", amount: 200, status: "失败", bankCard: { bankName: "中国工商银行", cardNo: "6222 0212 3456 7890", holder: "李明", phone: "13812340002" }, appliedAt: "2026-11-13 16:40", handledAt: "2026-11-14 09:10", failReason: "银行卡信息与持卡人不一致，请核对后重试" },
  { id: "WD-20261114-004", agentId: "AGT-003", amount: 30, status: "待处理", bankCard: { bankName: "中国建设银行", cardNo: "6217 0000 1111 2222", holder: "王芳", phone: "13812340003" }, appliedAt: "2026-11-14 21:15" },
];
