// 商城管理 · 评价数据层
//
// 架构约定：
// - 评价为订单完成后由消费者提交，关联订单 / SKU（下单快照展示，不随 ERP 商品档案变动）。
// - 审核机制：评价提交后进入「待审核」，仅「已通过」的评价才在商城前台对外展示；
//   「已拒绝」不展示，已通过的评价若含敏感信息可由商家「隐藏」（暂停展示，可恢复）。
// - 每条评价记录保留提交时间（日期 + 时间）与审核 / 回复时间，便于商家追溯处理过程。

import { erpProductMap, erpSkuMap, getSkuSpecText } from "../inventory/mockData";
import { initialShops } from "./mockData";

/** 评价审核状态 */
export type ReviewStatus = "待审核" | "已通过" | "已拒绝" | "已隐藏";

/** 商城商品评价 */
export type MallReview = {
  id: string;
  /** 关联订单号 */
  orderId: string;
  /** 关联 SKU（评价对象） */
  skuId: string;
  shopId: string;
  customerName: string;
  customerPhone: string;
  /** 评分 1-5 星 */
  rating: number;
  /** 评价内容 */
  content: string;
  /** 评价图片（占位，商城前台以图文展示） */
  images: string[];
  status: ReviewStatus;
  /** 评价提交时间（日期 + 时间） */
  createdAt: string;
  reviewedAt?: string;
  /** 审核备注（拒绝时填写原因） */
  reviewNote?: string;
  /** 商家回复 */
  reply?: string;
  repliedAt?: string;
};

/** 评价对应的商品名称 / 规格 / 图片（下单快照口径，取自 SKU 主数据） */
export function getReviewProduct(review: MallReview) {
  const sku = erpSkuMap[review.skuId];
  const product = sku ? erpProductMap[sku.spuId] : undefined;
  return {
    name: product?.name ?? review.skuId,
    spec: sku ? getSkuSpecText(sku) : "",
    image: sku?.image ?? "",
  };
}

/** 评价所属店铺名称 */
export function getReviewShopName(shopId: string) {
  return initialShops.find((shop) => shop.id === shopId)?.name ?? shopId;
}

const img = (count: number) => Array.from({ length: count }, (_, i) => `评价图 ${i + 1}`);

/** 模拟评价数据：覆盖各审核状态、各店铺、各评分 */
export const initialReviews: MallReview[] = [
  {
    id: "RV-20261110-001",
    orderId: "SO-20261103-007",
    skuId: "SKU-1001-01",
    shopId: "SHOP-001",
    customerName: "陈女士",
    customerPhone: "138****6621",
    rating: 5,
    content: "孩子佩戴了半个月，白天视力稳定，镜片护理也方便。客服讲解很耐心，物流也很快。",
    images: img(2),
    status: "已通过",
    createdAt: "2026-11-06 20:15",
    reviewedAt: "2026-11-07 09:30",
    reviewNote: "内容真实，予以通过",
    reply: "感谢您的认可，建议按时复查，有任何佩戴问题随时联系我们。",
    repliedAt: "2026-11-07 10:05",
  },
  {
    id: "RV-20261111-002",
    orderId: "SO-20261109-012",
    skuId: "SKU-1006-02",
    shopId: "SHOP-001",
    customerName: "王先生",
    customerPhone: "139****3344",
    rating: 4,
    content: "眼罩冷敷效果不错，就是有点偏大，戴久了耳朵会有点勒。整体性价比可以。",
    images: img(1),
    status: "待审核",
    createdAt: "2026-11-12 21:40",
  },
  {
    id: "RV-20261108-003",
    orderId: "SO-20261108-003",
    skuId: "SKU-1001-02",
    shopId: "SHOP-002",
    customerName: "赵女士",
    customerPhone: "137****8899",
    rating: 2,
    content: "发货太慢了，等了三天才发。产品本身还行，但体验一般。",
    images: [],
    status: "待审核",
    createdAt: "2026-11-11 15:02",
  },
  {
    id: "RV-20261109-004",
    orderId: "SO-20261107-010",
    skuId: "SKU-1003-01",
    shopId: "SHOP-002",
    customerName: "孙先生",
    customerPhone: "132****7890",
    rating: 5,
    content: "训练仪孩子很喜欢，每天主动做训练，两个月复查度数没有加深，很满意。",
    images: img(3),
    status: "已通过",
    createdAt: "2026-11-09 11:20",
    reviewedAt: "2026-11-09 14:00",
    reply: "感谢支持，坚持训练效果会更好哦。",
    repliedAt: "2026-11-09 14:15",
  },
  {
    id: "RV-20261107-005",
    orderId: "SO-20261101-004",
    skuId: "SKU-1008-01",
    shopId: "SHOP-001",
    customerName: "刘女士",
    customerPhone: "135****2211",
    rating: 1,
    content: "打广告的加微信 18900001111，代购更便宜。",
    images: [],
    status: "已拒绝",
    createdAt: "2026-11-07 08:45",
    reviewedAt: "2026-11-07 09:10",
    reviewNote: "内容含广告与站外联系方式，不予展示",
  },
  {
    id: "RV-20261105-006",
    orderId: "SO-20261030-002",
    skuId: "SKU-1010-01",
    shopId: "SHOP-001",
    customerName: "周先生",
    customerPhone: "133****9012",
    rating: 5,
    content: "家用验光仪数据挺准的，和门店验的差不多，省了跑门店的时间。",
    images: img(1),
    status: "已隐藏",
    createdAt: "2026-11-05 19:30",
    reviewedAt: "2026-11-05 20:00",
    reviewNote: "客户要求隐藏，暂时不对外展示",
    reply: "感谢反馈，如需要可随时联系我们做数据校准。",
    repliedAt: "2026-11-06 09:00",
  },
  {
    id: "RV-20261112-007",
    orderId: "SO-20261110-016",
    skuId: "SKU-1002-01",
    shopId: "SHOP-003",
    customerName: "黄女士",
    customerPhone: "136****5678",
    rating: 4,
    content: "镜片戴上很舒适，就是价格偏高，希望多做活动。",
    images: [],
    status: "待审核",
    createdAt: "2026-11-13 10:12",
  },
  {
    id: "RV-20261106-008",
    orderId: "SO-20261101-005",
    skuId: "SKU-1007-01",
    shopId: "SHOP-003",
    customerName: "林先生",
    customerPhone: "134****6789",
    rating: 5,
    content: "叶黄素孩子爱吃，酸酸甜甜的，回购了三次。",
    images: img(2),
    status: "已通过",
    createdAt: "2026-11-06 16:08",
    reviewedAt: "2026-11-06 17:20",
  },
  {
    id: "RV-20261113-009",
    orderId: "SO-20261111-014",
    skuId: "SKU-1005-01",
    shopId: "SHOP-003",
    customerName: "吴女士",
    customerPhone: "131****3456",
    rating: 3,
    content: "训练仪功能挺多，但说明书太简单了，老人不太会用，建议出详细教程。",
    images: [],
    status: "待审核",
    createdAt: "2026-11-13 22:05",
  },
];
