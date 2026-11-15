// 库存管理 · 商品类目本地存储
//
// 类目（分类）从「写死在代码里的常量」升级为可维护的数据：
// - 每个类目承载「规格属性模板」，商品档案按所选类目展示可勾选的规格属性。
// - 与商品档案（productStore）一致，改动写入 localStorage，未改动时回落到 mockData 的种子数据。
// - 类目名称会被商品档案引用：改名时同步迁移已建档商品的分类字段；被引用的类目不可删除。

import { categorySpecTemplates, erpProducts, erpSkus, productCategoryOptions } from "./mockData";
import { getMergedProducts, getMergedSkus, saveProductOverride } from "./productStore";

/** 类目：名称 + 该类目下可用的规格属性模板 */
export type CategoryRecord = {
  name: string;
  /** 规格属性名（按配置顺序展示） */
  specAttributes: string[];
  createdAt: string;
};

const STORAGE_KEY = "weiai.erp.categories";

function today() {
  return new Date().toISOString().slice(0, 10);
}

/** 初始种子：来自 mockData 中的内置分类与规格模板 */
function seedCategories(): CategoryRecord[] {
  return productCategoryOptions.map((name) => ({
    name,
    specAttributes: [...(categorySpecTemplates[name] ?? [])],
    createdAt: "2026-01-05",
  }));
}

function isCategoryRecord(value: unknown): value is CategoryRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as CategoryRecord).name === "string" &&
    Array.isArray((value as CategoryRecord).specAttributes)
  );
}

function readStore(): CategoryRecord[] | null {
  if (typeof window === "undefined") return null;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null") as unknown;
    if (!Array.isArray(parsed)) return null;
    const list = parsed.filter(isCategoryRecord).map((item) => ({
      name: item.name,
      specAttributes: (item.specAttributes as unknown[]).filter((attr): attr is string => typeof attr === "string"),
      createdAt: typeof item.createdAt === "string" ? item.createdAt : today(),
    }));
    return list.length > 0 ? list : null;
  } catch {
    return null;
  }
}

/** 清洗规格属性：去空白、去重、剔除空值 */
function normalizeAttributes(attributes: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of attributes) {
    const attr = raw.trim();
    if (!attr || seen.has(attr)) continue;
    seen.add(attr);
    result.push(attr);
  }
  return result;
}

/** 全量类目（localStorage 优先，回落到种子数据） */
export function getCategories(): CategoryRecord[] {
  return readStore() ?? seedCategories();
}

/** 类目名称列表，供分类下拉 / 筛选使用 */
export function getCategoryNames(): string[] {
  return getCategories().map((item) => item.name);
}

/** 某类目的规格属性模板 */
export function getSpecTemplate(name: string): string[] {
  return getCategories().find((item) => item.name === name)?.specAttributes ?? [];
}

/** 各类目下的商品（SPU）数量 */
export function getCategoryProductCount(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const product of getMergedProducts(erpProducts)) {
    counts[product.category] = (counts[product.category] ?? 0) + 1;
  }
  return counts;
}

function saveCategories(list: CategoryRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

/** 改名时把已建档商品的分类字段迁移到新名称，避免商品引用失效 */
function migrateCategoryName(oldName: string, newName: string) {
  const affected = getMergedProducts(erpProducts).filter((product) => product.category === oldName);
  if (affected.length === 0) return;
  const skus = getMergedSkus(erpSkus);
  for (const product of affected) {
    saveProductOverride({ ...product, category: newName }, skus.filter((sku) => sku.spuId === product.spuId));
  }
}

export function addCategory(name: string, specAttributes: string[]): { ok: boolean; error?: string } {
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: "请输入类目名称" };
  const list = getCategories();
  if (list.some((item) => item.name === trimmed)) return { ok: false, error: "已存在同名类目" };
  const attributes = normalizeAttributes(specAttributes);
  if (attributes.length === 0) return { ok: false, error: "请至少配置一个规格属性" };
  saveCategories([...list, { name: trimmed, specAttributes: attributes, createdAt: today() }]);
  return { ok: true };
}

export function updateCategory(oldName: string, next: { name: string; specAttributes: string[] }): { ok: boolean; error?: string } {
  const trimmed = next.name.trim();
  if (!trimmed) return { ok: false, error: "请输入类目名称" };
  const list = getCategories();
  if (!list.some((item) => item.name === oldName)) return { ok: false, error: "类目不存在" };
  if (trimmed !== oldName && list.some((item) => item.name === trimmed)) return { ok: false, error: "已存在同名类目" };
  const attributes = normalizeAttributes(next.specAttributes);
  if (attributes.length === 0) return { ok: false, error: "请至少配置一个规格属性" };
  if (trimmed !== oldName) migrateCategoryName(oldName, trimmed);
  saveCategories(list.map((item) => (item.name === oldName ? { ...item, name: trimmed, specAttributes: attributes } : item)));
  return { ok: true };
}

export function removeCategory(name: string): { ok: boolean; error?: string } {
  const list = getCategories();
  if (!list.some((item) => item.name === name)) return { ok: false, error: "类目不存在" };
  const count = getCategoryProductCount()[name] ?? 0;
  if (count > 0) return { ok: false, error: `该类目下仍有 ${count} 个商品，无法删除` };
  saveCategories(list.filter((item) => item.name !== name));
  return { ok: true };
}
