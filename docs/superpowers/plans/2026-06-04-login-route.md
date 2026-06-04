# Login 路由与前端鉴权 实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 为门店管理系统新增 `/login` 登录页与前端鉴权（localStorage），未登录时访问业务路由自动跳转登录；登录成功进入系统；支持退出登录。

**架构：** 使用 `localStorage` 存储登录标记；在 `react-router` data router 的 `loader` 中做重定向守卫；登录页不套用 `MainLayout`，其余业务路由统一守卫。

**技术栈：** React 19 + react-router 7（createHashRouter）+ Tailwind CSS

---

## 文件结构

**创建：**
- `src/lib/auth.ts`：登录标记读写与守卫 loader
- `src/pages/auth/Login.tsx`：登录页面（无注册）

**修改：**
- `src/router.tsx`：新增 `/login` 路由、为 `MainLayout` 根路由增加鉴权 loader
- `src/components/Header.tsx`：增加退出登录入口

---

### 任务 1：实现 auth 工具与 loader

**文件：**
- 创建：`src/lib/auth.ts`

- [ ] **步骤 1：实现存储函数**

```ts
const AUTH_KEY = 'weiai_auth';

export function isAuthed(): boolean {
  return localStorage.getItem(AUTH_KEY) === '1';
}

export function setAuthed(): void {
  localStorage.setItem(AUTH_KEY, '1');
}

export function clearAuthed(): void {
  localStorage.removeItem(AUTH_KEY);
}
```

- [ ] **步骤 2：实现 router loader**

```ts
import { redirect } from 'react-router';

export function requireAuthLoader() {
  if (!isAuthed()) throw redirect('/login');
  return null;
}

export function redirectIfAuthedLoader() {
  if (isAuthed()) throw redirect('/');
  return null;
}
```

- [ ] **步骤 3：类型检查**

运行：`npm run build`
预期：exit code 0

---

### 任务 2：新增 /login 页面（账号密码）

**文件：**
- 创建：`src/pages/auth/Login.tsx`

- [ ] **步骤 1：实现页面结构**

要求：
- 左侧品牌信息区（蓝色渐变背景 + 卡片装饰）
- 右侧表单：账号、密码、登录按钮
- 不包含注册相关入口

- [ ] **步骤 2：实现登录行为**

逻辑：
- 输入框受控
- 点击登录：写入 localStorage（调用 `setAuthed()`）并跳转 `/`

---

### 任务 3：接入路由守卫

**文件：**
- 修改：`src/router.tsx`

- [ ] **步骤 1：新增 /login 路由**

```tsx
{
  path: '/login',
  element: <Login />,
  loader: redirectIfAuthedLoader,
}
```

- [ ] **步骤 2：为 MainLayout 根路由增加 loader**

```tsx
{
  path: '/',
  element: <MainLayout />,
  loader: requireAuthLoader,
  children: [...]
}
```

- [ ] **步骤 3：验证未登录跳转**

手动验证：
- 清空 localStorage 后访问 `/#/`，应自动跳转 `/#/login`

---

### 任务 4：Header 增加退出登录

**文件：**
- 修改：`src/components/Header.tsx`

- [ ] **步骤 1：增加退出按钮入口**

行为：
- 点击退出：调用 `clearAuthed()`，再跳转到 `/login`

- [ ] **步骤 2：验证**

手动验证：
- 登录后右上角可退出，退出后回到登录页

---

### 任务 5：整体回归验证

- [ ] **步骤 1：构建验证**

运行：`npm run build`
预期：exit code 0

- [ ] **步骤 2：关键路径验证**

1. `/login` 登录成功进入 `/`
2. 未登录访问任意业务路由会跳转 `/login`
3. 已登录访问 `/login` 会跳转 `/`
4. 退出登录后不可再访问业务路由

