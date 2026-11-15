import assert from "node:assert/strict";
import test from "node:test";
import {
  getMovementScenarioKey,
  getMovementLabel,
  getMovementScenarioOptions,
  getMovementSourceOptions,
  getMovementTone,
  inferMovementSource,
} from "../src/pages/inventory/movementConfig.ts";

test("入库和出库场景具有明确名称和互不重复的颜色", () => {
  const scenarios = [...getMovementScenarioOptions("入库"), ...getMovementScenarioOptions("出库")];
  const labels = scenarios.map((scenario) => scenario.label);
  const colors = scenarios.map((scenario) => scenario.tone);

  assert.deepEqual(labels, [
    "采购入库",
    "线上商城 · 退货入库",
    "线下门店 · 退货入库",
    "盘盈入库",
    "线上商城 · 销售出库",
    "线下门店 · 销售出库",
    "采购退货出库",
    "报损出库",
  ]);
  assert.equal(new Set(colors).size, scenarios.length);
});

test("线上和线下同类型单据使用不同场景键", () => {
  assert.notEqual(
    getMovementScenarioKey("销售出库", "线上商城"),
    getMovementScenarioKey("销售出库", "线下门店")
  );
  assert.notEqual(
    getMovementScenarioKey("退货入库", "线上商城"),
    getMovementScenarioKey("退货入库", "线下门店")
  );
});

test("仅销售与客户退货需要选择线上或线下来源", () => {
  assert.deepEqual(getMovementSourceOptions("销售出库"), ["线上商城", "线下门店"]);
  assert.deepEqual(getMovementSourceOptions("退货入库"), ["线上商城", "线下门店"]);
  assert.deepEqual(getMovementSourceOptions("采购入库"), ["供应商"]);
  assert.deepEqual(getMovementSourceOptions("盘盈入库"), ["库存调整"]);
  assert.deepEqual(getMovementSourceOptions("报损出库"), ["库存调整"]);
});

test("历史单据来源依据文本推断，信息不足时保留待确认", () => {
  assert.equal(inferMovementSource("销售出库", "线上商城订单 SO-2026-01", "商城订单发货"), "线上商城");
  assert.equal(inferMovementSource("退货入库", "线下门店退货", ""), "线下门店");
  assert.equal(inferMovementSource("销售出库", "惟爱上海门店 · 销售单 LS-2026-01", ""), "线下门店");
  assert.equal(inferMovementSource("销售出库", "华北旗舰店订单 SO-2026-02", ""), "来源待确认");
  assert.equal(inferMovementSource("采购入库", "上海美尼康光学有限公司", ""), "供应商");
  assert.equal(inferMovementSource("报损出库", "内部调整", ""), "库存调整");
});

test("来源无法判断时展示待确认名称和中性色", () => {
  assert.equal(getMovementLabel("销售出库", "来源待确认"), "销售出库 · 来源待确认");
  assert.equal(getMovementTone("销售出库", "来源待确认"), "neutral");
});
