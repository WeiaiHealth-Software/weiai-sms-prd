# CRM 客户档案改造实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 为客户档案详情页新增“视光训练记录”Tab，并将新增档案页升级为支持一次录入就诊、视训、配镜、收费的多模块页面。

**架构：** 继续沿用现有 React + React Router + Tailwind 单页结构，在 `mockData.ts` 补齐视训记录和多模块录入默认数据，在 `ClientDetail.tsx` 新增视训记录展示与本地交互，在 `ClientVisitNew.tsx` 重构为多模块录入页。由于仓库当前没有测试框架，本次以构建、Lint 和诊断检查作为主要验证手段。

**技术栈：** React 19、TypeScript、React Router 7、Tailwind CSS 4、ESLint、Vite

---

### 任务 1：扩展 CRM mock 数据

**文件：**
- 修改：`/Users/luffyzh/luffyzh/github/profit-projects/weiai-sms-prd/src/pages/crm/mockData.ts`
- 参考：`/Users/luffyzh/luffyzh/github/profit-projects/weiai-sms-prd/docs/superpowers/specs/2026-05-17-crm-archive-design.md`

- [ ] **步骤 1：为视训记录和新增档案页面状态补齐类型定义**

```ts
export type TrainingRecord = {
  id: string;
  patient: string;
  trainingTime: string;
  trainer: string;
  store: string;
  note: string;
  project: string;
  duration: string;
  completion: string;
};

export type ArchiveModuleKey = "clinic" | "training" | "fitting" | "billing";
```

- [ ] **步骤 2：新增视训记录 mock 数据**

```ts
export const trainingRecords: TrainingRecord[] = [
  {
    id: "t1",
    patient: "周沐言",
    trainingTime: "2026-05-01 11:20",
    trainer: "苏雨晴",
    store: "惟爱 · 上海海华医院",
    note: "完成双眼调节训练，状态稳定。",
    project: "调节灵敏度训练",
    duration: "20",
    completion: "90",
  },
];
```

- [ ] **步骤 3：补齐新增档案页需要的枚举和默认选项数据**

```ts
export const archiveSourceOptions = ["自然", "小红书", "美团", "海华", "其他"] as const;
export const archiveMemberOptions = ["普通用户", "VIP", "SVIP"] as const;
export const archiveGenderOptions = ["男", "女"] as const;
```

- [ ] **步骤 4：运行构建验证类型未破坏**

运行：`npm run build`
预期：PASS，TypeScript 构建完成且不报新增导出相关错误。

- [ ] **步骤 5：Commit**

```bash
git add src/pages/crm/mockData.ts
git commit -m "feat: 扩展客户档案 mock 数据"
```

### 任务 2：实现详情页视光训练记录 Tab

**文件：**
- 修改：`/Users/luffyzh/luffyzh/github/profit-projects/weiai-sms-prd/src/pages/crm/ClientDetail.tsx`
- 依赖：`/Users/luffyzh/luffyzh/github/profit-projects/weiai-sms-prd/src/pages/crm/mockData.ts`

- [ ] **步骤 1：接入新的视训记录数据和 Tab 定义**

```ts
import { trainingRecords } from "./mockData";

const tabs = [
  { key: "visits", label: "就诊记录" },
  { key: "training", label: "视光训练记录" },
  { key: "glasses", label: "配镜记录" },
  { key: "appointments", label: "预约记录" },
  { key: "followup", label: "回访记录" },
  { key: "consumption", label: "消费记录" },
] as const;
```

- [ ] **步骤 2：为当前客户筛选视训记录并建立本地查看/删除状态**

```ts
const [trainingRows, setTrainingRows] = useState(trainingRecords);
const [selectedTrainingId, setSelectedTrainingId] = useState<string | null>(null);

const patientTrainingRecords = useMemo(
  () => trainingRows.filter((item) => item.patient === patient.name),
  [patient.name, trainingRows]
);
```

- [ ] **步骤 3：新增视训记录表格和只读详情展示**

```tsx
{activeTab === "training" && (
  <div className="space-y-4">
    <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
      <table className="min-w-full text-left">
        <thead>...</thead>
        <tbody>...</tbody>
      </table>
    </div>
    {selectedTrainingRecord && <section className="rounded-2xl border ...">...</section>}
  </div>
)}
```

- [ ] **步骤 4：为删除按钮接入本地删除逻辑**

```ts
onClick={() => {
  if (!window.confirm("确认删除该条视光训练记录吗？")) return;
  setTrainingRows((prev) => prev.filter((item) => item.id !== record.id));
  setSelectedTrainingId((prev) => (prev === record.id ? null : prev));
}}
```

- [ ] **步骤 5：运行 Lint 和构建验证**

运行：`npm run lint`
预期：PASS，无 ESLint 新增错误。

运行：`npm run build`
预期：PASS，详情页新增 Tab 后可正常构建。

- [ ] **步骤 6：Commit**

```bash
git add src/pages/crm/ClientDetail.tsx src/pages/crm/mockData.ts
git commit -m "feat: 增加客户视光训练记录"
```

### 任务 3：重构新增档案页为多模块录入页

**文件：**
- 修改：`/Users/luffyzh/luffyzh/github/profit-projects/weiai-sms-prd/src/pages/crm/ClientVisitNew.tsx`
- 依赖：`/Users/luffyzh/luffyzh/github/profit-projects/weiai-sms-prd/src/pages/crm/mockData.ts`

- [ ] **步骤 1：将页面状态从单一就诊表单改为“基础信息 + 模块勾选 + 模块内容”**

```ts
const [selectedModules, setSelectedModules] = useState({
  clinic: true,
  training: false,
  fitting: false,
  billing: false,
});

const [moduleStatus, setModuleStatus] = useState({
  clinic: "草稿",
  training: "未录入",
  fitting: "未录入",
  billing: "未录入",
});
```

- [ ] **步骤 2：新增客户基础信息区表单状态**

```ts
const [basicForm, setBasicForm] = useState({
  name: patient.name,
  mobile: patient.mobile.replaceAll(" ", ""),
  gender: patient.gender,
  birthday: "2014-05-12",
  source: patient.profile?.source ?? "自然",
  memberLevel: patient.profile?.memberLevel ?? "普通用户",
});
```

- [ ] **步骤 3：实现本次服务单模块选择区和快捷操作**

```tsx
<button onClick={() => setSelectedModules({ clinic: true, training: true, fitting: true, billing: true })}>
  完整录入
</button>
<button onClick={() => setSelectedModules({ clinic: false, training: false, fitting: false, billing: false })}>
  只建档
</button>
```

- [ ] **步骤 4：将现有就诊表单迁入“就诊档案”模块卡片**

```tsx
{selectedModules.clinic && (
  <section className="rounded-2xl border border-gray-100 bg-white p-5">
    <div className="text-lg font-bold text-gray-900">就诊档案</div>
    <div className="mt-4 grid gap-4 lg:grid-cols-2">...</div>
  </section>
)}
```

- [ ] **步骤 5：新增“视光训练”“配镜记录”“收费详情”三个模块卡片**

```tsx
{selectedModules.training && <section>训练项目 / 训练时长 / 完成度 / 备注</section>}
{selectedModules.fitting && <section>处方类型 / 镜片镜架 / 参数备注</section>}
{selectedModules.billing && <section>收费项目 / 金额 / 支付状态 / 备注</section>}
```

- [ ] **步骤 6：实现保存草稿和完成并返回的 mock 闭环**

```ts
const handleSaveDraft = () => {
  setSavedMessage("草稿已保存（本地 mock）");
};

const handleFinish = () => {
  setSavedMessage("新增档案已完成（本地 mock）");
  navigate(`/crm/client/${patient.id}`);
};
```

- [ ] **步骤 7：运行构建与诊断检查**

运行：`npm run build`
预期：PASS，多模块录入页构建通过。

运行：`npm run lint`
预期：PASS，无新增 ESLint 错误。

运行：使用编辑器诊断检查 `src/pages/crm/ClientVisitNew.tsx`
预期：无 TypeScript 或 JSX 语法报错。

- [ ] **步骤 8：Commit**

```bash
git add src/pages/crm/ClientVisitNew.tsx src/pages/crm/mockData.ts
git commit -m "feat: 支持新增档案多模块录入"
```

### 任务 4：联调与最终验证

**文件：**
- 修改：`/Users/luffyzh/luffyzh/github/profit-projects/weiai-sms-prd/src/pages/crm/ClientDetail.tsx`
- 修改：`/Users/luffyzh/luffyzh/github/profit-projects/weiai-sms-prd/src/pages/crm/ClientVisitNew.tsx`
- 修改：`/Users/luffyzh/luffyzh/github/profit-projects/weiai-sms-prd/src/pages/crm/mockData.ts`

- [ ] **步骤 1：检查详情页与新增页之间的导航闭环**

```tsx
onClick={() => navigate(`/crm/client/${patient.id}/visit/new`)}
onClick={() => navigate(`/crm/client/${patient.id}`)}
```

- [ ] **步骤 2：核对文案、模块顺序和字段名称与规格一致**

```txt
Tab 顺序：就诊记录 / 视光训练记录 / 配镜记录 / 预约记录 / 回访记录 / 消费记录
模块顺序：就诊档案 / 视光训练 / 配镜记录 / 收费详情
```

- [ ] **步骤 3：执行最终验证命令**

运行：`npm run lint`
预期：PASS。

运行：`npm run build`
预期：PASS。

运行：使用编辑器诊断检查以下文件：
- `src/pages/crm/ClientDetail.tsx`
- `src/pages/crm/ClientVisitNew.tsx`
- `src/pages/crm/mockData.ts`

预期：无新增 diagnostics。

- [ ] **步骤 4：Commit**

```bash
git add src/pages/crm/ClientDetail.tsx src/pages/crm/ClientVisitNew.tsx src/pages/crm/mockData.ts
git commit -m "feat: 完成客户档案页面改造"
```
