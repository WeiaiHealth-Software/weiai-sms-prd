/** 商品有效期预警（商品管理 / 商城商品列表共用） */

export type ValidityWarnLevel = "expired" | "soon" | "normal";

export type ValidityWarn = {
  /** 距今天数，已过期为负数 */
  days: number;
  level: ValidityWarnLevel;
  label: string;
};

/** 有效期预警：返回距今天数与预警级别（临期阈值 90 天） */
export function getValidityWarn(validityTo: string, today = new Date()): ValidityWarn {
  const target = new Date(`${validityTo}T00:00:00`);
  const base = new Date(today.toISOString().slice(0, 10) + "T00:00:00");
  const days = Math.round((target.getTime() - base.getTime()) / 86400000);
  if (days < 0) return { days, level: "expired", label: "已过期" };
  if (days <= 90) return { days, level: "soon", label: "临期" };
  return { days, level: "normal", label: "" };
}
