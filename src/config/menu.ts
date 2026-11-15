import {
  SquaresFour,
  Storefront,
  ChartBar,
  Users,
  Package,
  Receipt,
  ShoppingBag,
  Palette,
  Gear,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import type { RoleId } from "../lib/rbac";

/** 全部角色 */
export const ALL_ROLES: RoleId[] = [
  "developer",
  "super_admin",
  "store_manager",
  "store_staff",
  "optometrist",
  "mall_manager",
  "mall_entry",
];

/** 跨门店角色：开发者与超级管理员 */
export const GLOBAL_ADMIN_ROLES: RoleId[] = ["developer", "super_admin"];

/** 门店管理：管理员与门店店长 */
export const STORE_MGMT_ROLES: RoleId[] = ["developer", "super_admin", "store_manager"];

/** 客户档案：门店侧角色 */
export const CRM_ROLES: RoleId[] = ["developer", "super_admin", "store_manager", "store_staff", "optometrist"];

/** 库存管理：门店店长及管理员（仓库配置仅管理员） */
export const INVENTORY_ROLES: RoleId[] = ["developer", "super_admin", "store_manager"];

/** 商城管理：商城角色与管理员 */
export const MALL_ROLES: RoleId[] = ["developer", "super_admin", "mall_manager", "mall_entry"];

/** 商城管理（含资金与配置，录入人员不可见） */
export const MALL_MANAGER_ROLES: RoleId[] = ["developer", "super_admin", "mall_manager"];

/** 单据收银：门店店长与店员 */
export const POS_ROLES: RoleId[] = ["developer", "super_admin", "store_manager", "store_staff"];

/** 系统管理：管理员与门店店长（权限与设置仅管理员） */
export const SYSTEM_ROLES: RoleId[] = ["developer", "super_admin", "store_manager"];

export interface MenuSubItem {
  id: string;
  label: string;
  path: string;
  features: string[];
  /** 可见该菜单的角色 */
  roles: RoleId[];
}

export interface MenuItem {
  id: string;
  icon: Icon;
  label: string;
  path: string;
  roles: RoleId[];
  subs: MenuSubItem[];
}

export const menuConfig: MenuItem[] = [
  {
    id: "dashboard",
    icon: SquaresFour,
    label: "仪表盘",
    path: "/",
    roles: ALL_ROLES,
    subs: [],
  },
  {
    id: "store_mgmt",
    icon: Storefront,
    label: "门店管理",
    path: "/store",
    roles: STORE_MGMT_ROLES,
    subs: [
      {
        id: "store_list",
        label: "门店列表",
        path: "/store/list",
        roles: GLOBAL_ADMIN_ROLES,
        features: ["全门店 KPI 总览与对比", "门店状态与经营概况", "新建门店并绑定共享仓库", "进入指定门店工作区"],
      },
      {
        id: "doctor_mgmt",
        label: "人员管理",
        path: "/store/personnel",
        roles: STORE_MGMT_ROLES,
        features: ["医生档案维护 (职称/专业)", "医生账号权限设置", "业绩指标设定", "医生个人简介配置"],
      },
      {
        id: "room_mgmt",
        label: "诊室管理",
        path: "/store/room",
        roles: STORE_MGMT_ROLES,
        features: ["诊室编号/名称设置", "诊室设备绑定 (综合验光仪等)", "诊室状态监控", "数字标牌设备绑定"],
      },
      {
        id: "scheduling",
        label: "门店排班",
        path: "/store/schedule",
        roles: ["developer", "super_admin", "store_manager", "optometrist"],
        features: ["可视化排班表 (日/周/月)", "排班关联诊室 (自动分配)", "临时调班/请假处理", "排班发布与通知"],
      },
    ],
  },
  {
    id: "analytics",
    icon: ChartBar,
    label: "数据分析",
    path: "/analytics",
    roles: STORE_MGMT_ROLES,
    subs: [
      {
        id: "financial",
        label: "财务报表",
        path: "/analytics/financial",
        roles: STORE_MGMT_ROLES,
        features: ["营收统计 (日/月/年)", "支付方式构成分析", "欠款/挂账统计", "退款率分析"],
      },
      {
        id: "sales",
        label: "销售分析（原CRM消费统计）",
        path: "/analytics/sales",
        roles: STORE_MGMT_ROLES,
        features: ["套餐销量排行榜", "镜片/镜架 SKU 动销率", "全局消费统计", "周期/类目统计"],
      },
      {
        id: "traffic",
        label: "客流分析",
        path: "/analytics/traffic",
        roles: STORE_MGMT_ROLES,
        features: ["新老客占比趋势", "渠道来源分析 (小程序/自然)", "到店转化漏斗", "客流高峰时段热力图"],
      },
      {
        id: "quality",
        label: "医疗质量",
        path: "/analytics/quality",
        roles: STORE_MGMT_ROLES,
        features: ["验光处方修改率", "复查异常率统计", "加工损耗率", "客户投诉/满意度分析"],
      },
    ],
  },
  {
    id: "crm",
    icon: Users,
    label: "客户档案(CRM)",
    path: "/crm",
    roles: CRM_ROLES,
    subs: [
      {
        id: "client_list",
        label: "档案管理",
        path: "/crm/client-list",
        roles: CRM_ROLES,
        features: ["全量客户查询", "高级筛选 (年龄/度数/来源)", "客户画像 360视图", "导出 Excel"],
      },
      {
        id: "booking",
        label: "预约管理",
        path: "/crm/booking",
        roles: CRM_ROLES,
        features: ["日历视图排班", "预约创建与修改", "医生/设备资源占用", "预约短信通知"],
      },
      {
        id: "followup",
        label: "回访管理",
        path: "/crm/followup",
        roles: CRM_ROLES,
        features: ["新增回访记录", "筛选条件（姓名、电话、日期、回访项目类型）", "复诊回访列表", "回访统计、复查完成率统计"],
      },
      {
        id: "optometry",
        label: "配镜管理",
        path: "/crm/optometry",
        roles: ["developer", "super_admin", "store_manager", "optometrist"],
        features: ["验光单据查询", "历史光度趋势对比", "处方打印", "视觉训练记录"],
      },
      {
        id: "member",
        label: "会员管理",
        path: "/crm/member",
        roles: ["developer", "super_admin", "store_manager", "store_staff"],
        features: ["会员等级规则配置", "积分兑换记录", "会员专属权益设置", "家庭档案绑定"],
      },
      {
        id: "consumer",
        label: "消费管理",
        path: "/crm/consumer",
        roles: ["developer", "super_admin", "store_manager", "store_staff"],
        features: ["消费记录列表（高级筛选）", "新增销售开单", "收费项目列表", "新增收费项目"],
      },
      {
        id: "tag_management",
        label: "标签管理",
        path: "/crm/tag-management",
        roles: STORE_MGMT_ROLES,
        features: ["标签类别筛选", "标签列表分页", "新增标签弹窗", "颜色与标签值配置"],
      },
    ],
  },
  {
    id: "inventory",
    icon: Package,
    label: "库存管理(ERP)",
    path: "/inventory",
    roles: INVENTORY_ROLES,
    subs: [
      {
        id: "product",
        label: "商品管理",
        path: "/inventory/product",
        roles: INVENTORY_ROLES,
        features: ["全量商品库查询（SPU + SKU 两层）", "商品档案列表（注册证/生产许可证/有效期/资质）", "按分类 / 仓库 / 效期状态（临期、已过期）筛选", "规格属性与 SKU 明细维护", "新增商品可登记初始入库库存", "价格体系维护"],
      },
      {
        id: "warehouse",
        label: "仓库管理",
        path: "/inventory/warehouse",
        roles: GLOBAL_ADMIN_ROLES,
        features: ["仓库列表维护", "新增/编辑仓库（名称、地址）", "默认仓库设置", "仓库库存分布（按 SKU 统计）"],
      },
      {
        id: "inbound",
        label: "入库管理",
        path: "/inventory/inbound",
        roles: INVENTORY_ROLES,
        features: ["采购入库", "线上商城 / 线下门店退货入库", "盘盈入库", "按业务场景筛选并导出", "入库确认后增加仓库库存"],
      },
      {
        id: "outbound",
        label: "出库管理",
        path: "/inventory/outbound",
        roles: INVENTORY_ROLES,
        features: ["线上商城销售出库", "线下门店销售出库", "采购退货出库 / 报损出库", "按业务场景筛选并导出", "出库数量校验仓库可用库存"],
      },
      {
        id: "category",
        label: "类目管理",
        path: "/inventory/category",
        roles: GLOBAL_ADMIN_ROLES,
        features: ["商品类目树维护", "新增/编辑类目", "类目属性模板配置", "类目关联品牌设置"],
      },
      {
        id: "transfer",
        label: "盘点调拨",
        path: "/inventory/transfer",
        roles: INVENTORY_ROLES,
        features: ["门店间调货申请", "月度/季度盘点录入", "盘盈盘亏调整", "库存流水日志"],
      },
    ],
  },
  {
    id: "mall",
    icon: ShoppingBag,
    label: "商城管理",
    path: "/mall",
    roles: MALL_ROLES,
    subs: [
      {
        id: "mall_shop",
        label: "店铺管理",
        path: "/mall/shop",
        roles: MALL_MANAGER_ROLES,
        features: ["商城店铺列表", "新增/编辑店铺", "默认店铺设置（惟爱线上商城）", "店铺启用/停用"],
      },
      {
        id: "mall_product",
        label: "商品管理",
        path: "/mall/product",
        roles: MALL_ROLES,
        features: ["商城商品列表（引用 ERP 商品主数据）", "上架/下架控制", "设置上架数量（按需分配，余量留给线下门店）", "商城售价设置", "展示图与详情页配置", "资质对外可见性配置", "商品排序"],
      },
      {
        id: "mall_order",
        label: "订单管理",
        path: "/mall/order",
        roles: MALL_MANAGER_ROLES,
        features: ["全状态订单列表（待付款/待发货/已发货/已完成/已取消/售后）", "发货并录入快递单号", "物流查询跳转", "订单详情查看", "售后处理（退款/退货审核、退款打款）", "订单清单导出 Excel"],
      },
      {
        id: "mall_review",
        label: "评价管理",
        path: "/mall/review",
        roles: MALL_MANAGER_ROLES,
        features: ["商品评价列表", "评价审核与回复", "差评处理与隐藏", "商品详情页展示控制"],
      },
      {
        id: "mall_agent",
        label: "代理商管理",
        path: "/mall/agent",
        roles: MALL_MANAGER_ROLES,
        features: ["代理等级配置（梯队 / 升级门槛 / 默认分成比例）", "代理商列表", "新增代理商（等级/分成比例）", "代理商详情（分销订单明细）", "绑定收款银行卡", "可提现金额与提现申请", "提现记录与状态（待处理/成功/失败）"],
      },
    ],
  },
  {
    id: "pos",
    icon: Receipt,
    label: "单据收银",
    path: "/pos",
    roles: POS_ROLES,
    subs: [
      {
        id: "cashier",
        label: "收银台",
        path: "/pos/cashier",
        roles: POS_ROLES,
        features: ["快速开单 (选人->选品)", "验光数据关联", "套餐/折扣应用", "聚合支付结算"],
      },
      {
        id: "orders",
        label: "消费记录",
        path: "/pos/orders",
        roles: POS_ROLES,
        features: ["历史订单查询", "退款/冲红操作", "补打小票", "电子发票开具"],
      },
    ],
  },
  {
    id: "system_mgmt",
    icon: Gear,
    label: "系统管理",
    path: "/system",
    roles: SYSTEM_ROLES,
    subs: [
      {
        id: "permission_management",
        label: "权限管理",
        path: "/system/permission",
        roles: GLOBAL_ADMIN_ROLES,
        features: ["内置角色权限矩阵", "菜单与关键操作授权", "数据范围说明", "受保护角色不可修改"],
      },
      {
        id: "user_management",
        label: "用户管理",
        path: "/system/user",
        roles: SYSTEM_ROLES,
        features: ["账号列表与筛选（门店/角色/状态）", "创建与停用账号", "分配角色与门店归属", "店长仅可维护本店店员/视光师"],
      },
      {
        id: "system_settings",
        label: "系统设置",
        path: "/system/settings",
        roles: GLOBAL_ADMIN_ROLES,
        features: ["全局通用参数", "登录安全策略", "集成配置（脱敏展示）", "门店资料在门店维度维护"],
      },
      {
        id: "log_management",
        label: "日志管理",
        path: "/system/log",
        roles: SYSTEM_ROLES,
        features: ["登录与操作日志", "按操作者/门店/结果筛选", "关键操作可追溯", "日志只追加不可编辑"],
      },
    ],
  },
  {
    id: "ui_spec",
    icon: Palette,
    label: "系统 UI 组件规范",
    path: "/ui-spec",
    roles: GLOBAL_ADMIN_ROLES,
    subs: [],
  },
];
