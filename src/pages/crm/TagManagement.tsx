import { Plus } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { createPortal } from "react-dom";

type TagCategory = "会员类型" | "复查状态" | "客户来源" | "其他";
type TagFilter = "全部类型" | TagCategory;

type TagManagementRow = {
  id: string;
  category: TagCategory;
  value: string;
  colorLabel: string;
  className: string;
  createdAt: string;
  updatedAt: string;
};

type TagDraft = {
  category: TagCategory;
  colorLabel: string;
  value: string;
};

const tagCategoryOptions: readonly TagFilter[] = ["全部类型", "会员类型", "复查状态", "客户来源", "其他"] as const;

const tagColorPresets = [
  { label: "蓝色", dotClass: "bg-primary-500", className: "border-primary-100 bg-primary-50 text-primary-600" },
  { label: "黄色", dotClass: "bg-yellow-400", className: "border-yellow-100 bg-yellow-50 text-yellow-700" },
  { label: "橙色", dotClass: "bg-orange-400", className: "border-orange-100 bg-orange-50 text-orange-700" },
  { label: "绿色", dotClass: "bg-emerald-500", className: "border-emerald-100 bg-emerald-50 text-emerald-700" },
  { label: "紫色", dotClass: "bg-violet-500", className: "border-violet-100 bg-violet-50 text-violet-700" },
  { label: "红色", dotClass: "bg-rose-500", className: "border-rose-100 bg-rose-50 text-rose-700" },
  { label: "灰色", dotClass: "bg-slate-400", className: "border-slate-200 bg-slate-100 text-slate-600" },
] as const;

const initialTagDraft: TagDraft = {
  category: "会员类型",
  colorLabel: "灰色",
  value: "",
};

const initialTagManagementRows: TagManagementRow[] = [
  { id: "tm1", category: "会员类型", value: "普通用户", colorLabel: "灰色", className: "border-slate-200 bg-slate-100 text-slate-600", createdAt: "2026-04-01", updatedAt: "2026-05-05" },
  { id: "tm2", category: "会员类型", value: "VIP", colorLabel: "紫色", className: "border-violet-100 bg-violet-50 text-violet-700", createdAt: "2026-04-02", updatedAt: "2026-05-06" },
  { id: "tm3", category: "会员类型", value: "SVIP", colorLabel: "紫色", className: "border-fuchsia-100 bg-fuchsia-50 text-fuchsia-700", createdAt: "2026-04-03", updatedAt: "2026-05-07" },
  { id: "tm4", category: "复查状态", value: "跟进中", colorLabel: "绿色", className: "border-emerald-100 bg-emerald-50 text-emerald-700", createdAt: "2026-04-06", updatedAt: "2026-05-10" },
  { id: "tm5", category: "复查状态", value: "待复查", colorLabel: "橙色", className: "border-orange-100 bg-orange-50 text-orange-700", createdAt: "2026-04-07", updatedAt: "2026-05-11" },
  { id: "tm6", category: "复查状态", value: "已就诊", colorLabel: "蓝色", className: "border-primary-100 bg-primary-50 text-primary-600", createdAt: "2026-04-08", updatedAt: "2026-05-12" },
  { id: "tm7", category: "复查状态", value: "已终止", colorLabel: "灰色", className: "border-slate-200 bg-slate-100 text-slate-600", createdAt: "2026-04-09", updatedAt: "2026-05-13" },
  { id: "tm8", category: "客户来源", value: "徐蔚", colorLabel: "蓝色", className: "border-sky-100 bg-sky-50 text-sky-700", createdAt: "2026-04-11", updatedAt: "2026-05-15" },
  { id: "tm9", category: "客户来源", value: "美团", colorLabel: "黄色", className: "border-amber-100 bg-amber-50 text-amber-700", createdAt: "2026-04-12", updatedAt: "2026-05-16" },
  { id: "tm10", category: "客户来源", value: "小红书", colorLabel: "红色", className: "border-rose-100 bg-rose-50 text-rose-700", createdAt: "2026-04-13", updatedAt: "2026-05-17" },
  { id: "tm11", category: "客户来源", value: "海华", colorLabel: "绿色", className: "border-teal-100 bg-teal-50 text-teal-700", createdAt: "2026-04-14", updatedAt: "2026-05-18" },
  { id: "tm12", category: "其他", value: "新客户", colorLabel: "蓝色", className: "border-sky-100 bg-sky-50 text-sky-700", createdAt: "2026-04-16", updatedAt: "2026-05-20" },
  { id: "tm13", category: "其他", value: "老客户", colorLabel: "黄色", className: "border-amber-100 bg-amber-50 text-amber-700", createdAt: "2026-04-17", updatedAt: "2026-05-21" },
  { id: "tm14", category: "其他", value: "高关注", colorLabel: "红色", className: "border-rose-100 bg-rose-50 text-rose-700", createdAt: "2026-04-18", updatedAt: "2026-05-22" },
  { id: "tm15", category: "其他", value: "复诊", colorLabel: "灰色", className: "border-slate-200 bg-slate-100 text-slate-600", createdAt: "2026-04-19", updatedAt: "2026-05-23" },
];

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function ColorDot({ dotClass }: { dotClass: string }) {
  return <span className={`inline-flex h-5 w-5 rounded-md ${dotClass}`}></span>;
}

function TagChip({ value, className }: { value: string; className: string }) {
  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${className}`}>{value}</span>;
}

export default function TagManagement() {
  const [tagRows, setTagRows] = useState(initialTagManagementRows);
  const [tagFilter, setTagFilter] = useState<TagFilter>("全部类型");
  const [tagPage, setTagPage] = useState(1);
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [tagColorDropdownOpen, setTagColorDropdownOpen] = useState(false);
  const [tagDraft, setTagDraft] = useState<TagDraft>(initialTagDraft);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);

  const filteredTagRows = useMemo(
    () => (tagFilter === "全部类型" ? tagRows : tagRows.filter((item) => item.category === tagFilter)),
    [tagFilter, tagRows]
  );
  const tagPageSize = 10;
  const totalTagPages = Math.max(1, Math.ceil(filteredTagRows.length / tagPageSize));
  const currentTagPage = Math.min(tagPage, totalTagPages);
  const pagedTagRows = useMemo(
    () => filteredTagRows.slice((currentTagPage - 1) * tagPageSize, currentTagPage * tagPageSize),
    [currentTagPage, filteredTagRows]
  );
  const selectedTagColor = tagColorPresets.find((item) => item.label === tagDraft.colorLabel) ?? tagColorPresets[tagColorPresets.length - 1];

  function closeTagModal() {
    setTagModalOpen(false);
    setTagColorDropdownOpen(false);
    setEditingTagId(null);
    setTagDraft(initialTagDraft);
  }

  function openCreateTagModal() {
    setTagDraft(initialTagDraft);
    setEditingTagId(null);
    setTagColorDropdownOpen(false);
    setTagModalOpen(true);
  }

  function openEditTagModal(row: TagManagementRow) {
    setTagDraft({
      category: row.category,
      colorLabel: row.colorLabel,
      value: row.value,
    });
    setEditingTagId(row.id);
    setTagColorDropdownOpen(false);
    setTagModalOpen(true);
  }

  function handleDeleteTag(id: string) {
    if (!window.confirm("确认删除该标签吗？")) return;
    setTagRows((prev) => prev.filter((item) => item.id !== id));
  }

  function handleSaveTag() {
    const nextValue = tagDraft.value.trim();
    if (!nextValue) return;

    const color = tagColorPresets.find((item) => item.label === tagDraft.colorLabel) ?? tagColorPresets[tagColorPresets.length - 1];
    const today = getTodayDate();

    if (editingTagId) {
      setTagRows((prev) =>
        prev.map((item) =>
          item.id === editingTagId
            ? {
                ...item,
                category: tagDraft.category,
                value: nextValue,
                colorLabel: color.label,
                className: color.className,
                updatedAt: today,
              }
            : item
        )
      );
    } else {
      setTagRows((prev) => [
        {
          id: `tm-${Date.now()}`,
          category: tagDraft.category,
          value: nextValue,
          colorLabel: color.label,
          className: color.className,
          createdAt: today,
          updatedAt: today,
        },
        ...prev,
      ]);
      setTagPage(1);
    }

    closeTagModal();
  }

  const modalNode =
    tagModalOpen && typeof document !== "undefined"
      ? createPortal(
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/35 px-4 py-8" onClick={closeTagModal}>
            <div
              className="w-full max-w-[720px] rounded-[32px] bg-white px-8 py-7 shadow-[0_24px_80px_rgba(15,23,42,0.18)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[20px] font-bold leading-8 text-gray-900">{editingTagId ? "编辑标签" : "新增标签"}</div>
                  <div className="mt-1 text-sm font-medium leading-6 text-slate-500">通过弹窗快速配置类别、颜色与标签值。</div>
                </div>
                <button
                  className="rounded-2xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200"
                  onClick={closeTagModal}
                >
                  关闭
                </button>
              </div>

              <div className="mt-7 space-y-5">
                <div>
                  <div className="text-sm font-semibold text-slate-500">类别</div>
                  <select
                    value={tagDraft.category}
                    onChange={(e) => setTagDraft((prev) => ({ ...prev, category: e.target.value as TagCategory }))}
                    className="mt-3 h-14 w-full rounded-[24px] border border-slate-200 bg-white px-5 text-base font-semibold text-slate-700 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                  >
                    {tagCategoryOptions
                      .filter((item): item is TagCategory => item !== "全部类型")
                      .map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="grid gap-5 md:grid-cols-[1fr_1.2fr]">
                  <div>
                    <div className="text-sm font-semibold text-slate-500">颜色</div>
                    <div className="relative mt-3">
                      <button
                        className="flex h-14 w-full items-center justify-between rounded-[24px] border border-slate-200 bg-white px-5 text-left text-base font-semibold text-slate-700"
                        onClick={() => setTagColorDropdownOpen((prev) => !prev)}
                      >
                        <span className="flex items-center gap-3">
                          <ColorDot dotClass={selectedTagColor.dotClass} />
                          <span>{selectedTagColor.label}</span>
                        </span>
                        <span className="text-sm text-slate-400">▾</span>
                      </button>

                      {tagColorDropdownOpen && (
                        <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-10 rounded-[24px] border border-slate-200 bg-white p-2 shadow-xl">
                          {tagColorPresets.map((color) => (
                            <button
                              key={color.label}
                              className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-base font-semibold text-slate-700 hover:bg-slate-50"
                              onClick={() => {
                                setTagDraft((prev) => ({ ...prev, colorLabel: color.label }));
                                setTagColorDropdownOpen(false);
                              }}
                            >
                              <span className="flex items-center gap-3">
                                <ColorDot dotClass={color.dotClass} />
                                <span>{color.label}</span>
                              </span>
                              <span className="text-slate-300">{tagDraft.colorLabel === color.label ? "✓" : ""}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-semibold text-slate-500">值</div>
                    <input
                      value={tagDraft.value}
                      onChange={(e) => setTagDraft((prev) => ({ ...prev, value: e.target.value }))}
                      placeholder="请输入标签值"
                      className="mt-3 h-14 w-full rounded-[24px] border border-slate-200 bg-white px-5 text-base font-semibold text-slate-700 outline-none placeholder:font-medium placeholder:text-slate-400 focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-4">
                <button
                  className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-base font-semibold text-slate-600 hover:bg-slate-50"
                  onClick={closeTagModal}
                >
                  取消
                </button>
                <button
                  className="rounded-2xl bg-primary-500 px-6 py-3 text-base font-semibold text-white hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-primary-300"
                  disabled={!tagDraft.value.trim()}
                  onClick={handleSaveTag}
                >
                  确认保存
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div className="min-h-full flex flex-col gap-6">
      <div className="bg-white rounded-2xl card-shadow border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="text-lg font-bold text-gray-900">标签管理</div>
              <div className="mt-1 text-sm text-gray-500">统一管理客户标签规则，支持按类别筛选，并通过弹窗完成新增配置。</div>
            </div>
            <div className="flex flex-wrap gap-3">
              <select
                value={tagFilter}
                onChange={(e) => {
                  setTagFilter(e.target.value as TagFilter);
                  setTagPage(1);
                }}
                className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
              >
                {tagCategoryOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <button
                className="inline-flex items-center gap-2 rounded-2xl bg-primary-500 px-4 py-3 text-sm font-semibold text-white hover:bg-primary-600 active:bg-primary-700"
                onClick={openCreateTagModal}
              >
                <Plus weight="bold" className="h-4 w-4" />
                新增标签
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-gray-50 text-xs uppercase tracking-[0.18em] text-gray-400">
              <tr>
                <th className="px-4 py-4 font-semibold">类别</th>
                <th className="px-4 py-4 font-semibold">值</th>
                <th className="px-4 py-4 font-semibold">创建日期</th>
                <th className="px-4 py-4 font-semibold">更新日期</th>
                <th className="px-4 py-4 font-semibold">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {pagedTagRows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 font-semibold text-gray-900 whitespace-nowrap">{row.category}</td>
                  <td className="px-4 py-4">
                    <TagChip value={row.value} className={row.className} />
                  </td>
                  <td className="px-4 py-4 text-gray-600 whitespace-nowrap">{row.createdAt}</td>
                  <td className="px-4 py-4 text-gray-600 whitespace-nowrap">{row.updatedAt}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        className="rounded-xl bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200"
                        onClick={() => openEditTagModal(row)}
                      >
                        编辑
                      </button>
                      <button
                        className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-100"
                        onClick={() => handleDeleteTag(row.id)}
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

        <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-4 text-sm text-gray-500 lg:flex-row lg:items-center lg:justify-between">
          <div>共 {filteredTagRows.length} 条标签数据，当前第 {currentTagPage} / {totalTagPages} 页</div>
          <div className="flex gap-2">
            <button
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 disabled:cursor-not-allowed disabled:text-gray-300"
              disabled={currentTagPage === 1}
              onClick={() => setTagPage((prev) => Math.max(1, prev - 1))}
            >
              上一页
            </button>
            <button
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 disabled:cursor-not-allowed disabled:text-gray-300"
              disabled={currentTagPage === totalTagPages}
              onClick={() => setTagPage((prev) => Math.min(totalTagPages, prev + 1))}
            >
              下一页
            </button>
          </div>
        </div>
      </div>
      {modalNode}
    </div>
  );
}
