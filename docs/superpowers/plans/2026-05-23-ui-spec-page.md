# 系统 UI 组件规范页面实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 在当前系统中新增一个无子菜单的一级入口「系统 UI 组件规范」，并实现一个基于参考源码适配重建的独立页面。

**架构：** 新增一个独立页面组件承载 4 个页签内容，使用项目内静态数据和本地交互完成演示。菜单与路由分别接入现有 `menuConfig` 和 `createHashRouter`，页面整体沿用当前后台布局和卡片式内容区风格。

**技术栈：** React 19、TypeScript、React Router、Tailwind CSS、@phosphor-icons/react

---

### 任务 1：接入一级菜单与独立路由

**文件：**
- 创建：无
- 修改：`src/config/menu.ts`
- 修改：`src/router.tsx`
- 参考：`docs/superpowers/specs/2026-05-23-ui-spec-page-design.md`

- [ ] **步骤 1：在菜单配置中新增一级菜单项**

将 `menuConfig` 中新增一个无子菜单的一级菜单，放在现有一级菜单列表中合适的位置，结构与 `dashboard` 一致。

```ts
{
  id: "ui_spec",
  icon: Swatches,
  label: "系统 UI 组件规范",
  path: "/ui-spec",
  subs: [],
}
```

- [ ] **步骤 2：在路由文件中引入页面组件**

在 `src/router.tsx` 顶部增加页面 import，避免该页面落入 `GenericPlaceholder`。

```ts
import UiSpec from "./pages/system/UiSpec";
```

- [ ] **步骤 3：注册独立路由**

在 `MainLayout` 的 `children` 中新增一个直接渲染页面的路由项。

```ts
{
  path: "ui-spec",
  element: <UiSpec />,
}
```

- [ ] **步骤 4：运行构建验证菜单和路由改动可编译**

运行：`npm run build`  
预期：构建通过，没有因为缺少 import、图标或路由注册导致的 TypeScript 错误。

- [ ] **步骤 5：Commit**

```bash
git add src/config/menu.ts src/router.tsx
git commit -m "feat: add ui spec menu entry"
```

### 任务 2：创建页面骨架与共享静态数据

**文件：**
- 创建：`src/pages/system/UiSpec.tsx`
- 参考：`docs/UI 组件规范/ui-spec/index.tsx`

- [ ] **步骤 1：创建页面组件与页签状态**

在新文件中实现页面标题区、说明文案和 4 个页签状态切换。不要依赖 `useHeaderStore`，直接在页面内容区渲染标题。

```tsx
type TabKey = "system" | "basics" | "table" | "form";

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "system", label: "系统 UI 规范" },
  { key: "basics", label: "系统基础组件" },
  { key: "table", label: "表格页" },
  { key: "form", label: "表单组件" },
];

export default function UiSpec() {
  const [tab, setTab] = useState<TabKey>("system");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">系统 UI 组件规范</h1>
        <p className="mt-2 text-sm text-slate-500">
          统一沉淀后台系统常用 UI 规范与基础组件示例，争议以本页示例为准。
        </p>
      </div>
    </div>
  );
}
```

- [ ] **步骤 2：迁移页面所需的静态数据**

将参考页中的核心静态数据迁移到当前文件内，包括品牌色、辅助色、表格演示数据、表单下拉选项等。保留纯数据结构，删除另一套系统专用状态。

```tsx
const brandScale = [
  { key: 50, name: "brand-50", hex: "#eff6ff", bg: "bg-brand-50" },
  { key: 100, name: "brand-100", hex: "#dbeafe", bg: "bg-brand-100" },
];

const demoRows = [
  { id: 1, code: "XW09", name: "光刻微结构近视管理项目", status: "进行中", owner: "徐雷", createdAt: "2025-12-25" },
];
```

- [ ] **步骤 3：补齐本地交互状态**

为表格删除确认、表单控件示例、页签切换准备最小状态集合。

```tsx
const [deleteOpen, setDeleteOpen] = useState(false);
const [rows, setRows] = useState(demoRows);
const [inputValue, setInputValue] = useState("");
const [selectValue, setSelectValue] = useState("");
```

- [ ] **步骤 4：运行诊断确认页面文件无语法错误**

运行：在 IDE 中对 `src/pages/system/UiSpec.tsx` 执行诊断检查  
预期：无未定义类型、无未使用符号、无 JSX 语法错误。

- [ ] **步骤 5：Commit**

```bash
git add src/pages/system/UiSpec.tsx
git commit -m "feat: add ui spec page scaffold"
```

### 任务 3：实现 4 个页签内容与本地交互

**文件：**
- 修改：`src/pages/system/UiSpec.tsx`
- 参考：`docs/UI 组件规范/ui-spec/index.tsx`

- [ ] **步骤 1：实现“系统 UI 规范”页签**

迁移规则说明卡片、主题色品牌色板、副色板、布局结构示意和菜单样式说明，使用当前项目已有 Tailwind 类名。

```tsx
{tab === "system" && (
  <div className="space-y-6">
    <div className="rounded-2xl border border-brand-200 bg-brand-50/60 p-4">
      <h3 className="text-sm font-bold text-brand-700">系统 UI 规范</h3>
    </div>
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      {/* 品牌色 / 副色 / 布局结构 / 菜单样式 */}
    </div>
  </div>
)}
```

- [ ] **步骤 2：实现“系统基础组件”页签**

展示图标、按钮、文本、链接、标签等示例，统一为静态演示，不抽象为全局组件。

```tsx
{tab === "basics" && (
  <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
    <button className="rounded-xl bg-brand-600 px-5 py-2 text-sm font-bold text-white">
      主题色按钮
    </button>
  </div>
)}
```

- [ ] **步骤 3：实现“表格页”页签与删除确认弹窗**

实现筛选工具栏、表格卡片、行内操作和删除确认弹窗。本地删除逻辑只更新 `rows` 状态。

```tsx
const openDelete = (row: DemoRow) => {
  setRowToDelete(row);
  setDeleteOpen(true);
};

const confirmDelete = () => {
  if (!rowToDelete) return;
  setRows((prev) => prev.filter((item) => item.id !== rowToDelete.id));
  setDeleteOpen(false);
};
```

- [ ] **步骤 4：实现“表单组件”页签**

用当前项目可运行的原生控件和简单自定义样式，重建 Input、Search、Radio、Checkbox、Switch、Select、MultiSelect、Textarea 的示例与状态回显。

```tsx
<input
  value={inputValue}
  onChange={(e) => setInputValue(e.target.value)}
  className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
/>
```

- [ ] **步骤 5：在页面顶部完成 Tabs 切换容器**

使用当前项目简单按钮式页签，不引入参考工程的 `Tabs` 组件依赖。

```tsx
<div className="rounded-2xl border border-slate-100 bg-white p-2 shadow-sm">
  <div className="flex flex-wrap gap-2">
    {tabs.map((item) => (
      <button
        key={item.key}
        onClick={() => setTab(item.key)}
        className={tab === item.key ? "bg-brand-600 text-white" : "text-slate-600"}
      >
        {item.label}
      </button>
    ))}
  </div>
</div>
```

- [ ] **步骤 6：运行构建验证完整页面**

运行：`npm run build`  
预期：构建通过，页面中所有 JSX、状态和图标引用正常。

- [ ] **步骤 7：Commit**

```bash
git add src/pages/system/UiSpec.tsx
git commit -m "feat: implement ui spec showcase page"
```

### 任务 4：回归检查与交付清理

**文件：**
- 检查：`src/config/menu.ts`
- 检查：`src/router.tsx`
- 检查：`src/pages/system/UiSpec.tsx`

- [ ] **步骤 1：检查菜单行为**

确认左侧「系统 UI 组件规范」为一级菜单且无子菜单，点击后直接进入页面；切换到其他一级菜单时不影响现有展开逻辑。

运行：本地启动后手动检查侧边栏  
预期：新菜单与其他一级菜单同级显示，点击即可跳转。

- [ ] **步骤 2：检查页面信息结构**

逐项确认页面包含以下内容：

```text
系统 UI 规范
系统基础组件
表格页
表单组件
```

预期：4 个页签均可切换，且内容不为空。

- [ ] **步骤 3：执行最终验证**

运行：`npm run build`  
运行：对 `src/pages/system/UiSpec.tsx`、`src/config/menu.ts`、`src/router.tsx` 执行 IDE 诊断检查  
预期：构建通过，新增文件无诊断报错。

- [ ] **步骤 4：Commit**

```bash
git add src/config/menu.ts src/router.tsx src/pages/system/UiSpec.tsx
git commit -m "feat: add system ui specification page"
```
