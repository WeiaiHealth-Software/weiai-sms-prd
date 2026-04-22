import {
  SquaresFour,
  Storefront,
  ChartBar,
  Users,
  Package,
  Receipt,
} from "@phosphor-icons/react";

export const menuConfig = [
  {
    id: "dashboard",
    icon: SquaresFour,
    label: "仪表盘",
    path: "/",
    subs: [],
  },
  {
    id: "store_mgmt",
    icon: Storefront,
    label: "门店管理",
    path: "/store",
    subs: [
      { id: "doctor_mgmt", label: "人员管理", path: "/store/personnel", features: ["医生档案维护 (职称/专业)", "医生账号权限设置", "业绩指标设定", "医生个人简介配置"] },
      { id: "room_mgmt", label: "诊室管理", path: "/store/room", features: ["诊室编号/名称设置", "诊室设备绑定 (综合验光仪等)", "诊室状态监控", "数字标牌设备绑定"] },
      { id: "scheduling", label: "门店排班", path: "/store/schedule", features: ["可视化排班表 (日/周/月)", "排班关联诊室 (自动分配)", "临时调班/请假处理", "排班发布与通知"] },
    ],
  },
  {
    id: "analytics",
    icon: ChartBar,
    label: "数据分析",
    path: "/analytics",
    subs: [
      { id: "financial", label: "财务报表", path: "/analytics/financial", features: ["营收统计 (日/月/年)", "支付方式构成分析", "欠款/挂账统计", "退款率分析"] },
      { id: "sales", label: "销售分析（原CRM消费统计）", path: "/analytics/sales", features: ["套餐销量排行榜", "镜片/镜架 SKU 动销率", "全局消费统计", "周期/类目统计"] },
      { id: "traffic", label: "客流分析", path: "/analytics/traffic", features: ["新老客占比趋势", "渠道来源分析 (小程序/自然)", "到店转化漏斗", "客流高峰时段热力图"] },
      { id: "quality", label: "医疗质量", path: "/analytics/quality", features: ["验光处方修改率", "复查异常率统计", "加工损耗率", "客户投诉/满意度分析"] },
    ],
  },
  {
    id: "crm",
    icon: Users,
    label: "客户档案(CRM)",
    path: "/crm",
    subs: [
      { id: "client_list", label: "客户列表", path: "/crm/client-list", features: ["全量客户查询", "高级筛选 (年龄/度数/来源)", "客户画像 360视图", "导出 Excel"] },
      { id: "consumer", label: "消费管理", path: "/crm/consumer", features: ["消费记录列表（高级筛选）", "新增销售开单", "收费项目列表", "新增收费项目"] },
      { id: "booking", label: "预约管理", path: "/crm/booking", features: ["日历视图排班", "预约创建与修改", "医生/设备资源占用", "预约短信通知"] },
      { id: "followup", label: "回访管理", path: "/crm/followup", features: ["新增回访记录", "筛选条件（姓名、电话、日期、回访项目类型）", "复诊回访列表", "回访统计、复查完成率统计"] },
      { id: "optometry", label: "验光记录", path: "/crm/optometry", features: ["验光单据查询", "历史光度趋势对比", "处方打印", "视觉训练记录"] },
      { id: "member", label: "会员管理", path: "/crm/member", features: ["会员等级规则配置", "积分兑换记录", "会员专属权益设置", "家庭档案绑定"] },
    ],
  },
  {
    id: "inventory",
    icon: Package,
    label: "库存管理(ERP)",
    path: "/inventory",
    subs: [
      { id: "product", label: "商品管理", path: "/inventory/product", features: ["全量商品库查询", "商品档案列表", "实时库存详情", "价格体系维护"] },
      { id: "inbound", label: "入库管理", path: "/inventory/inbound", features: ["采购订单创建", "采购入库单", "销售退回入库", "供应商管理"] },
      { id: "outbound", label: "出库管理", path: "/inventory/outbound", features: ["销售出库记录", "采购退货出库", "报损/领用出库", "出库单据管理"] },
      { id: "category", label: "类目管理", path: "/inventory/category", features: ["商品类目树维护", "新增/编辑类目", "类目属性模板配置", "类目关联品牌设置"] },
      { id: "transfer", label: "盘点调拨", path: "/inventory/transfer", features: ["门店间调货申请", "月度/季度盘点录入", "盘盈盘亏调整", "库存流水日志"] },
    ],
  },
  {
    id: "pos",
    icon: Receipt,
    label: "单据收银",
    path: "/pos",
    subs: [
      { id: "cashier", label: "收银台", path: "/pos/cashier", features: ["快速开单 (选人->选品)", "验光数据关联", "套餐/折扣应用", "聚合支付结算"] },
      { id: "orders", label: "消费记录", path: "/pos/orders", features: ["历史订单查询", "退款/冲红操作", "补打小票", "电子发票开具"] },
    ],
  },
];
