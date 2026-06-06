# 客户档案：PC 客户列表 + 小程序新增档案 实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 在现有 CRM 客户档案原型中新增“门店客户数汇总 + 客户列表合并展示”，并在“小程序演示页”首页新增“新增档案”入口与新增档案表单，提交后能在 PC 端客户列表/详情中看到新客户。

**架构：** 以 `localStorage` 作为统一的“新增客户档案”存储；PC 端与小程序演示页共享同一套读写函数；现有 `mockData.patients` 仍作为初始演示数据，与本地新增客户合并展示。

**技术栈：** React 19、react-router 7、TypeScript、Tailwind CSS、Ant Design（PC 列表筛选）、localStorage

---

## 文件结构（将创建/修改）

**创建**
- `src/pages/crm/patientArchiveStore.ts`：localStorage 仓库（读写/合并/按 id 查找/删除）

**修改**
- `src/pages/crm/mockData.ts`：扩展 `Patient` 类型（可选字段），并补充“客户来源”选项（`小程序扫码`）
- `src/pages/crm/ClientList.tsx`：列表数据改为“mock + 本地新增”合并；增加门店客户数汇总；删除时同步本地仓库
- `src/pages/crm/ClientDetail.tsx`：详情页 `patients.find` 改为从合并数据按 id 获取，兼容本地新增客户
- `src/pages/crm/ClientVisitNew.tsx`：就诊档案页里按 id 取 patient 的逻辑改为从合并数据取
- `src/pages/external/Miniprogram.tsx`：首页“眼健康守护计划”卡片右侧新增“新增档案”入口；新增“新增档案”页面与表单提交

**验证**
- `npm run build`
- `npm run lint`
- 手工验证：打开 `/miniprogram?storeId=静安门店` 新增档案 -> 刷新 `/crm/client-list` 查看新增客户

---

### 任务 1：建立本地客户档案仓库（localStorage）

**文件：**
- 创建：`src/pages/crm/patientArchiveStore.ts`
- 修改：`src/pages/crm/mockData.ts`

- [ ] **步骤 1：创建仓库模块骨架**

在 `src/pages/crm/patientArchiveStore.ts` 写入以下代码：

```ts
import type { Patient } from "./mockData";

const STORAGE_KEY = "weiai.crm.patients";

type StoredPatients = Patient[];

function safeParsePatients(raw: string | null): StoredPatients {
  try {
    const parsed = JSON.parse(raw ?? "[]") as unknown;
    return Array.isArray(parsed) ? (parsed as StoredPatients) : [];
  } catch {
    return [];
  }
}

export function getLocalPatients(): Patient[] {
  return safeParsePatients(window.localStorage.getItem(STORAGE_KEY));
}

export function setLocalPatients(next: Patient[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function isLocalPatientId(id: string) {
  return id.startsWith("lp-");
}

function createLocalPatientId() {
  return `lp-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createLocalPatientNo() {
  const year = new Date().getFullYear();
  const suffix = String(Date.now()).slice(-5);
  return `P${year}${suffix}`;
}

export function addLocalPatient(input: Omit<Patient, "id" | "no">): Patient {
  const created: Patient = { ...input, id: createLocalPatientId(), no: createLocalPatientNo() };
  const existing = getLocalPatients();
  setLocalPatients([created, ...existing]);
  return created;
}

export function removeLocalPatient(id: string) {
  const existing = getLocalPatients();
  setLocalPatients(existing.filter((p) => p.id !== id));
}

export function getMergedPatients(mockPatients: Patient[]): Patient[] {
  const local = getLocalPatients();
  const map = new Map<string, Patient>();
  for (const p of local) map.set(p.id, p);
  for (const p of mockPatients) if (!map.has(p.id)) map.set(p.id, p);
  return Array.from(map.values());
}

export function findMergedPatientById(mockPatients: Patient[], id: string): Patient | null {
  const merged = getMergedPatients(mockPatients);
  return merged.find((p) => p.id === id) ?? null;
}
```

- [ ] **步骤 2：扩展 Patient 类型，补充来源选项**

在 `src/pages/crm/mockData.ts` 修改 `Patient` 类型，增加可选字段以容纳建档信息：

```ts
export type Patient = {
  ...
  idCard?: string;
  medicalHistory?: {
    eyeDiseaseHistory?: string;
    eyeSurgerySide?: "无" | "左眼" | "右眼" | "双眼";
    eyeSurgeryDesc?: string;
  };
};
```

并在 `profileTagStandard` 的“客户来源”中增加 `小程序扫码` 选项，示例：

```ts
{ value: "小程序扫码", className: "border-emerald-100 bg-emerald-50 text-emerald-700" },
```

- [ ] **步骤 3：运行 TypeScript 构建检查**

运行：

```bash
npm run build
```

预期：成功产出 build（无 TS 报错）。

- [ ] **步骤 4：Commit**

```bash
git add src/pages/crm/patientArchiveStore.ts src/pages/crm/mockData.ts
git commit -m "feat(crm): add local patient archive store"
```

---

### 任务 2：PC 端客户列表合并展示 + 门店客户数汇总

**文件：**
- 修改：`src/pages/crm/ClientList.tsx`

- [ ] **步骤 1：引入合并数据并替换初始 state**

在 `ClientList.tsx` 顶部新增 import：

```ts
import { getMergedPatients, isLocalPatientId, removeLocalPatient } from "./patientArchiveStore";
```

把 `useState<Patient[]>(patients)` 改为：

```ts
const [data, setData] = useState<Patient[]>(() => getMergedPatients(patients));
```

- [ ] **步骤 2：增加门店客户数汇总（展示区块）**

在组件内用 `useMemo` 计算门店计数：

```ts
const storeSummary = useMemo(() => {
  const counter = new Map<string, number>();
  for (const p of data) {
    const store = String(p.store ?? "未分配门店");
    counter.set(store, (counter.get(store) ?? 0) + 1);
  }
  return Array.from(counter.entries())
    .map(([store, count]) => ({ store, count }))
    .sort((a, b) => b.count - a.count);
}, [data]);
```

并在筛选卡片上方/内部（靠近搜索区）插入一个简洁展示（例如横向 tag 列表）：

```tsx
<div className="flex flex-wrap gap-2">
  {storeSummary.map((row) => (
    <span key={row.store} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
      {row.store}：{row.count}
    </span>
  ))}
</div>
```

- [ ] **步骤 3：删除逻辑同步本地仓库**

在确认删除的 handler 中，当 `isLocalPatientId(deleteCandidate.id)` 为 true 时调用 `removeLocalPatient(deleteCandidate.id)`，并同时 `setData` 移除。

- [ ] **步骤 4：运行构建与 lint**

```bash
npm run build
npm run lint
```

预期：均通过。

- [ ] **步骤 5：Commit**

```bash
git add src/pages/crm/ClientList.tsx
git commit -m "feat(crm): merge local patients and show store summary"
```

---

### 任务 3：PC 端客户详情/就诊新建页面兼容本地新增客户

**文件：**
- 修改：`src/pages/crm/ClientDetail.tsx`
- 修改：`src/pages/crm/ClientVisitNew.tsx`

- [ ] **步骤 1：客户详情页改为从合并数据按 id 取 patient**

在 `ClientDetail.tsx` 新增 import：

```ts
import { findMergedPatientById } from "./patientArchiveStore";
```

把：

```ts
const patient = useMemo(() => patients.find((p) => p.id === id) ?? patients[0], [id]);
```

改为：

```ts
const patient = useMemo(() => findMergedPatientById(patients, id) ?? patients[0], [id]);
```

- [ ] **步骤 2：就诊新建页改为从合并数据按 id 取 patient**

在 `ClientVisitNew.tsx` 新增 import：

```ts
import { findMergedPatientById } from "./patientArchiveStore";
```

把 `patients.find((p) => p.id === id)` 替换为 `findMergedPatientById(patients, id)`（保持兜底逻辑不变）。

- [ ] **步骤 3：运行构建与 lint**

```bash
npm run build
npm run lint
```

- [ ] **步骤 4：Commit**

```bash
git add src/pages/crm/ClientDetail.tsx src/pages/crm/ClientVisitNew.tsx
git commit -m "fix(crm): support local patients in detail and visit pages"
```

---

### 任务 4：小程序演示页新增档案入口 + 新增档案表单（带门店 id，且不可编辑）

**文件：**
- 修改：`src/pages/external/Miniprogram.tsx`

- [ ] **步骤 1：增加页面 id 与返回逻辑**

扩展 `PageId`：

```ts
type PageId = ... | "archive-new";
```

并在 `goBack()` 中增加从 `"archive-new"` 返回 `"home"` 的分支。

- [ ] **步骤 2：首页“眼健康守护计划”卡片右侧加按钮**

将卡片布局改为左右两侧（左：文案；右：按钮），并在按钮点击时：
- 从 URL 读取门店 id（优先 `storeId`，其次 `store`），为空则使用 `"默认门店"`
- `navigateTo("archive-new")`

读取 query 参数函数（放在组件内部即可）：

```ts
const getQueryParam = (key: string) => {
  const params = new URLSearchParams(window.location.search);
  const value = params.get(key);
  return value ? String(value) : "";
};
```

- [ ] **步骤 3：新增“新增档案”页面与表单**

新增状态：

```ts
const [archiveStoreId, setArchiveStoreId] = useState("");
const [archiveForm, setArchiveForm] = useState({
  name: "",
  age: "",
  gender: "" as "" | "男" | "女",
  mobile: "",
  idCard: "",
  eyeDiseaseHistory: "无",
  eyeSurgerySide: "无" as "无" | "左眼" | "右眼" | "双眼",
  eyeSurgeryDesc: "",
});
```

新增“眼部疾病史”选项列表（与需求一致，直接常量数组）：

```ts
const eyeDiseaseOptions = [
  "无",
  "近视",
  "远视",
  "散光",
  "老视",
  "斜视",
  "弱视",
  "过敏性结膜炎",
  "干眼症",
  "角膜病",
  "虹睫炎",
  "青光眼",
  "白内障",
  "飞蚊症",
  "玻璃体后脱离",
  "糖尿病视网膜脱离",
  "视网膜静脉阻塞",
  "视网膜动脉阻塞",
  "年龄相关性黄斑变性",
  "高度近视视网膜病变",
  "其他眼底病",
  "眼外伤",
  "其他",
];
```

表单校验（提交时）：
- 姓名/年龄/性别/手机号必填
- 年龄需为正整数
- 手机号做最小校验（去空格后满足 `^1\\d{10}$`）
- 病史信息均可空；手术史非“无”时，手术描述必填

提交时写入本地仓库：

```ts
import { addLocalPatient } from "../crm/patientArchiveStore";
```

构造 Patient：
- `name, gender, age, mobile, idCard`
- `store: archiveStoreId`（不可编辑）
- `profile: { source: "小程序扫码", other: "新客户" }`
- `latestVisit: ""`、`nextReview: ""` 等字段可为空或省略（已有字段为可选的保持可选；若非可选则填 `""`）
- `medicalHistory` 写入 `eyeDiseaseHistory/eyeSurgerySide/eyeSurgeryDesc`

成功后：
- `showToast("建档成功")`
- `navigateTo("home")`

- [ ] **步骤 4：运行构建与 lint**

```bash
npm run build
npm run lint
```

- [ ] **步骤 5：Commit**

```bash
git add src/pages/external/Miniprogram.tsx
git commit -m "feat(miniprogram): add archive creation flow"
```

---

### 任务 5：端到端手工验证清单

**文件：**
- 无（仅验证）

- [ ] **步骤 1：启动开发环境**

```bash
npm run dev
```

- [ ] **步骤 2：小程序演示页验证**

打开：
- `http://localhost:5173/miniprogram?storeId=静安门店`

操作：
- 首页 -> 点击“新增档案”
- 确认页面顶部/表单显示门店为“静安门店”且不可编辑
- 填写必填项与选填病史（包含手术史非“无”时的手术描述）
- 提交 -> toast 成功 -> 回到首页

- [ ] **步骤 3：PC 端 CRM 列表验证**

打开：
- `http://localhost:5173/crm/client-list`

验证：
- 顶部“门店客户数汇总”包含“静安门店”且数量+1
- 列表中出现新客户；点击进入详情页能正常渲染（不报错）

