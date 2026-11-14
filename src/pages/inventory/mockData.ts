// 库存管理（ERP）· 数据层
//
// 这是「商品中心」的唯一数据来源，采用 SPU + SKU 两层模型：
// - ErpProduct（SPU）：商品档案，承载注册证 / 生产许可证 / 有效期 / 资质图片等「注册证级」信息。
// - ErpSku：库存与价格的最小单元，规格由「类目规格属性模板」的属性组合而成。
// - 库存按仓库拆分（stockByWarehouse），SKU 总库存为各仓之和。
// 商城管理通过 skuId 只读引用本模块，不复制、不覆盖。

export type ProductCategory = "医疗器械类" | "视功能训练类" | "周边产品类";

export const productCategoryOptions: ProductCategory[] = ["医疗器械类", "视功能训练类", "周边产品类"];

/** 类目规格属性模板：定义该类目下可用的规格属性名，商品从中勾选启用的属性 */
export const categorySpecTemplates: Record<ProductCategory, string[]> = {
  医疗器械类: ["度数", "片型", "直径", "型号"],
  视功能训练类: ["型号", "版本", "规格"],
  周边产品类: ["型号", "容量", "包装规格"],
};

/** 仓库 */
export type Warehouse = {
  id: string;
  name: string;
  address: string;
  /** 是否为默认仓库（默认仓库不可删除） */
  isDefault: boolean;
  createdAt: string;
};

export const initialWarehouses: Warehouse[] = [
  { id: "WH-001", name: "惟爱上海仓库", address: "上海市黄浦区中山南路 88 号 3 号楼 B1 库区", isDefault: true, createdAt: "2026-01-05" },
  { id: "WH-002", name: "惟爱北京仓库", address: "北京市朝阳区望京 SOHO T3 座 B2 库区", isDefault: false, createdAt: "2026-02-18" },
  { id: "WH-003", name: "惟爱广州仓库", address: "广州市天河区珠江新城花城大道 66 号 B1 库区", isDefault: false, createdAt: "2026-03-10" },
];

/** SKU：库存与价格的最小单元 */
export type ErpSku = {
  skuId: string;
  /** 所属商品（SPU） */
  spuId: string;
  /** 规格属性取值，key 为属性名（取自商品启用的规格属性），value 为规格值 */
  specValues: Record<string, string>;
  /** 商品条码 */
  barcode: string;
  /** SKU 图片（单张，data URL） */
  image: string;
  /** 成本价（ERP 独占，商城不展示） */
  costPrice: number;
  /** 建议零售价（ERP 价格体系） */
  retailPrice: number;
  status: "启用" | "停用";
  /** 库存数量（按仓库拆分，key 为仓库 id） */
  stockByWarehouse: Record<string, number>;
  createdAt: string;
};

/** 商品（SPU）：注册证 / 资质层面的唯一主体 */
export type ErpProduct = {
  spuId: string;
  name: string;
  /** 生产厂家 */
  manufacturer: string;
  category: ProductCategory;
  /** 有效期至（YYYY-MM-DD） */
  validityTo: string;
  /** 注册证 / 备案凭证编号 */
  registrationNo: string;
  /** 生产许可证 / 备案凭证编号 */
  productionLicenseNo: string;
  /** 商品说明书文件名 */
  manualName: string;
  /** 商品图片（多张，第一张作为封面） */
  images: string[];
  /** 注册证 / 备案凭证等资质图片（多张） */
  certificateImages: string[];
  /** 启用的规格属性（取自类目模板，数组顺序即展示顺序） */
  specAttributes: string[];
  createdAt: string;
};

/** 商品档案（模拟，后续由 ERP 模块提供） */
export const erpProducts: ErpProduct[] = [
  { spuId: "SPU-1001", name: "角膜塑形镜（夜戴型）", manufacturer: "欧普康视科技股份有限公司", category: "医疗器械类", validityTo: "2027-03-31", registrationNo: "国械注准20163220147", productionLicenseNo: "皖食药监械生产许20160023", manualName: "角膜塑形镜用户说明书.pdf", images: [], certificateImages: [], specAttributes: ["度数", "片型"], createdAt: "2026-01-05" },
  { spuId: "SPU-1002", name: "RGP 硬性透氧角膜接触镜", manufacturer: "上海美尼康光学有限公司", category: "医疗器械类", validityTo: "2026-12-15", registrationNo: "国械注准20173160258", productionLicenseNo: "沪食药监械生产许20180066", manualName: "RGP镜片护理说明.pdf", images: [], certificateImages: [], specAttributes: ["度数", "直径"], createdAt: "2026-01-05" },
  { spuId: "SPU-1003", name: "视功能训练仪（家用版）", manufacturer: "杭州视康医疗设备有限公司", category: "视功能训练类", validityTo: "2027-06-30", registrationNo: "浙械注准20202160412", productionLicenseNo: "浙食药监械生产许20190118", manualName: "训练仪操作手册.pdf", images: [], certificateImages: [], specAttributes: ["型号"], createdAt: "2026-01-05" },
  { spuId: "SPU-1004", name: "翻转拍调节训练器", manufacturer: "宁波视佳光学器材厂", category: "视功能训练类", validityTo: "2028-01-20", registrationNo: "浙械备20190221号", productionLicenseNo: "浙食药监械生产许20200312", manualName: "翻转拍使用指南.pdf", images: [], certificateImages: [], specAttributes: ["型号"], createdAt: "2026-01-05" },
  { spuId: "SPU-1005", name: "双眼平衡训练仪", manufacturer: "杭州视康医疗设备有限公司", category: "视功能训练类", validityTo: "2027-09-10", registrationNo: "浙械注准20212160567", productionLicenseNo: "浙食药监械生产许20190118", manualName: "双眼平衡训练说明.pdf", images: [], certificateImages: [], specAttributes: ["型号"], createdAt: "2026-01-05" },
  { spuId: "SPU-1006", name: "医用冷敷眼罩", manufacturer: "苏州康贝医疗器械有限公司", category: "周边产品类", validityTo: "2026-11-30", registrationNo: "苏械备20210188号", productionLicenseNo: "苏食药监械生产许20200521", manualName: "冷敷眼罩说明.pdf", images: [], certificateImages: [], specAttributes: ["包装规格"], createdAt: "2026-01-05" },
  { spuId: "SPU-1007", name: "叶黄素酯压片糖果（儿童型）", manufacturer: "广东健之源食品有限公司", category: "周边产品类", validityTo: "2026-10-01", registrationNo: "SC12744010100234", productionLicenseNo: "粤食药监食生产许20190567", manualName: "产品标签说明.pdf", images: [], certificateImages: [], specAttributes: ["包装规格"], createdAt: "2026-01-05" },
  { spuId: "SPU-1008", name: "角膜塑形镜护理液套装", manufacturer: "北京博士伦眼睛护理产品有限公司", category: "周边产品类", validityTo: "2027-02-28", registrationNo: "京械注准20162220413", productionLicenseNo: "京食药监械生产许20150078", manualName: "护理液使用说明.pdf", images: [], certificateImages: [], specAttributes: ["容量"], createdAt: "2026-01-05" },
  { spuId: "SPU-1009", name: "弱视遮盖贴", manufacturer: "南京视宝医疗器械有限公司", category: "视功能训练类", validityTo: "2027-05-18", registrationNo: "苏械备20220136号", productionLicenseNo: "苏食药监械生产许20210744", manualName: "遮盖贴使用说明.pdf", images: [], certificateImages: [], specAttributes: ["型号"], createdAt: "2026-01-05" },
  { spuId: "SPU-1010", name: "智能验光仪（家用版）", manufacturer: "深圳视界智能科技有限公司", category: "医疗器械类", validityTo: "2027-12-31", registrationNo: "国械注准20223160488", productionLicenseNo: "粤食药监械生产许20220039", manualName: "智能验光仪说明书.pdf", images: [], certificateImages: [], specAttributes: ["型号"], createdAt: "2026-01-05" },
  { spuId: "SPU-1011", name: "斜视训练集合卡", manufacturer: "南京视宝医疗器械有限公司", category: "周边产品类", validityTo: "2028-04-15", registrationNo: "苏械备20220318号", productionLicenseNo: "苏食药监械生产许20210744", manualName: "集合卡训练说明.pdf", images: [], certificateImages: [], specAttributes: ["包装规格"], createdAt: "2026-01-05" },
  { spuId: "SPU-1012", name: "儿童防蓝光平光镜", manufacturer: "厦门明视光学有限公司", category: "周边产品类", validityTo: "2028-08-01", registrationNo: "闽械备20210654号", productionLicenseNo: "闽食药监械生产许20200321", manualName: "防蓝光镜说明.pdf", images: [], certificateImages: [], specAttributes: ["型号"], createdAt: "2026-01-05" },
];

/** SKU 明细（模拟） */
export const erpSkus: ErpSku[] = [
  { skuId: "SKU-1001-01", spuId: "SPU-1001", specValues: { 度数: "-1.00D", 片型: "标准片" }, barcode: "6901001001011", costPrice: 1800, retailPrice: 3980, status: "启用", image: "", stockByWarehouse: { "WH-001": 10, "WH-002": 6, "WH-003": 4 }, createdAt: "2026-01-05" },
  { skuId: "SKU-1001-02", spuId: "SPU-1001", specValues: { 度数: "-2.00D", 片型: "标准片" }, barcode: "6901001001012", costPrice: 1800, retailPrice: 3980, status: "启用", image: "", stockByWarehouse: { "WH-001": 15, "WH-002": 9, "WH-003": 6 }, createdAt: "2026-01-05" },
  { skuId: "SKU-1001-03", spuId: "SPU-1001", specValues: { 度数: "-3.00D", 片型: "散光片" }, barcode: "6901001001013", costPrice: 1900, retailPrice: 4280, status: "启用", image: "", stockByWarehouse: { "WH-001": 18, "WH-002": 11, "WH-003": 7 }, createdAt: "2026-01-05" },
  { skuId: "SKU-1002-01", spuId: "SPU-1002", specValues: { 度数: "-1.50D", 直径: "9.2mm" }, barcode: "6901002002011", costPrice: 900, retailPrice: 1980, status: "启用", image: "", stockByWarehouse: { "WH-001": 5, "WH-002": 3, "WH-003": 2 }, createdAt: "2026-01-05" },
  { skuId: "SKU-1002-02", spuId: "SPU-1002", specValues: { 度数: "-3.00D", 直径: "9.2mm" }, barcode: "6901002002012", costPrice: 920, retailPrice: 2080, status: "启用", image: "", stockByWarehouse: { "WH-001": 7, "WH-002": 4, "WH-003": 3 }, createdAt: "2026-01-05" },
  { skuId: "SKU-1003-01", spuId: "SPU-1003", specValues: { 型号: "VT-300 家用" }, barcode: "6901003003011", costPrice: 1200, retailPrice: 2680, status: "启用", image: "", stockByWarehouse: { "WH-001": 23, "WH-002": 14, "WH-003": 8 }, createdAt: "2026-01-05" },
  { skuId: "SKU-1004-01", spuId: "SPU-1004", specValues: { 型号: "±2.00D 一体式" }, barcode: "6901004004011", costPrice: 45, retailPrice: 128, status: "启用", image: "", stockByWarehouse: { "WH-001": 105, "WH-002": 63, "WH-003": 42 }, createdAt: "2026-01-05" },
  { skuId: "SKU-1005-01", spuId: "SPU-1005", specValues: { 型号: "BE-200" }, barcode: "6901005005011", costPrice: 680, retailPrice: 1580, status: "启用", image: "", stockByWarehouse: { "WH-001": 16, "WH-002": 10, "WH-003": 6 }, createdAt: "2026-01-05" },
  { skuId: "SKU-1006-01", spuId: "SPU-1006", specValues: { 包装规格: "成人款 2片装" }, barcode: "6901006006011", costPrice: 12, retailPrice: 39, status: "启用", image: "", stockByWarehouse: { "WH-001": 150, "WH-002": 90, "WH-003": 60 }, createdAt: "2026-01-05" },
  { skuId: "SKU-1006-02", spuId: "SPU-1006", specValues: { 包装规格: "儿童款 2片装" }, barcode: "6901006006012", costPrice: 12, retailPrice: 39, status: "启用", image: "", stockByWarehouse: { "WH-001": 100, "WH-002": 60, "WH-003": 40 }, createdAt: "2026-01-05" },
  { skuId: "SKU-1007-01", spuId: "SPU-1007", specValues: { 包装规格: "0.5g×60片" }, barcode: "6901007007011", costPrice: 28, retailPrice: 88, status: "启用", image: "", stockByWarehouse: { "WH-001": 160, "WH-002": 96, "WH-003": 64 }, createdAt: "2026-01-05" },
  { skuId: "SKU-1008-01", spuId: "SPU-1008", specValues: { 容量: "360ml 双瓶装" }, barcode: "6901008008011", costPrice: 55, retailPrice: 128, status: "启用", image: "", stockByWarehouse: { "WH-001": 90, "WH-002": 54, "WH-003": 36 }, createdAt: "2026-01-05" },
  { skuId: "SKU-1009-01", spuId: "SPU-1009", specValues: { 型号: "儿童款 50片" }, barcode: "6901009009011", costPrice: 8, retailPrice: 26, status: "启用", image: "", stockByWarehouse: { "WH-001": 130, "WH-002": 78, "WH-003": 52 }, createdAt: "2026-01-05" },
  { skuId: "SKU-1010-01", spuId: "SPU-1010", specValues: { 型号: "AR-1 自动验光" }, barcode: "6901010010011", costPrice: 2600, retailPrice: 5980, status: "启用", image: "", stockByWarehouse: { "WH-001": 6, "WH-002": 4, "WH-003": 2 }, createdAt: "2026-01-05" },
  // 以下两个商品为 ERP 已有、商城尚未上架，用于「从 ERP 商品库上架」
  { skuId: "SKU-1011-01", spuId: "SPU-1011", specValues: { 包装规格: "标准套 30张" }, barcode: "6901011011011", costPrice: 22, retailPrice: 59, status: "启用", image: "", stockByWarehouse: { "WH-001": 75, "WH-002": 45, "WH-003": 30 }, createdAt: "2026-01-05" },
  { skuId: "SKU-1012-01", spuId: "SPU-1012", specValues: { 型号: "JM-07 多色" }, barcode: "6901012012011", costPrice: 36, retailPrice: 99, status: "启用", image: "", stockByWarehouse: { "WH-001": 44, "WH-002": 27, "WH-003": 17 }, createdAt: "2026-01-05" },
];

export const erpProductMap: Record<string, ErpProduct> = Object.fromEntries(erpProducts.map((item) => [item.spuId, item]));

export const erpSkuMap: Record<string, ErpSku> = Object.fromEntries(erpSkus.map((item) => [item.skuId, item]));

/** 某商品（SPU）下的全部 SKU */
export function getSkusOfSpu(spuId: string) {
  return erpSkus.filter((sku) => sku.spuId === spuId);
}

/** 某 SKU 的总库存（各仓之和） */
export function getSkuTotalStock(sku: ErpSku) {
  return Object.values(sku.stockByWarehouse).reduce((sum, value) => sum + value, 0);
}

/** 某 SKU 在指定仓库的库存 */
export function getSkuWarehouseStock(sku: ErpSku, warehouseId: string) {
  return sku.stockByWarehouse[warehouseId] ?? 0;
}

/** 某商品（SPU）的总库存 = 其下所有 SKU 之和 */
export function getSpuTotalStock(spuId: string) {
  return getSkusOfSpu(spuId).reduce((sum, sku) => sum + getSkuTotalStock(sku), 0);
}

/** 某商品（SPU）在指定仓库的库存 = 其下所有 SKU 之和 */
export function getSpuWarehouseStock(spuId: string, warehouseId: string) {
  return getSkusOfSpu(spuId).reduce((sum, sku) => sum + getSkuWarehouseStock(sku, warehouseId), 0);
}

/** SKU 规格文本，如「度数 -1.00D / 片型 标准片」 */
export function getSkuSpecText(sku: ErpSku, attributes?: string[]) {
  const attrs = attributes ?? erpProductMap[sku.spuId]?.specAttributes ?? Object.keys(sku.specValues);
  return attrs.map((attr) => `${attr} ${sku.specValues[attr] ?? "—"}`).join(" / ");
}

/** 有效期预警：返回距今天数与预警级别 */
export { getValidityWarn } from "../../lib/validity";

// ─────────────────────────────────────────────────────────────
// 出入库（库存流水）
//
// 库存数量只能通过出入库单据变动，商品档案本身不承载库存增减：
// - 入库单：采购到货 / 客户退货 / 盘盈  → stockByWarehouse 增加
// - 出库单：订单发货 / 采购退货 / 报损  → stockByWarehouse 减少
// 商城可上架上限 = 店铺绑定仓库的 SKU 库存合计，因此出入库会间接影响商城。
// ─────────────────────────────────────────────────────────────

/** 出入库方向 */
export type MovementDirection = "入库" | "出库";

/** 出入库类型（按方向归类） */
export type MovementType =
  | "采购入库"
  | "退货入库"
  | "盘盈入库"
  | "销售出库"
  | "采购退货出库"
  | "报损出库";

export const movementTypesByDirection: Record<MovementDirection, MovementType[]> = {
  入库: ["采购入库", "退货入库", "盘盈入库"],
  出库: ["销售出库", "采购退货出库", "报损出库"],
};

export type MovementStatus = "草稿" | "已确认" | "已作废";

/** 出入库单据明细行 */
export type StockMovementItem = {
  skuId: string;
  quantity: number;
  unitPrice: number;
};

/** 出入库单据：库存变动的唯一凭证 */
export type StockMovement = {
  id: string;
  direction: MovementDirection;
  type: MovementType;
  warehouseId: string;
  /** 往来单位：入库为供应商，出库为领用部门 / 客户 */
  partner: string;
  operator: string;
  remark: string;
  status: MovementStatus;
  createdAt: string;
  items: StockMovementItem[];
};

/** 单据总数量 */
export function getMovementTotalQty(movement: StockMovement) {
  return movement.items.reduce((sum, item) => sum + item.quantity, 0);
}

/** 单据总金额 */
export function getMovementTotalAmount(movement: StockMovement) {
  return movement.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}

/** 出入库单据（模拟） */
export const initialStockMovements: StockMovement[] = [
  {
    id: "RK-20261102-001",
    direction: "入库",
    type: "采购入库",
    warehouseId: "WH-001",
    partner: "上海美尼康光学有限公司",
    operator: "仓管员 · 李伟",
    remark: "RGP 镜片常规补货",
    status: "已确认",
    createdAt: "2026-11-02",
    items: [
      { skuId: "SKU-1002-01", quantity: 20, unitPrice: 900 },
      { skuId: "SKU-1002-02", quantity: 20, unitPrice: 920 },
    ],
  },
  {
    id: "RK-20261105-001",
    direction: "入库",
    type: "采购入库",
    warehouseId: "WH-001",
    partner: "杭州视康医疗设备有限公司",
    operator: "仓管员 · 李伟",
    remark: "视功能训练设备到货",
    status: "已确认",
    createdAt: "2026-11-05",
    items: [
      { skuId: "SKU-1003-01", quantity: 30, unitPrice: 1200 },
      { skuId: "SKU-1005-01", quantity: 20, unitPrice: 680 },
    ],
  },
  {
    id: "RK-20261108-001",
    direction: "入库",
    type: "退货入库",
    warehouseId: "WH-001",
    partner: "线上商城退货 · 订单 SO-20261028-019",
    operator: "售后专员 · 王芳",
    remark: "客户 7 天无理由退货，包装完好",
    status: "已确认",
    createdAt: "2026-11-08",
    items: [{ skuId: "SKU-1006-01", quantity: 2, unitPrice: 12 }],
  },
  {
    id: "RK-20261112-001",
    direction: "入库",
    type: "盘盈入库",
    warehouseId: "WH-001",
    partner: "内部调整",
    operator: "仓管员 · 李伟",
    remark: "月度盘点差异，实物多于账面",
    status: "草稿",
    createdAt: "2026-11-12",
    items: [{ skuId: "SKU-1009-01", quantity: 6, unitPrice: 8 }],
  },
  {
    id: "CK-20261103-001",
    direction: "出库",
    type: "销售出库",
    warehouseId: "WH-001",
    partner: "线上商城订单 SO-20261103-007",
    operator: "仓管员 · 张敏",
    remark: "商城订单发货，顺丰 SF1234567890",
    status: "已确认",
    createdAt: "2026-11-03",
    items: [
      { skuId: "SKU-1001-01", quantity: 2, unitPrice: 1800 },
      { skuId: "SKU-1008-01", quantity: 2, unitPrice: 55 },
    ],
  },
  {
    id: "CK-20261109-001",
    direction: "出库",
    type: "销售出库",
    warehouseId: "WH-001",
    partner: "线上商城订单 SO-20261109-012",
    operator: "仓管员 · 张敏",
    remark: "商城订单发货，京东 JD9876543210",
    status: "已确认",
    createdAt: "2026-11-09",
    items: [{ skuId: "SKU-1006-02", quantity: 10, unitPrice: 12 }],
  },
  {
    id: "CK-20261110-001",
    direction: "出库",
    type: "报损出库",
    warehouseId: "WH-001",
    partner: "内部调整",
    operator: "仓管员 · 李伟",
    remark: "冷敷眼罩外包装破损，报废处理",
    status: "已确认",
    createdAt: "2026-11-10",
    items: [{ skuId: "SKU-1006-01", quantity: 5, unitPrice: 12 }],
  },
  {
    id: "RK-20261106-002",
    direction: "入库",
    type: "采购入库",
    warehouseId: "WH-002",
    partner: "上海美尼康光学有限公司",
    operator: "仓管员 · 赵磊",
    remark: "华北仓镜片补货",
    status: "已确认",
    createdAt: "2026-11-06",
    items: [
      { skuId: "SKU-1001-01", quantity: 10, unitPrice: 1800 },
      { skuId: "SKU-1001-02", quantity: 12, unitPrice: 1800 },
    ],
  },
  {
    id: "CK-20261108-002",
    direction: "出库",
    type: "销售出库",
    warehouseId: "WH-002",
    partner: "华北旗舰店订单 SO-20261108-003",
    operator: "仓管员 · 赵磊",
    remark: "华北旗舰店发货，顺丰 SF8888999900",
    status: "已确认",
    createdAt: "2026-11-08",
    items: [{ skuId: "SKU-1001-02", quantity: 3, unitPrice: 1800 }],
  },
  {
    id: "RK-20261109-003",
    direction: "入库",
    type: "采购入库",
    warehouseId: "WH-003",
    partner: "杭州视康医疗设备有限公司",
    operator: "仓管员 · 陈静",
    remark: "华南仓护理用品补货",
    status: "已确认",
    createdAt: "2026-11-09",
    items: [
      { skuId: "SKU-1007-01", quantity: 80, unitPrice: 28 },
      { skuId: "SKU-1012-01", quantity: 20, unitPrice: 36 },
    ],
  },
  {
    id: "CK-20261111-003",
    direction: "出库",
    type: "销售出库",
    warehouseId: "WH-003",
    partner: "华南旗舰店订单 SO-20261111-009",
    operator: "仓管员 · 陈静",
    remark: "华南旗舰店发货，京东 JD1111222233",
    status: "已确认",
    createdAt: "2026-11-11",
    items: [{ skuId: "SKU-1007-01", quantity: 16, unitPrice: 28 }],
  },
];

/** 按方向取单据 */
export function getMovementsByDirection(direction: MovementDirection) {
  return initialStockMovements.filter((movement) => movement.direction === direction);
}

