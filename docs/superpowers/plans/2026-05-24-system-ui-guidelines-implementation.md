# 全系统 UI 规范总纲与表格页规则 实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 让 `标签管理` 符合当前系统表格页规范，同时同步 `UiSpec` 和根目录 `DESIGN.md`，沉淀当前系统统一 UI 规则。

**架构：** 以 `档案管理` 页面作为现有正确参考，直接修正 `标签管理` 的工具栏结构，不额外引入通用 `TableToolbar` 抽象。同步更新 `UiSpec` 的表格页示例与文案，并在仓库根目录新增 `DESIGN.md` 作为书面规范总纲。验证方式以 `npm run build`、诊断检查和手动页面对照为主。

**技术栈：** React 19、TypeScript、react-router、Tailwind CSS、Vite

---

## 文件结构

**创建：**
- `/Users/luffyzh/luffyzh/github/profit-projects/weiai-sms-prd/DESIGN.md`：全系统 UI 规范总纲，沉淀页面结构、表格页、表单页、按钮与分隔规则。

**修改：**
- `/Users/luffyzh/luffyzh/github/profit-projects/weiai-sms-prd/src/pages/crm/TagManagement.tsx`：移除卡片内标题说明，改成左筛选右 Action，并在 Action 左侧加入竖线分隔。
- `/Users/luffyzh/luffyzh/github/profit-projects/weiai-sms-prd/src/pages/system/UiSpec.tsx`：更新表格页规范文案与示例，使其明确“页面标题在 Header、工具栏左筛选右 Action、Action 左侧竖线分隔”。

**参考：**
- `/Users/luffyzh/luffyzh/github/profit-projects/weiai-sms-prd/src/pages/crm/ClientList.tsx`：当前系统表格页工具栏正确参考。
- `/Users/luffyzh/luffyzh/github/profit-projects/weiai-sms-prd/docs/superpowers/specs/2026-05-24-system-ui-guidelines-design.md`：本次设计规格。

**测试/验证：**
- 无现成自动化测试文件。
- 使用 `npm run build`、`GetDiagnostics` 和手动页面对照进行验证。

### 任务 1：修正 `标签管理` 表格工具栏

**文件：**
- 修改：`/Users/luffyzh/luffyzh/github/profit-projects/weiai-sms-prd/src/pages/crm/TagManagement.tsx`
- 参考：`/Users/luffyzh/luffyzh/github/profit-projects/weiai-sms-prd/src/pages/crm/ClientList.tsx`

- [ ] **步骤 1：对照正确参考页确认结构差异**

阅读 `ClientList.tsx` 的工具栏结构，确认目标模式为“左侧筛选/搜索，右侧 Action，中间竖线分隔”；阅读 `TagManagement.tsx` 当前工具栏，确认需要移除卡片内标题与说明。

重点对照以下结构：

```tsx
<div className="p-5 grid gap-3 xl:grid-cols-[1.42fr_0.82fr_1.42fr_auto] xl:items-center">
  {/* 左侧筛选 */}
  <input ... />
  <select ... />
  <div className="grid grid-cols-2 gap-3">...</div>

  {/* 右侧操作 */}
  <div className="flex items-center justify-end gap-3">
    <button>重置</button>
    <button>搜索</button>
    <span aria-hidden="true" className="h-6 w-px bg-gray-200"></span>
    <button>导出</button>
    <button>新增档案</button>
  </div>
</div>
```

- [ ] **步骤 2：将 `标签管理` 工具栏改为左筛选右 Action**

在 `TagManagement.tsx` 中删除卡片内部的标题与描述区域，把工具栏改成与 `档案管理` 同一职责结构：

- 左侧只保留 `全部类型` 筛选。
- 右侧只保留 `新增标签`。
- Action 左侧增加竖线。
- 无需在卡片内保留“标签管理”标题说明。

目标结构参考如下：

```tsx
<div className="border-b border-gray-100">
  <div className="p-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <Select
        value={tagFilter}
        onChange={(value) => {
          setTagFilter(value as TagFilter);
          setTagPage(1);
        }}
        options={tagFilterSelectOptions}
        className="min-w-[124px]"
        triggerClassName="h-[46px] rounded-2xl border-gray-200 px-4"
      />
    </div>

    <div className="flex items-center justify-end gap-3">
      <span aria-hidden="true" className="h-6 w-px bg-gray-200"></span>
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
```

- [ ] **步骤 3：运行构建验证页面结构改动可编译**

运行：`npm run build`

预期：PASS，`vite build` 成功完成，无 TypeScript 编译错误。

- [ ] **步骤 4：提交本任务改动**

```bash
git add src/pages/crm/TagManagement.tsx
git commit -m "feat: align tag management toolbar with table guidelines"
```

### 任务 2：同步 `UiSpec` 的表格页规范与示例

**文件：**
- 修改：`/Users/luffyzh/luffyzh/github/profit-projects/weiai-sms-prd/src/pages/system/UiSpec.tsx`

- [ ] **步骤 1：更新表格页规范文案**

将 `表格页开发规范` 的说明从“建议”改为更明确的系统规则，至少包含：

- 页面标题在 Header / 页面顶部区域。
- 表格卡片第一行是工具栏，不放标题说明。
- 工具栏左侧只放筛选/搜索/留白。
- 工具栏右侧只放 Action，Action 左侧必须有竖线。

目标文案结构参考：

```tsx
<SectionIntro
  title="表格页开发规范"
  items={[
    "页面标题统一位于 Header / 页面顶部区域，表格卡片内部不重复放标题与说明。",
    "表格工具栏左侧只放筛选、搜索或留白，右侧只放 Action，Action 左侧使用竖线分隔。",
    "主操作优先按钮化，危险操作使用纯文本红色链接，并配合二次确认。",
  ]}
/>
```

- [ ] **步骤 2：调整 `UiSpec` 表格页示例工具栏**

让示例结构更接近 `档案管理` 真实页面，不让用户误以为标题可进入卡片工具栏。保留左筛选右 Action 的组织方式，并保持右侧分隔线存在。

目标结构参考：

```tsx
<div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] lg:flex-row lg:items-center lg:justify-between">
  <div className="inline-flex w-fit max-w-full rounded-xl border border-slate-200/60 bg-slate-100/50 p-1">
    {/* 左侧筛选示例 */}
  </div>

  <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row lg:items-center">
    {/* 搜索 / 重置 */}
    <div className="hidden h-8 w-px bg-slate-200 lg:block"></div>
    <button type="button" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white">
      <Plus size={16} />
      新增项目
    </button>
  </div>
</div>
```

- [ ] **步骤 3：运行构建验证规范页改动可编译**

运行：`npm run build`

预期：PASS，规范页编译成功。

- [ ] **步骤 4：提交本任务改动**

```bash
git add src/pages/system/UiSpec.tsx
git commit -m "docs: update table guidelines in ui spec page"
```

### 任务 3：新增根目录 `DESIGN.md`

**文件：**
- 创建：`/Users/luffyzh/luffyzh/github/profit-projects/weiai-sms-prd/DESIGN.md`

- [ ] **步骤 1：编写全系统 UI 规范总纲**

在仓库根目录新增 `DESIGN.md`，使用当前项目真实规则组织章节，避免空泛术语。至少覆盖：

- 设计目标与适用范围
- 页面整体结构规范
- Header 与页面标题规范
- 卡片容器规范
- 表格页规范
- 表单页规范
- 按钮与操作层级规范
- 标签 / 状态样式规范
- 间距与分隔规范
- 正确参考页与常见错误

建议文档骨架如下：

```md
# DESIGN

## 1. 设计目标与适用范围
## 2. 页面整体结构规范
## 3. Header 与页面标题规范
## 4. 卡片容器规范
## 5. 表格页规范
## 6. 表单页规范
## 7. 按钮与操作层级规范
## 8. 标签 / 状态样式规范
## 9. 间距与分隔规范
## 10. 正确参考页
## 11. 常见错误写法
```

- [ ] **步骤 2：确保写入本次必须落地的表格规则**

在 `表格页规范` 章节明确写入以下内容：

```md
- 页面标题统一属于 Header / 页面顶部区域，不进入表格卡片。
- 表格卡片顶部第一行是工具栏，不放标题与说明。
- 工具栏左侧只放筛选 / 搜索 / 留白。
- 工具栏右侧只放 Action。
- Action 区左侧必须有竖线分隔。
- 无筛选时左侧保留空白，不使用标题补位。
```

- [ ] **步骤 3：提交文档**

```bash
git add DESIGN.md
git commit -m "docs: add system design guidelines"
```

### 任务 4：整体验证与交付检查

**文件：**
- 验证：`/Users/luffyzh/luffyzh/github/profit-projects/weiai-sms-prd/src/pages/crm/TagManagement.tsx`
- 验证：`/Users/luffyzh/luffyzh/github/profit-projects/weiai-sms-prd/src/pages/system/UiSpec.tsx`
- 验证：`/Users/luffyzh/luffyzh/github/profit-projects/weiai-sms-prd/src/layouts/MainLayout.tsx`
- 验证：`/Users/luffyzh/luffyzh/github/profit-projects/weiai-sms-prd/DESIGN.md`

- [ ] **步骤 1：运行构建**

运行：`npm run build`

预期：PASS，生成 `dist/` 构建产物，无 TS 编译错误。

- [ ] **步骤 2：检查诊断**

对最近修改文件运行诊断，确认没有新增硬错误：

```bash
# 通过 IDE / GetDiagnostics 检查：
src/pages/crm/TagManagement.tsx
src/pages/system/UiSpec.tsx
src/layouts/MainLayout.tsx
```

预期：无新增 Error；允许存在项目已有的图标弃用 Hint 或 cSpell Info。

- [ ] **步骤 3：手动页面验收**

手动检查以下页面：

- `#/crm/tag-management`
- `#/ui-spec`
- `#/crm/client-list`

预期：

- `标签管理` 不再在卡片顶部显示页面标题说明。
- `标签管理` 工具栏左侧只有筛选，右侧只有 `新增标签`，中间有竖线。
- `UiSpec` 的表格页规则已明确写入“标题在 Header、左筛选右 Action、Action 左侧竖线分隔”。
- `档案管理` 继续保持现有正确结构，不被破坏。

- [ ] **步骤 4：收尾提交**

```bash
git add src/pages/crm/TagManagement.tsx src/pages/system/UiSpec.tsx DESIGN.md
git commit -m "feat: standardize table page guidelines"
```
