# 客户档案标签管理实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 在客户档案详情页新增“标签管理”Tab，支持类别筛选、表格展示和新增标签弹窗的本地 mock 交互。

**架构：** 延续 `ClientDetail.tsx` 现有单文件页面模式，在同文件内增加标签管理所需的类型、初始数据和局部状态，避免引入额外状态库或新路由。界面结构参考 `docs/CRM 客户档案管理系统/index.html` 的标签管理页，但实现范围只保留列表筛选、新增弹窗、颜色选择和本地追加闭环。

**技术栈：** React 19、TypeScript、React Router 7、Tailwind CSS 4、ESLint、Vite

---

### 任务 1：补齐标签管理本地数据

**文件：**
- 修改：`/Users/luffyzh/luffyzh/github/profit-projects/weiai-sms-prd/src/pages/crm/ClientDetail.tsx`
- 参考：`/Users/luffyzh/luffyzh/github/profit-projects/weiai-sms-prd/docs/CRM 客户档案管理系统/index.html`

- [ ] **步骤 1：新增标签颜色和表格行类型**

```ts
type TagCategory = "会员类型" | "复查状态" | "客户来源" | "其他";

type TagManagementRow = {
  id: string;
  category: TagCategory;
  value: string;
  colorLabel: string;
  className: string;
  createdAt: string;
  updatedAt: string;
};
```

- [ ] **步骤 2：补齐默认颜色预设和初始标签数据**

```ts
const tagColorPresets = [
  { label: "蓝色", dotClass: "bg-primary-500", className: "border-primary-100 bg-primary-50 text-primary-600" },
  { label: "黄色", dotClass: "bg-yellow-400", className: "border-yellow-100 bg-yellow-50 text-yellow-700" },
  { label: "橙色", dotClass: "bg-orange-400", className: "border-orange-100 bg-orange-50 text-orange-700" },
  { label: "绿色", dotClass: "bg-emerald-500", className: "border-emerald-100 bg-emerald-50 text-emerald-700" },
  { label: "紫色", dotClass: "bg-violet-500", className: "border-violet-100 bg-violet-50 text-violet-700" },
  { label: "红色", dotClass: "bg-rose-500", className: "border-rose-100 bg-rose-50 text-rose-700" },
  { label: "灰色", dotClass: "bg-slate-400", className: "border-slate-200 bg-slate-100 text-slate-600" },
] as const;
```

### 任务 2：实现详情页标签管理 Tab

**文件：**
- 修改：`/Users/luffyzh/luffyzh/github/profit-projects/weiai-sms-prd/src/pages/crm/ClientDetail.tsx`

- [ ] **步骤 1：在 tabs 中新增“标签管理”项**

```ts
const tabs = [
  { key: "visits", label: "就诊记录" },
  { key: "training", label: "视光训练记录" },
  { key: "tagManagement", label: "标签管理" },
  { key: "glasses", label: "配镜记录" },
  { key: "appointments", label: "预约记录" },
  { key: "followup", label: "回访记录" },
  { key: "consumption", label: "消费记录" },
] as const;
```

- [ ] **步骤 2：增加筛选、分页和表格渲染状态**

```ts
const [tagRows, setTagRows] = useState(initialTagManagementRows);
const [tagFilter, setTagFilter] = useState<"全部类型" | TagCategory>("全部类型");
const filteredTagRows = useMemo(
  () => (tagFilter === "全部类型" ? tagRows : tagRows.filter((item) => item.category === tagFilter)),
  [tagFilter, tagRows]
);
```

- [ ] **步骤 3：实现列表卡片、筛选器和表格**

```tsx
{activeTab === "tagManagement" && (
  <section className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
    <div className="border-b border-gray-100 p-4">...</div>
    <div className="overflow-x-auto">
      <table className="min-w-full text-left">...</table>
    </div>
  </section>
)}
```

### 任务 3：实现新增标签弹窗

**文件：**
- 修改：`/Users/luffyzh/luffyzh/github/profit-projects/weiai-sms-prd/src/pages/crm/ClientDetail.tsx`

- [ ] **步骤 1：增加弹窗表单和颜色下拉状态**

```ts
const [tagModalOpen, setTagModalOpen] = useState(false);
const [tagColorDropdownOpen, setTagColorDropdownOpen] = useState(false);
const [tagDraft, setTagDraft] = useState({
  category: "会员类型" as TagCategory,
  colorLabel: "灰色",
  value: "",
});
```

- [ ] **步骤 2：实现弹窗 UI 和颜色选择列表**

```tsx
{tagModalOpen && (
  <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 px-4">
    <div className="w-full max-w-3xl rounded-[28px] bg-white p-6 shadow-2xl">...</div>
  </div>
)}
```

- [ ] **步骤 3：实现确认保存逻辑并追加新行**

```ts
function handleCreateTag() {
  if (!tagDraft.value.trim()) return;
  const selectedColor = tagColorPresets.find((item) => item.label === tagDraft.colorLabel)!;
  setTagRows((prev) => [
    {
      id: `tag-${Date.now()}`,
      category: tagDraft.category,
      value: tagDraft.value.trim(),
      colorLabel: tagDraft.colorLabel,
      className: selectedColor.className,
      createdAt: "2026-05-23",
      updatedAt: "2026-05-23",
    },
    ...prev,
  ]);
}
```

### 任务 4：验证

**文件：**
- 修改：`/Users/luffyzh/luffyzh/github/profit-projects/weiai-sms-prd/src/pages/crm/ClientDetail.tsx`

- [ ] **步骤 1：运行 ESLint**

运行：`npm run lint`
预期：PASS，无新增 ESLint 错误。

- [ ] **步骤 2：运行构建**

运行：`npm run build`
预期：PASS，标签管理 Tab 和弹窗逻辑不影响现有构建。

- [ ] **步骤 3：检查编辑器诊断**

运行：获取 `src/pages/crm/ClientDetail.tsx` diagnostics  
预期：无新增 TypeScript / JSX 报错。
