import { useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { Plus, Info, PencilSimple, Trash, Tag, X, WarningCircle } from "@phosphor-icons/react";
import {
  addCategory,
  getCategories,
  getCategoryProductCount,
  removeCategory,
  updateCategory,
  type CategoryRecord,
} from "./categoryStore";

const primaryBtn =
  "inline-flex items-center gap-2 rounded-2xl bg-primary-500 px-4 py-3 text-sm font-semibold text-white hover:bg-primary-600 active:bg-primary-700 disabled:cursor-not-allowed disabled:bg-primary-300";
const ghostBtn =
  "inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50";

type ModalState = { mode: "create" | "edit"; name: string } | null;

const inputCls =
  "h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none placeholder:font-medium placeholder:text-slate-400 focus:border-primary-300 focus:ring-2 focus:ring-primary-100";

export default function CategoryList() {
  const [categories, setCategories] = useState<CategoryRecord[]>(() => getCategories());
  const [modal, setModal] = useState<ModalState>(null);
  const [formName, setFormName] = useState("");
  const [formAttrs, setFormAttrs] = useState<string[]>([]);
  const [attrDraft, setAttrDraft] = useState("");
  const [formError, setFormError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<CategoryRecord | null>(null);
  const [deleteError, setDeleteError] = useState("");

  // 各类目下的商品数，随类目/商品变更实时计算
  const counts = getCategoryProductCount();

  const refresh = () => setCategories(getCategories());

  function openCreate() {
    setFormName("");
    setFormAttrs([]);
    setAttrDraft("");
    setFormError("");
    setModal({ mode: "create", name: "" });
  }

  function openEdit(category: CategoryRecord) {
    setFormName(category.name);
    setFormAttrs([...category.specAttributes]);
    setAttrDraft("");
    setFormError("");
    setModal({ mode: "edit", name: category.name });
  }

  function closeModal() {
    setModal(null);
  }

  function commitAttrDraft() {
    const value = attrDraft.trim();
    if (!value) return;
    setFormAttrs((prev) => (prev.includes(value) ? prev : [...prev, value]));
    setAttrDraft("");
  }

  function submitModal() {
    if (!modal) return;
    const result =
      modal.mode === "create" ? addCategory(formName, formAttrs) : updateCategory(modal.name, { name: formName, specAttributes: formAttrs });
    if (!result.ok) {
      setFormError(result.error ?? "保存失败");
      return;
    }
    refresh();
    closeModal();
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    const result = removeCategory(deleteTarget.name);
    if (!result.ok) {
      setDeleteError(result.error ?? "删除失败");
      return;
    }
    refresh();
    setDeleteTarget(null);
    setDeleteError("");
  }

  const modalEl =
    modal && typeof document !== "undefined"
      ? createPortal(
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/35 px-4 py-8" onClick={closeModal}>
            <div
              className="flex max-h-[88vh] w-full max-w-[560px] flex-col overflow-hidden rounded-[32px] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-8 py-6">
                <div>
                  <div className="text-[20px] font-bold leading-8 text-gray-900">{modal.mode === "create" ? "新增类目" : "编辑类目"}</div>
                  <div className="mt-1 text-sm font-medium leading-6 text-slate-500">
                    类目决定商品档案里的规格属性模板，配置后商品即可勾选这些属性定义 SKU。
                  </div>
                </div>
                <button className="rounded-2xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200" onClick={closeModal}>
                  关闭
                </button>
              </div>

              <div className="flex-1 space-y-6 overflow-y-auto px-8 py-6">
                <div>
                  <div className="text-sm font-semibold text-slate-500">类目名称</div>
                  <input
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="例如：护理耗材类"
                    className={clsx(inputCls, "mt-3")}
                  />
                  {modal.mode === "edit" && formName.trim() !== modal.name ? (
                    <div className="mt-2 flex items-center gap-2 text-xs text-amber-600">
                      <WarningCircle weight="bold" className="h-4 w-4 flex-none" />
                      改名后，原类目下的商品分类会自动同步为新名称。
                    </div>
                  ) : null}
                </div>

                <div>
                  <div className="text-sm font-semibold text-slate-500">规格属性</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {formAttrs.map((attr) => (
                      <span
                        key={attr}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-primary-200 bg-primary-50 px-3 py-1.5 text-sm font-semibold text-primary-700"
                      >
                        {attr}
                        <button
                          type="button"
                          aria-label={`移除 ${attr}`}
                          onClick={() => setFormAttrs((prev) => prev.filter((item) => item !== attr))}
                          className="rounded-md p-0.5 text-primary-400 hover:bg-primary-100 hover:text-primary-600"
                        >
                          <X weight="bold" className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))}
                    {formAttrs.length === 0 ? <span className="text-sm text-slate-400">尚未配置规格属性</span> : null}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      value={attrDraft}
                      onChange={(e) => setAttrDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          commitAttrDraft();
                        }
                      }}
                      placeholder="输入属性名后回车添加，例如：度数 / 型号"
                      className={inputCls}
                    />
                    <button
                      type="button"
                      onClick={commitAttrDraft}
                      disabled={!attrDraft.trim()}
                      className="inline-flex h-12 flex-none items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                    >
                      <Plus weight="bold" className="h-4 w-4" />
                      添加
                    </button>
                  </div>
                </div>

                {formError ? (
                  <div className="flex items-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-600">
                    <WarningCircle weight="bold" className="h-4 w-4 flex-none" />
                    {formError}
                  </div>
                ) : null}
              </div>

              <div className="flex justify-end gap-4 border-t border-gray-100 px-8 py-5">
                <button className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-base font-semibold text-slate-600 hover:bg-slate-50" onClick={closeModal}>
                  取消
                </button>
                <button className="rounded-2xl bg-primary-500 px-5 py-2.5 text-base font-semibold text-white hover:bg-primary-600" onClick={submitModal}>
                  保存
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  const deleteEl =
    deleteTarget && typeof document !== "undefined"
      ? createPortal(
          <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/35 px-4 py-8" onClick={() => setDeleteTarget(null)}>
            <div
              className="w-full max-w-md rounded-[28px] border border-slate-100 bg-white px-6 py-7 shadow-[0_24px_80px_rgba(15,23,42,0.18)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <Trash size={24} weight="bold" />
              </div>
              <div className="mt-5 text-center text-xl font-bold text-slate-800">删除类目</div>
              <div className="mt-2 text-center text-sm leading-6 text-slate-500">
                确认删除类目 <span className="font-semibold text-slate-700">“{deleteTarget.name}”</span> 吗？仅当该类目下没有商品时可删除。
              </div>
              {deleteError ? (
                <div className="mt-4 flex items-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-600">
                  <WarningCircle weight="bold" className="h-4 w-4 flex-none" />
                  {deleteError}
                </div>
              ) : null}
              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="flex-1 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-600"
                >
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
            <div>
              <div className="text-lg font-bold leading-7 text-gray-900">类目管理</div>
              <div className="mt-0.5 text-xs text-slate-500">维护商品类目与各类目的规格属性模板，后续新增品类无需改动代码。</div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button className={primaryBtn} onClick={openCreate}>
                <Plus weight="bold" className="h-4 w-4" />
                新增类目
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 border-t border-gray-100 bg-slate-50/60 px-4 py-2.5 text-xs text-slate-500">
            <Info weight="bold" className="h-4 w-4 flex-none text-primary-500" />
            类目与规格属性模板供「库存管理 · 商品管理」在新增 / 编辑商品时调用；改名会自动同步已建档商品的分类，被商品引用的类目不可删除。
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] table-fixed text-center">
            <colgroup>
              <col className="w-[22%]" />
              <col className="w-[38%]" />
              <col className="w-[12%]" />
              <col className="w-[14%]" />
              <col className="w-[14%]" />
            </colgroup>
            <thead className="bg-gray-50 text-xs uppercase tracking-[0.18em] text-gray-400">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">类目名称</th>
                <th className="px-4 py-3 text-left font-semibold">规格属性模板</th>
                <th className="px-4 py-3 text-center font-semibold">商品数</th>
                <th className="px-4 py-3 text-center font-semibold">创建时间</th>
                <th className="px-4 py-3 text-center font-semibold">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {categories.map((category) => {
                const count = counts[category.name] ?? 0;
                return (
                  <tr key={category.name} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-left">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 flex-none items-center justify-center rounded-xl bg-primary-50 text-primary-500">
                          <Tag weight="fill" className="h-4 w-4" />
                        </span>
                        <span className="font-semibold text-gray-800">{category.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-left">
                      <div className="flex flex-wrap gap-1.5">
                        {category.specAttributes.map((attr) => (
                          <span key={attr} className="inline-flex rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                            {attr}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={clsx("font-semibold", count > 0 ? "text-gray-900" : "text-slate-400")}>{count}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-500">{category.createdAt}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
                          onClick={() => openEdit(category)}
                        >
                          <PencilSimple weight="bold" className="h-4 w-4" />
                          编辑
                        </button>
                        <button
                          className={clsx(
                            "inline-flex items-center gap-1 text-sm font-medium",
                            count > 0 ? "cursor-not-allowed text-slate-300" : "text-rose-500 hover:text-rose-600"
                          )}
                          disabled={count > 0}
                          title={count > 0 ? "该类目下仍有商品，无法删除" : "删除类目"}
                          onClick={() => {
                            setDeleteError("");
                            setDeleteTarget(category);
                          }}
                        >
                          <Trash weight="bold" className="h-4 w-4" />
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center text-sm text-gray-400">
                    暂无类目，请点击「新增类目」创建
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-sm text-gray-500">
          <div>共 {categories.length} 个类目</div>
          <span className={clsx(ghostBtn, "cursor-default")}>类目数据保存在本地，刷新后仍保留</span>
        </div>
      </div>
      {modalEl}
      {deleteEl}
    </div>
  );
}
