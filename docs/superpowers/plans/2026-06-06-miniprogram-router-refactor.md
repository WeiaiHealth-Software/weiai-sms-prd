# 小程序演示页拆分（子路由）实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 将 `src/pages/external/Miniprogram.tsx` 中的小程序演示页拆分到 `src/pages/external/miniprogram/` 目录，并改为 react-router 子路由管理页面切换与返回。

**架构：** 用 `MiniprogramLayout` 作为壳层（设备壳 + status bar + content area + tab bar + toast），内部通过 `Outlet` 渲染各独立页面组件；入口 `/miniprogram` 根据登录态重定向至 `/miniprogram/login` 或 `/miniprogram/home`。

**技术栈：** React + TypeScript + react-router + Tailwind（现有项目栈），@phosphor-icons/react 图标。

---

## 文件结构（新增/调整）

**创建目录：** `src/pages/external/miniprogram/`

**创建：**
- `src/pages/external/miniprogram/index.tsx`：`MiniprogramLayout`，提供 Context（登录态、toast），渲染 `Outlet`、TabBar、Toast
- `src/pages/external/miniprogram/context.tsx`：`MiniprogramProvider` + `useMiniprogramApp`
- `src/pages/external/miniprogram/hooks/useMiniBack.ts`：基于 `location.pathname` 的返回映射，替代历史栈依赖
- `src/pages/external/miniprogram/constants/eyeDiseaseOptions.ts`
- `src/pages/external/miniprogram/services/patientArchive.service.ts`
- `src/pages/external/miniprogram/ui/icons.tsx`
- `src/pages/external/miniprogram/ui/MiniTopBar.tsx`
- `src/pages/external/miniprogram/ui/MiniTabBar.tsx`
- `src/pages/external/miniprogram/pages/*.tsx`：每个页面一个组件文件

**修改：**
- `src/router.tsx`：把 `/miniprogram` 改为带 children 的子路由
- `src/pages/external/Miniprogram.tsx`：改为 re-export 新目录默认导出，保持旧引用路径可用
- `src/pages/external/miniprogram/ui.tsx`（若存在）：改为 re-export 新 ui 目录导出，避免其他引用断裂

---

## 任务 1：搭建壳层 + Context

**文件：**
- 创建：`src/pages/external/miniprogram/context.tsx`
- 创建：`src/pages/external/miniprogram/index.tsx`

- [ ] **步骤 1：实现 Context（登录态 + toast）**

```tsx
type MiniprogramAppState = {
  isLoggedIn: boolean;
  setLoggedIn: (v: boolean) => void;
  toastMsg: string;
  showToast: (msg: string) => void;
};
```

- [ ] **步骤 2：实现 Layout（设备壳、content、TabBar、Toast、Outlet）**
  - `showTabBar` 根据 pathname 控制：`/miniprogram/login`、`/miniprogram/archive/new` 不显示
  - TabBar 点击使用 `navigate("/miniprogram/home")`、`navigate("/miniprogram/profile")` 等

---

## 任务 2：迁移 UI 组件

**文件：**
- 创建：`src/pages/external/miniprogram/ui/icons.tsx`
- 创建：`src/pages/external/miniprogram/ui/MiniTopBar.tsx`
- 创建：`src/pages/external/miniprogram/ui/MiniTabBar.tsx`
- 修改：`src/pages/external/miniprogram/ui.tsx`（如存在）做 re-export

- [ ] **步骤 1：把旧 `ui.tsx` 的 SVG icons 拆到 `icons.tsx`**
- [ ] **步骤 2：把 `MiniTopBar/MiniTabBar` 拆到独立文件并导出**

---

## 任务 3：迁移页面组件（每页单文件）

**文件：**
- 创建：`src/pages/external/miniprogram/pages/LoginPage.tsx`
- 创建：`src/pages/external/miniprogram/pages/HomePage.tsx`
- 创建：`src/pages/external/miniprogram/pages/ArchiveNewPage.tsx`
- 创建：`src/pages/external/miniprogram/pages/ProfilePage.tsx`
- 创建：`src/pages/external/miniprogram/pages/NotificationsPage.tsx`
- 创建：`src/pages/external/miniprogram/pages/StoreSelectPage.tsx`
- 创建：`src/pages/external/miniprogram/pages/AppointmentPage.tsx`
- 创建：`src/pages/external/miniprogram/pages/FamilyGroupPage.tsx`
- 创建：`src/pages/external/miniprogram/pages/FamilyGroupDetailPage.tsx`
- 创建：`src/pages/external/miniprogram/pages/PatientListPage.tsx`
- 创建：`src/pages/external/miniprogram/pages/MyAppointmentsPage.tsx`

- [ ] **步骤 1：从旧 `Miniprogram.tsx` 拷贝对应 JSX 到各页面组件**
- [ ] **步骤 2：将页面跳转从 setCurrentPage 改为 `useNavigate()`**
- [ ] **步骤 3：返回按钮统一走 `useMiniBack()` 或显式回到父路由**

---

## 任务 4：补齐 constants / services / hooks

**文件：**
- 创建：`src/pages/external/miniprogram/constants/eyeDiseaseOptions.ts`
- 创建：`src/pages/external/miniprogram/services/patientArchive.service.ts`
- 创建：`src/pages/external/miniprogram/hooks/useMiniBack.ts`

- [ ] **步骤 1：下沉 eyeDiseaseOptions**
- [ ] **步骤 2：封装 createPatientArchive（内部调用 CRM 的 addLocalPatient）**
- [ ] **步骤 3：useMiniBack：按 pathname 映射父页面（notifications→home、patients→profile…）**

---

## 任务 5：改造路由与兼容入口文件

**文件：**
- 修改：`src/router.tsx`
- 修改：`src/pages/external/Miniprogram.tsx`

- [ ] **步骤 1：/miniprogram 变为子路由**
  - index：`MiniprogramIndexRedirect`（根据 Context 登录态重定向到 login/home）
  - children：login/home/archive/new/profile/notifications/...
- [ ] **步骤 2：external/Miniprogram.tsx 改为 re-export 新 layout**

---

## 任务 6：验证

- [ ] **步骤 1：运行构建**
  - 运行：`npm run build`
  - 预期：PASS
- [ ] **步骤 2：手动验证关键路径**
  - `/#/miniprogram`：未登录跳 login；登录后跳 home
  - `/#/miniprogram/home`：可进入首页；右侧可点击“新增档案”
  - `/#/miniprogram/archive/new?storeId=默认门店`：门店展示不可编辑；提交成功后回 home 并 toast

