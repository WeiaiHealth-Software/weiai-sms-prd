import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import {
  Star,
  ChatCircleDots,
  CheckCircle,
  XCircle,
  Info,
  Image as PhosphorImage,
  User,
} from "@phosphor-icons/react";
import Select, { type SelectOption } from "../../components/form/Select";
import InfoRow from "../../components/product/InfoRow";
import StatusTag, { type StatusTone } from "../../components/product/StatusTag";
import { initialShops } from "./mockData";
import {
  initialReviews,
  getReviewProduct,
  getReviewShopName,
  type MallReview,
  type ReviewStatus,
} from "./reviewData";

type StatusFilter = "全部状态" | ReviewStatus;
type ShopFilter = "全部店铺" | string;
type RatingFilter = "全部评分" | "5星" | "4星" | "3星" | "2星" | "1星";

const statusFilterOptions: SelectOption[] = [
  "全部状态",
  "待审核",
  "已通过",
  "已拒绝",
  "已隐藏",
].map((item) => ({ value: item, label: item }));

const shopFilterOptions: SelectOption[] = [
  { value: "全部店铺", label: "全部店铺" },
  ...initialShops.map((shop) => ({ value: shop.id, label: shop.name })),
];

const ratingFilterOptions: SelectOption[] = ["全部评分", "5星", "4星", "3星", "2星", "1星"].map((item) => ({
  value: item,
  label: item,
}));

/** 评价状态色调（与 DESIGN.md §7 语义色一致） */
const statusToneMap: Record<ReviewStatus, StatusTone> = {
  待审核: "warning",
  已通过: "success",
  已拒绝: "danger",
  已隐藏: "neutral",
};

/** 当前时间戳（日期 + 时间），用于审核 / 回复记录 */
function nowStamp() {
  const now = new Date();
  return `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`;
}

/** 星级评分展示 */
function StarRating({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          weight={i <= value ? "fill" : "regular"}
          className={i <= value ? "text-amber-400" : "text-slate-200"}
        />
      ))}
    </span>
  );
}

export default function ReviewList() {
  const [reviews, setReviews] = useState<MallReview[]>(initialReviews);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("全部状态");
  const [shopFilter, setShopFilter] = useState<ShopFilter>("全部店铺");
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>("全部评分");
  const [keyword, setKeyword] = useState("");

  const [detail, setDetail] = useState<MallReview | null>(null);

  // 审核弹窗（通过 / 拒绝）
  const [auditCandidate, setAuditCandidate] = useState<MallReview | null>(null);
  const [auditNote, setAuditNote] = useState("");
  // 回复弹窗
  const [replyCandidate, setReplyCandidate] = useState<MallReview | null>(null);
  const [replyText, setReplyText] = useState("");

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    const ratingValue = ratingFilter === "全部评分" ? null : Number(ratingFilter.replace("星", ""));
    return reviews
      .filter((review) => {
        if (statusFilter !== "全部状态" && review.status !== statusFilter) return false;
        if (shopFilter !== "全部店铺" && review.shopId !== shopFilter) return false;
        if (ratingValue !== null && review.rating !== ratingValue) return false;
        if (kw) {
          const product = getReviewProduct(review);
          const haystack = `${review.id} ${review.orderId} ${review.customerName} ${review.customerPhone} ${product.name} ${product.spec} ${review.content}`.toLowerCase();
          if (!haystack.includes(kw)) return false;
        }
        return true;
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [keyword, ratingFilter, reviews, shopFilter, statusFilter]);

  const stats = useMemo(() => {
    const base: Record<ReviewStatus, number> = { 待审核: 0, 已通过: 0, 已拒绝: 0, 已隐藏: 0 };
    for (const review of reviews) base[review.status]++;
    return base;
  }, [reviews]);

  const avgRating = useMemo(() => {
    if (filtered.length === 0) return 0;
    return filtered.reduce((sum, review) => sum + review.rating, 0) / filtered.length;
  }, [filtered]);

  const shopName = (shopId: string) => getReviewShopName(shopId);

  // —— 审核 ——
  function openAudit(review: MallReview) {
    setAuditCandidate(review);
    setAuditNote("");
  }

  function approveReview() {
    if (!auditCandidate) return;
    const ts = nowStamp();
    const note = auditNote.trim();
    setReviews((prev) =>
      prev.map((review) =>
        review.id === auditCandidate.id
          ? { ...review, status: "已通过", reviewedAt: ts, reviewNote: note || undefined }
          : review
      )
    );
    setAuditCandidate(null);
  }

  function rejectReview() {
    if (!auditCandidate || !auditNote.trim()) return;
    const ts = nowStamp();
    setReviews((prev) =>
      prev.map((review) =>
        review.id === auditCandidate.id
          ? { ...review, status: "已拒绝", reviewedAt: ts, reviewNote: auditNote.trim() }
          : review
      )
    );
    setAuditCandidate(null);
  }

  // —— 隐藏 / 恢复展示 ——
  function toggleHide(review: MallReview) {
    setReviews((prev) =>
      prev.map((item) =>
        item.id === review.id
          ? { ...item, status: item.status === "已隐藏" ? "已通过" : "已隐藏" }
          : item
      )
    );
  }

  // —— 回复 ——
  function openReply(review: MallReview) {
    setReplyCandidate(review);
    setReplyText(review.reply ?? "");
  }

  function submitReply() {
    if (!replyCandidate || !replyText.trim()) return;
    const ts = nowStamp();
    setReviews((prev) =>
      prev.map((review) =>
        review.id === replyCandidate.id ? { ...review, reply: replyText.trim(), repliedAt: ts } : review
      )
    );
    setReplyCandidate(null);
  }

  // —— 详情 Drawer ——
  const detailModal =
    detail && typeof document !== "undefined"
      ? createPortal(
          <div className="fixed inset-0 z-[120] bg-slate-950/35" onClick={() => setDetail(null)}>
            <div
              className="absolute right-0 top-0 flex h-full w-full max-w-[620px] flex-col overflow-hidden bg-white shadow-2xl"
              style={{ animation: "drawer-slide-in 0.25s ease-out" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-[18px] font-bold leading-7 text-gray-900">{detail.id}</span>
                    <StatusTag status={detail.status} tone={statusToneMap[detail.status]} />
                  </div>
                  <div className="mt-1 text-sm font-medium leading-6 text-slate-500">
                    {shopName(detail.shopId)} · 评价于 {detail.createdAt}
                  </div>
                </div>
                <button
                  className="rounded-2xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200"
                  onClick={() => setDetail(null)}
                >
                  关闭
                </button>
              </div>

              <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
                {/* 评价商品 */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
                  <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <PhosphorImage weight="bold" className="h-3.5 w-3.5" />
                    评价商品
                  </div>
                  <div className="flex items-center gap-3">
                    {(() => {
                      const product = getReviewProduct(detail);
                      return (
                        <>
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="h-14 w-14 flex-none rounded-xl object-cover" />
                          ) : (
                            <div className="flex h-14 w-14 flex-none items-center justify-center rounded-xl bg-slate-100">
                              <PhosphorImage className="h-6 w-6 text-slate-300" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-semibold text-slate-700">{product.name}</div>
                            <div className="mt-0.5 truncate text-xs text-slate-500">{product.spec}</div>
                            <div className="mt-0.5 text-[11px] text-slate-400">{detail.skuId}</div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  <div className="mt-3">
                    <InfoRow label="关联订单" value={detail.orderId} />
                  </div>
                </div>

                {/* 评价内容 */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
                  <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <ChatCircleDots weight="bold" className="h-3.5 w-3.5" />
                    评价内容
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-amber-500">{detail.rating}.0</span>
                    <StarRating value={detail.rating} size={16} />
                  </div>
                  <div className="mt-3 space-y-2.5">
                    <InfoRow label="评价日期" value={detail.createdAt.split(" ")[0]} />
                    <InfoRow label="评价时间" value={detail.createdAt.split(" ")[1] ?? "—"} />
                  </div>
                  <div className="mt-3 rounded-xl bg-white px-3 py-2.5 text-sm leading-6 text-slate-700">
                    {detail.content}
                  </div>
                  {detail.images.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {detail.images.map((label) => (
                        <div
                          key={label}
                          className="flex h-16 w-16 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white text-[10px] text-slate-400"
                        >
                          {label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 评价客户 */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
                  <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <User weight="bold" className="h-3.5 w-3.5" />
                    评价客户
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <InfoRow label="客户姓名" value={detail.customerName} />
                    <InfoRow label="联系电话" value={detail.customerPhone} />
                  </div>
                </div>

                {/* 审核信息 */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
                  <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <CheckCircle weight="bold" className="h-3.5 w-3.5" />
                    审核信息
                  </div>
                  {detail.status === "待审核" ? (
                    <div className="py-1 text-sm text-slate-400">该评价尚未审核，审核通过后才会在商城前台展示。</div>
                  ) : (
                    <div className="space-y-2.5">
                      <InfoRow label="审核状态" value={detail.status} />
                      <InfoRow label="审核时间" value={detail.reviewedAt ?? "—"} />
                      <InfoRow label="审核备注" value={detail.reviewNote ?? "—"} />
                    </div>
                  )}
                </div>

                {/* 商家回复 */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
                  <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <ChatCircleDots weight="bold" className="h-3.5 w-3.5" />
                    商家回复
                  </div>
                  {detail.reply ? (
                    <div className="space-y-2.5">
                      <div className="rounded-xl bg-white px-3 py-2.5 text-sm leading-6 text-slate-700">{detail.reply}</div>
                      <InfoRow label="回复时间" value={detail.repliedAt ?? "—"} />
                    </div>
                  ) : (
                    <div className="py-1 text-sm text-slate-400">暂未回复</div>
                  )}
                </div>
              </div>

              {/* 底部操作 */}
              <div className="flex flex-wrap items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
                {detail.status === "待审核" && (
                  <>
                    <button
                      onClick={() => openAudit(detail)}
                      className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600"
                    >
                      审核评价
                    </button>
                  </>
                )}
                {(detail.status === "已通过" || detail.status === "已隐藏") && (
                  <>
                    <button
                      onClick={() => openReply(detail)}
                      className="rounded-xl bg-primary-50 px-4 py-2.5 text-sm font-semibold text-primary-600 hover:bg-primary-100"
                    >
                      {detail.reply ? "修改回复" : "回复评价"}
                    </button>
                    <button
                      onClick={() => toggleHide(detail)}
                      className={clsx(
                        "rounded-xl px-4 py-2.5 text-sm font-semibold",
                        detail.status === "已隐藏"
                          ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      )}
                    >
                      {detail.status === "已隐藏" ? "恢复展示" : "隐藏评价"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  // —— 审核弹窗 ——
  const auditModal =
    auditCandidate && typeof document !== "undefined"
      ? createPortal(
          <div
            className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/35 px-4 py-8"
            onClick={() => setAuditCandidate(null)}
          >
            <div
              className="w-full max-w-[520px] max-h-[90vh] overflow-y-auto rounded-[28px] bg-white px-7 py-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <ChatCircleDots size={22} weight="bold" />
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-800">评价审核</div>
                  <div className="text-xs text-slate-500">
                    {auditCandidate.id} · {shopName(auditCandidate.shopId)}
                  </div>
                </div>
                <div className="ml-auto">
                  <StatusTag status={auditCandidate.status} tone={statusToneMap[auditCandidate.status]} />
                </div>
              </div>

              {/* 评价摘要 */}
              <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate font-semibold text-slate-700">{getReviewProduct(auditCandidate).name}</span>
                  <StarRating value={auditCandidate.rating} />
                </div>
                <div className="mt-1 text-xs text-slate-400">评价于 {auditCandidate.createdAt}</div>
                <div className="mt-2 rounded-xl bg-white px-3 py-2 leading-6 text-slate-700">{auditCandidate.content}</div>
              </div>

              <div className="mt-5">
                <div className="text-sm font-semibold text-slate-700">审核备注</div>
                <textarea
                  value={auditNote}
                  onChange={(e) => setAuditNote(e.target.value)}
                  rows={3}
                  placeholder="通过时选填；拒绝时需说明原因（将告知客户）"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700 outline-none placeholder:text-slate-400 focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                />
                <div className="mt-1 text-xs text-slate-400">审核通过后评价将在商城商品详情页对外展示。</div>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={approveReview}
                  className="flex-1 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600"
                >
                  <CheckCircle weight="bold" className="mr-1 inline h-4 w-4" />
                  通过审核
                </button>
                <button
                  type="button"
                  onClick={rejectReview}
                  disabled={!auditNote.trim()}
                  className="flex-1 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <XCircle weight="bold" className="mr-1 inline h-4 w-4" />
                  拒绝
                </button>
              </div>
              <button
                type="button"
                onClick={() => setAuditCandidate(null)}
                className="mt-4 w-full text-center text-xs text-slate-400 hover:text-slate-600"
              >
                关闭
              </button>
            </div>
          </div>,
          document.body
        )
      : null;

  // —— 回复弹窗 ——
  const replyModal =
    replyCandidate && typeof document !== "undefined"
      ? createPortal(
          <div
            className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/35 px-4 py-8"
            onClick={() => setReplyCandidate(null)}
          >
            <div
              className="w-full max-w-[520px] rounded-[28px] bg-white px-7 py-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                  <ChatCircleDots size={22} weight="bold" />
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-800">回复评价</div>
                  <div className="text-xs text-slate-500">
                    {replyCandidate.id} · {getReviewProduct(replyCandidate).name}
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm">
                <div className="flex items-center gap-2">
                  <StarRating value={replyCandidate.rating} />
                  <span className="text-xs text-slate-400">{replyCandidate.customerName}</span>
                </div>
                <div className="mt-2 rounded-xl bg-white px-3 py-2 leading-6 text-slate-700">{replyCandidate.content}</div>
              </div>

              <div className="mt-5">
                <div className="text-sm font-semibold text-slate-700">回复内容</div>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={3}
                  placeholder="请输入对客户的回复，回复内容将展示在评价下方"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700 outline-none placeholder:text-slate-400 focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                />
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => setReplyCandidate(null)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={submitReply}
                  disabled={!replyText.trim()}
                  className="flex-1 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  提交回复
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div className="min-h-full flex flex-col gap-4">
      {/* 状态统计卡片 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(["待审核", "已通过", "已拒绝", "已隐藏"] as ReviewStatus[]).map((status) => {
          const active = statusFilter === status;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(active ? "全部状态" : status)}
              className={clsx(
                "rounded-2xl border p-4 text-left transition",
                active ? "border-primary-300 bg-primary-50/70 shadow-sm" : "border-gray-100 bg-white card-shadow hover:border-gray-200"
              )}
            >
              <div className={clsx("text-sm font-medium", active ? "text-primary-700" : "text-slate-500")}>{status}</div>
              <div className={clsx("mt-1.5 text-2xl font-bold", active ? "text-primary-600" : "text-slate-800")}>{stats[status]}</div>
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl card-shadow border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100">
          <div className="flex flex-col gap-3 p-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
              <Select
                value={statusFilter}
                onChange={(value) => setStatusFilter(value as StatusFilter)}
                options={statusFilterOptions}
                className="min-w-[128px]"
                triggerClassName="h-[46px] rounded-2xl border-gray-200 px-4"
              />
              <Select
                value={shopFilter}
                onChange={(value) => setShopFilter(value)}
                options={shopFilterOptions}
                className="min-w-[150px]"
                triggerClassName="h-[46px] rounded-2xl border-gray-200 px-4"
              />
              <Select
                value={ratingFilter}
                onChange={(value) => setRatingFilter(value as RatingFilter)}
                options={ratingFilterOptions}
                className="min-w-[120px]"
                triggerClassName="h-[46px] rounded-2xl border-gray-200 px-4"
              />
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="搜索评价编号 / 订单号 / 客户 / 评价内容"
                className="h-[46px] w-full max-w-[320px] rounded-2xl border border-gray-200 bg-white px-4 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 border-t border-gray-100 bg-slate-50/60 px-4 py-2.5 text-xs text-slate-500">
            <Info weight="bold" className="h-4 w-4 flex-none text-primary-500" />
            评价需「审核通过」后才在商城前台对外展示；已通过的评价可「隐藏」暂停展示（可恢复），已拒绝的评价不展示。
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] table-fixed text-center">
            <colgroup>
              <col className="w-[18%]" />
              <col className="w-[9%]" />
              <col className="w-[23%]" />
              <col className="w-[10%]" />
              <col className="w-[11%]" />
              <col className="w-[10%]" />
              <col className="w-[8%]" />
              <col className="w-[11%]" />
            </colgroup>
            <thead className="bg-gray-50 text-xs uppercase tracking-[0.18em] text-gray-400">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">商品</th>
                <th className="px-4 py-3 text-center font-semibold">评分</th>
                <th className="px-4 py-3 text-left font-semibold">评价内容</th>
                <th className="px-4 py-3 text-left font-semibold">客户</th>
                <th className="px-4 py-3 text-left font-semibold">店铺</th>
                <th className="px-4 py-3 text-left font-semibold">评价时间</th>
                <th className="px-4 py-3 text-center font-semibold">状态</th>
                <th className="px-4 py-3 text-center font-semibold">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filtered.map((review) => {
                const product = getReviewProduct(review);
                const [date, time] = review.createdAt.split(" ");
                return (
                  <tr key={review.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-left">
                      <div className="flex items-center gap-2.5">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="h-10 w-10 flex-none rounded-lg object-cover" />
                        ) : (
                          <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-slate-100">
                            <PhosphorImage className="h-4 w-4 text-slate-300" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="truncate font-semibold text-gray-900">{product.name}</div>
                          <div className="mt-0.5 truncate text-xs text-gray-400">{product.spec}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StarRating value={review.rating} />
                    </td>
                    <td className="px-4 py-3 text-left">
                      <div className="line-clamp-2 text-gray-700">{review.content}</div>
                      {review.images.length > 0 && (
                        <div className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                          <PhosphorImage weight="bold" className="h-3.5 w-3.5" />
                          {review.images.length} 张图片
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-left text-gray-600">
                      <div className="truncate text-xs font-medium">{review.customerName}</div>
                      <div className="truncate text-xs text-gray-400">{review.customerPhone}</div>
                    </td>
                    <td className="px-4 py-3 text-left text-gray-600">
                      <span className="line-clamp-2 text-xs leading-5">{shopName(review.shopId)}</span>
                    </td>
                    <td className="px-4 py-3 text-left">
                      <div className="text-xs font-semibold text-gray-700">{date}</div>
                      <div className="mt-0.5 text-xs text-gray-400">{time}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusTag status={review.status} tone={statusToneMap[review.status]} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5">
                        <button
                          className="rounded-md bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-600 hover:bg-primary-100 hover:text-primary-700"
                          onClick={() => setDetail(review)}
                        >
                          详情
                        </button>
                        {review.status === "待审核" && (
                          <button
                            className="rounded-md bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700"
                            onClick={() => openAudit(review)}
                          >
                            审核
                          </button>
                        )}
                        {(review.status === "已通过" || review.status === "已隐藏") && (
                          <>
                            <button
                              className="text-xs font-medium text-primary-500 hover:text-primary-600"
                              onClick={() => openReply(review)}
                            >
                              回复
                            </button>
                            <button
                              className="text-xs font-medium text-slate-500 hover:text-slate-700"
                              onClick={() => toggleHide(review)}
                            >
                              {review.status === "已隐藏" ? "恢复" : "隐藏"}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-sm text-gray-400">
                    暂无符合条件的评价
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-sm text-gray-500">
          <div>
            共 {filtered.length} 条评价
            {filtered.length > 0 && (
              <span className="ml-3 text-slate-400">平均评分 {avgRating.toFixed(1)} 分</span>
            )}
          </div>
        </div>
      </div>

      {detailModal}
      {auditModal}
      {replyModal}
    </div>
  );
}
