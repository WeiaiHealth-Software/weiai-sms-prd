# 出入库业务分类与颜色实现计划

> **面向 AI 代理的工作者：** 按任务顺序实现并运行每步验证。用户已批准规格，直接在当前工作区内联执行；不创建提交。

**目标：** 让入库/出库单据按业务类型和业务来源展示准确场景、独立颜色，并可按场景筛选和导出。

**架构：** 新增纯配置模块集中定义合法的类型-来源组合、显示名称、颜色和每个方向可用选项。单据数据增加来源字段；表单、列表、详情和 CSV 都复用同一配置模块。历史数据推导来源，无法可靠判断的记录使用「来源待确认」而不误分类。

**技术栈：** React、TypeScript、Tailwind CSS、Node.js 内置 `node:test`（Node 22 原生 TypeScript 类型擦除）。

---

## 文件职责

- 创建 `src/pages/inventory/movementConfig.ts`：合法场景、来源选项、名称和色调映射；保持纯函数，供页面和测试共同使用。
- 修改 `src/pages/inventory/mockData.ts`：扩展类型定义，为 mock 单据补来源。
- 修改 `src/pages/inventory/StockMovementList.tsx`：来源字段表单、动态往来单位提示、旧单据来源归一化、场景筛选、颜色标签、详情及 CSV。
- 创建 `tests/stockMovement.test.mjs`：验证所有组合标签/颜色、筛选键与历史数据来源识别。
- 修改 `package.json`：添加 `npm test` 脚本，运行 Node 内置测试。
- 设计文档 `docs/superpowers/specs/2026-11-15-stock-movement-classification-design.md` 已经记录本功能的批准规格。

## 任务 1：测试场景配置

- [x] 编写 `tests/stockMovement.test.mjs`，导入 `../src/pages/inventory/movementConfig.ts`。
- [x] 覆盖八种合法场景的完整中文名称和各自不同的色调；覆盖 `getMovementScenarioKey(type, source)` 能区分线上/线下销售与退货。
- [x] 覆盖方向选项限制：入库只提供采购、客户退货、盘盈；出库只提供销售、供应商退货、报损。
- [x] 运行 `node --experimental-strip-types --test tests/stockMovement.test.mjs`，确认因模块/导出尚不存在而失败。
- [x] 实现最小的纯数据配置与导出，让测试通过。
- [x] 添加 package script `"test": "node --experimental-strip-types --test"`，运行 `npm test` 验证通过。

## 任务 2：单据来源建模与历史兼容

**文件：** 修改 `src/pages/inventory/mockData.ts`。

- [x] 为单据增加 `source` 字段；类型用固定业务原因，来源限定为 `线上商城 | 线下门店 | 供应商 | 库存调整 | 来源待确认`。
- [x] 在每条初始单据中设置来源：按供应商/商城订单/内部调整文本准确识别；原「华北/华南旗舰店订单」若不足以判断线上/线下，标成「来源待确认」。
- [x] 保留库存方向和数量汇总 helper 行为。
- [x] 运行 `npx tsc -b` 和 `npm test`。

## 任务 3：建单表单和类型筛选

**文件：** 修改 `src/pages/inventory/StockMovementList.tsx`。

- [x] Draft 增加来源字段。销售出库和退货入库提供线上/线下来源选项；其余类型使用固定来源。
- [x] 切换业务类型时将来源归一到该类型合法默认值；禁止产生非法类型-来源组合。
- [x] 根据场景更新往来单位标签和 placeholder；线上场景提示订单号，门店场景提示门店/销售单，供应商和内部调整沿用对应提示。
- [x] 类型筛选选项改为完整场景 key/label，筛选同时匹配类型与来源。
- [x] 运行 `npm test`、`npx tsc -b` 和针对性 ESLint。

## 任务 4：统一标签颜色、详情和导出

**文件：** 修改 `src/pages/inventory/StockMovementList.tsx`。

- [x] 列表类型标签使用场景配置的颜色；颜色在八种场景之间各不相同。
- [x] 单据详情显示场景名与业务来源；历史来源待确认时明确显示待确认。
- [x] CSV 增加「业务来源」列，并保留可读的组合「类型」列。
- [x] 通过测试、TypeScript、ESLint 和 `npm run build` 验证；检查未误改其他工作区文件。

## 验收

- `npm test`：场景名称、唯一颜色、方向选项、场景键和来源识别测试通过。
- `npx tsc -b`：无类型错误。
- `npx eslint src/pages/inventory/movementConfig.ts src/pages/inventory/mockData.ts src/pages/inventory/StockMovementList.tsx tests/stockMovement.test.mjs`：无错误。
- `npm run build`：生产构建通过。
