# 新增档案：姓名远程搜索回填（方案 A）实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 在 CRM 新增档案页面，将“姓名”输入框改为 antd Select 远程搜索下拉；从内置 mock 用户库按姓名/手机号搜索，选中后自动回填基础信息表单。

**架构：** `mockData.ts` 提供 `miniProgramUsers` 作为“已注册小程序用户库”；`ClientVisitNew.tsx` 内部用 `setTimeout` 包装 Promise 模拟远程请求 + 防抖搜索；选中后将数据映射到 `basicForm`。

**技术栈：** React、TypeScript、antd Select、现有 tailwind 样式体系

---

## 文件结构

**修改：**
- `src/pages/crm/mockData.ts`：新增 mock 用户库 `miniProgramUsers` 与类型
- `src/pages/crm/ClientVisitNew.tsx`：姓名字段改为 antd Select 远程搜索 + 选中回填

---

### 任务 1：扩展 mock 用户库

**文件：**
- 修改：[mockData.ts](file:///Users/luffyzh/luffyzh/github/profit-projects/weiai-sms-prd/src/pages/crm/mockData.ts)

- [ ] **步骤 1：新增类型与数据常量**

在 `mockData.ts` 增加：

```ts
export type MiniProgramUser = {
  id: string;
  name: string;
  mobile: string;
  gender: "男" | "女";
  birthday: string;
  source?: string;
  memberLevel?: string;
};

export const miniProgramUsers: MiniProgramUser[] = [
  {
    id: "mpu-001",
    name: "张店长",
    mobile: "13800138000",
    gender: "男",
    birthday: "1990-01-01",
    source: "自然",
    memberLevel: "VIP",
  },
  {
    id: "mpu-002",
    name: "李女士",
    mobile: "13900139000",
    gender: "女",
    birthday: "1994-08-12",
    source: "小红书",
    memberLevel: "普通用户",
  },
];
```

- [ ] **步骤 2：TypeScript 构建校验**

运行：

```bash
npm run build
```

预期：PASS（无 TS 报错）

- [ ] **步骤 3：Commit**

```bash
git add src/pages/crm/mockData.ts
git commit -m "feat(crm): add mock mini-program users dataset"
```

---

### 任务 2：新增档案页接入 antd Select 远程搜索并回填

**文件：**
- 修改：[ClientVisitNew.tsx](file:///Users/luffyzh/luffyzh/github/profit-projects/weiai-sms-prd/src/pages/crm/ClientVisitNew.tsx)

- [ ] **步骤 1：引入 antd Select 与 mock 用户库**

在 `ClientVisitNew.tsx` 顶部 imports：

```ts
import { Select as AntdSelect, Spin } from "antd";
```

并从 `./mockData` 追加导入：

```ts
import { miniProgramUsers, type MiniProgramUser } from "./mockData";
```

- [ ] **步骤 2：增加搜索状态与“远程查询”函数**

在组件 state 区域新增：

```ts
const [selectedUserId, setSelectedUserId] = useState<string | undefined>(undefined);
const [userKeyword, setUserKeyword] = useState("");
const [userOptions, setUserOptions] = useState<Array<{ value: string; label: string }>>([]);
const [userFetching, setUserFetching] = useState(false);
const userSearchTimerRef = useRef<number | undefined>(undefined);
```

并增加工具函数（本地模糊匹配 + 模拟远程延迟）：

```ts
function normalize(value: string) {
  return value.replaceAll(/\s+/g, "").toLowerCase();
}

function searchMockUsers(keyword: string) {
  const trimmed = keyword.trim();
  const normalized = normalize(trimmed);
  const matched = trimmed
    ? miniProgramUsers.filter((u) => normalize(u.name).includes(normalized) || normalize(u.mobile).includes(normalized))
    : miniProgramUsers;
  return matched.slice(0, 20);
}

function buildUserOption(user: MiniProgramUser) {
  return { value: user.id, label: `${user.name}（${user.mobile}）` };
}
```

在 `useEffect` 中实现防抖查询：

```ts
useEffect(() => {
  if (!isNewClient) return;
  window.clearTimeout(userSearchTimerRef.current);
  setUserFetching(true);
  userSearchTimerRef.current = window.setTimeout(() => {
    Promise.resolve(searchMockUsers(userKeyword))
      .then((rows) => setUserOptions(rows.map(buildUserOption)))
      .finally(() => setUserFetching(false));
  }, 250);
  return () => window.clearTimeout(userSearchTimerRef.current);
}, [isNewClient, userKeyword]);
```

- [ ] **步骤 3：替换“姓名”输入框为 antd Select**

仅在 `isNewClient` 的“姓名”表单项使用 antd Select，其余保持不变。把原来的：

```tsx
<input
  value={basicForm.name}
  onChange={(e) => setBasicForm((prev) => ({ ...prev, name: e.target.value }))}
  className="..."
/>
```

替换为：

```tsx
<AntdSelect
  className="mt-2 w-full"
  showSearch
  allowClear
  value={selectedUserId}
  placeholder="输入姓名搜索"
  filterOption={false}
  options={userOptions}
  notFoundContent={userFetching ? <Spin size="small" /> : null}
  onSearch={(next) => setUserKeyword(next)}
  onClear={() => {
    setSelectedUserId(undefined);
    setUserKeyword("");
    setBasicForm({
      name: "",
      mobile: "",
      gender: undefined,
      birthday: "",
      source: undefined,
      memberLevel: undefined,
    });
  }}
  onSelect={(userId) => {
    const user = miniProgramUsers.find((row) => row.id === userId);
    if (!user) return;
    setSelectedUserId(user.id);
    setBasicForm({
      name: user.name,
      mobile: user.mobile.replace(/\s+/g, ""),
      gender: user.gender,
      birthday: user.birthday,
      source: user.source,
      memberLevel: user.memberLevel,
    });
  }}
/>
```

- [ ] **步骤 4：在“新建档案”初始化时重置选择状态**

在 `useEffect` 初始化分支 `if (isNewClient || !patient)` 中，除现有 `setBasicForm(...)` 外增加：

```ts
setSelectedUserId(undefined);
setUserKeyword("");
setUserOptions([]);
```

- [ ] **步骤 5：运行 lint 与 build**

```bash
npm run lint
npm run build
```

预期：PASS

- [ ] **步骤 6：手动验证**

运行：

```bash
npm run dev
```

验证点：
- 新增档案页“姓名”显示为可搜索下拉
- 输入关键字能出现候选项（包含姓名 + 手机号）
- 选中后回填：手机号/性别/出生日期/客户来源/会员类型
- 清空选择后基础信息恢复为空

- [ ] **步骤 7：Commit**

```bash
git add src/pages/crm/ClientVisitNew.tsx
git commit -m "feat(crm): remote-search user by name and autofill basic form"
```

---

## 自检

- [ ] 计划中不存在 TODO/待定/“自行处理”等占位符
- [ ] 所有新增字段与现有 `basicForm` 字段名一致（`name/mobile/gender/birthday/source/memberLevel`）
- [ ] `AntdSelect` 与现有自定义 `Select` 命名不冲突
- [ ] `npm run lint` 与 `npm run build` 均可通过

