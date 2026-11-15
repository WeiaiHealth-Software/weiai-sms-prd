export type MovementDirection = "入库" | "出库";

/** 业务原因，描述库存变动的原因，不包含线上/线下渠道。 */
export type MovementType =
  | "采购入库"
  | "退货入库"
  | "盘盈入库"
  | "销售出库"
  | "采购退货出库"
  | "报损出库";

/** 业务来源，用于区分商城与门店等业务渠道。 */
export type MovementSource = "线上商城" | "线下门店" | "供应商" | "库存调整" | "来源待确认";

export type MovementTone = "blue" | "cyan" | "green" | "teal" | "violet" | "orange" | "amber" | "rose" | "neutral";

export type MovementScenario = {
  direction: MovementDirection;
  type: MovementType;
  source: Exclude<MovementSource, "来源待确认">;
  label: string;
  tone: MovementTone;
};

const movementScenarios: MovementScenario[] = [
  { direction: "入库", type: "采购入库", source: "供应商", label: "采购入库", tone: "blue" },
  { direction: "入库", type: "退货入库", source: "线上商城", label: "线上商城 · 退货入库", tone: "cyan" },
  { direction: "入库", type: "退货入库", source: "线下门店", label: "线下门店 · 退货入库", tone: "green" },
  { direction: "入库", type: "盘盈入库", source: "库存调整", label: "盘盈入库", tone: "teal" },
  { direction: "出库", type: "销售出库", source: "线上商城", label: "线上商城 · 销售出库", tone: "violet" },
  { direction: "出库", type: "销售出库", source: "线下门店", label: "线下门店 · 销售出库", tone: "orange" },
  { direction: "出库", type: "采购退货出库", source: "供应商", label: "采购退货出库", tone: "amber" },
  { direction: "出库", type: "报损出库", source: "库存调整", label: "报损出库", tone: "rose" },
];

const sourceOptionsByType: Record<MovementType, MovementSource[]> = {
  采购入库: ["供应商"],
  退货入库: ["线上商城", "线下门店"],
  盘盈入库: ["库存调整"],
  销售出库: ["线上商城", "线下门店"],
  采购退货出库: ["供应商"],
  报损出库: ["库存调整"],
};

export function getMovementScenarioKey(type: MovementType, source: MovementSource): string {
  return `${type}::${source}`;
}

export function getMovementScenarioOptions(direction: MovementDirection): MovementScenario[] {
  return movementScenarios.filter((scenario) => scenario.direction === direction);
}

export function getMovementTypeOptions(direction: MovementDirection): MovementType[] {
  return [...new Set(getMovementScenarioOptions(direction).map((scenario) => scenario.type))];
}

export function getMovementSourceOptions(type: MovementType): MovementSource[] {
  return sourceOptionsByType[type];
}

export function getDefaultMovementSource(type: MovementType): MovementSource {
  return sourceOptionsByType[type][0];
}

export function getMovementScenario(type: MovementType, source: MovementSource) {
  return movementScenarios.find((scenario) => scenario.type === type && scenario.source === source);
}

export function getMovementLabel(type: MovementType, source: MovementSource): string {
  return getMovementScenario(type, source)?.label ?? `${type} · 来源待确认`;
}

export function getMovementTone(type: MovementType, source: MovementSource): MovementTone {
  return getMovementScenario(type, source)?.tone ?? "neutral";
}

export function inferMovementSource(type: MovementType, partner: string, remark: string): MovementSource {
  if (type === "采购入库" || type === "采购退货出库") return "供应商";
  if (type === "盘盈入库" || type === "报损出库") return "库存调整";

  const text = `${partner} ${remark}`.toLowerCase();
  if (/(线上商城|商城订单|小程序订单|电商|online)/i.test(text)) return "线上商城";
  if (/(线下门店|门店.{0,8}(销售|退货)|(?:销售|退货).{0,8}门店|pos)/i.test(text)) return "线下门店";
  return "来源待确认";
}
