import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useParams } from "react-router";
import clsx from "clsx";
import {
  ArrowLeft,
  CreditCard,
  CurrencyCircleDollar,
  Receipt,
  WarningCircle,
  Info,
  PencilSimple,
  CopySimple,
  Check,
  QrCode,
  DownloadSimple,
} from "@phosphor-icons/react";
import Select, { type SelectOption } from "../../components/form/Select";
import StatusTag, { type StatusTone } from "../../components/product/StatusTag";
import {
  getAgentOrderProduct,
  getAgentSettleSummary,
  getLevelBadgeClass,
  getLevelConfig,
  getLevelConditionText,
  getAgentShareUrl,
  initialAgents,
  initialAgentOrders,
  initialWithdraws,
  type Agent,
  type AgentOrder,
  type BankCard,
  type WithdrawRecord,
  type WithdrawStatus,
} from "./agentData";

const tabs = [
  { key: "orders", label: "分销订单明细" },
  { key: "withdraws", label: "提现记录" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

const settleTone: Record<AgentOrder["settleStatus"], StatusTone> = {
  待结算: "warning",
  已结算: "success",
};

const withdrawTone: Record<WithdrawStatus, StatusTone> = {
  待处理: "warning",
  成功: "success",
  失败: "danger",
};

const levelBadgeClass = (level: string) => getLevelBadgeClass(level);

const bankOptions: SelectOption[] = [
  "招商银行",
  "中国工商银行",
  "中国建设银行",
  "中国农业银行",
  "中国银行",
  "交通银行",
  "中国邮政储蓄银行",
  "兴业银行",
  "中信银行",
  "浦发银行",
  "民生银行",
  "平安银行",
].map((item) => ({ value: item, label: item }));

function money(value: number) {
  return `¥${value.toFixed(2)}`;
}

/** 当前时间戳（日期 + 时间） */
function nowStamp() {
  const now = new Date();
  return `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`;
}

export default function AgentDetail() {
  const navigate = useNavigate();
  const params = useParams();
  const agentId = String(params.id ?? "");

  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const agent = useMemo(() => agents.find((item) => item.id === agentId), [agents, agentId]);

  const [orders] = useState<AgentOrder[]>(initialAgentOrders);
  const [withdraws, setWithdraws] = useState<WithdrawRecord[]>(initialWithdraws);

  const [tab, setTab] = useState<TabKey>("orders");

  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [cardDraft, setCardDraft] = useState<BankCard>({ bankName: "招商银行", cardNo: "", holder: "", phone: "" });

  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const [copied, setCopied] = useState(false);

  const summary = useMemo(() => getAgentSettleSummary(agentId, orders, withdraws), [agentId, orders, withdraws]);

  const shareUrl = useMemo(() => getAgentShareUrl(agentId), [agentId]);

  const myOrders = useMemo(
    () => orders.filter((order) => order.agentId === agentId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [orders, agentId]
  );

  const myWithdraws = useMemo(
    () => withdraws.filter((record) => record.agentId === agentId).sort((a, b) => b.appliedAt.localeCompare(a.appliedAt)),
    [withdraws, agentId]
  );

  function openCardModal() {
    if (!agent) return;
    setCardDraft(agent.bankCard ?? { bankName: "招商银行", cardNo: "", holder: agent.name, phone: agent.phone });
    setCardModalOpen(true);
  }

  function saveCard() {
    const cardNo = cardDraft.cardNo.trim();
    const holder = cardDraft.holder.trim();
    const phone = cardDraft.phone.trim();
    if (!cardDraft.bankName || !cardNo || !holder || !phone) return;
    setAgents((prev) =>
      prev.map((item) =>
        item.id === agentId ? { ...item, bankCard: { bankName: cardDraft.bankName, cardNo, holder, phone } } : item
      )
    );
    setCardModalOpen(false);
  }

  function submitWithdraw() {
    if (!agent || !agent.bankCard) return;
    const amount = Number(withdrawAmount);
    if (Number.isNaN(amount) || amount <= 0 || amount > summary.withdrawable) return;
    const dateCode = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const seq = String(withdraws.length + 1).padStart(3, "0");
    const record: WithdrawRecord = {
      id: `WD-${dateCode}-${seq}`,
      agentId,
      amount,
      status: "待处理",
      bankCard: agent.bankCard,
      appliedAt: nowStamp(),
    };
    setWithdraws((prev) => [record, ...prev]);
    setWithdrawOpen(false);
    setWithdrawAmount("");
  }

  async function copyShareUrl() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // 剪贴板不可用时降级到隐藏 input 复制
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    }
  }

  /** 下载二维码图片 */
  function downloadQrCode() {
    const img = document.querySelector<HTMLImageElement>(".agent-share-qrcode img");
    if (!img || !agent || !img.src) return;
    const link = document.createElement("a");
    link.download = `分销二维码-${agent.name}-${agent.id}.png`;
    link.href = img.src;
    link.target = "_blank";
    link.click();
  }

  if (!agent) {
    return (
      <div className="min-h-full flex flex-col gap-4">
        <button
          onClick={() => navigate("/mall/agent")}
          className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft weight="bold" className="h-4 w-4" />
          返回代理商列表
        </button>
        <div className="bg-white rounded-2xl card-shadow border border-gray-100 p-16 text-center text-slate-400">
          未找到该代理商
        </div>
      </div>
    );
  }

  const withdrawAmountNum = Number(withdrawAmount);
  const withdrawValid =
    withdrawAmount.trim() !== "" &&
    !Number.isNaN(withdrawAmountNum) &&
    withdrawAmountNum > 0 &&
    withdrawAmountNum <= summary.withdrawable;

  const stats = [
    { label: "累计分销金额", value: money(summary.totalAmount), tone: "text-slate-800" },
    { label: "累计分成", value: money(summary.totalCommission), tone: "text-slate-800" },
    { label: "已结算分成", value: money(summary.settledCommission), tone: "text-emerald-600" },
    { label: "待结算分成", value: money(summary.pendingCommission), tone: "text-orange-500" },
    { label: "已提现", value: money(summary.withdrawn), tone: "text-slate-800" },
    { label: "提现处理中", value: money(summary.withdrawing), tone: "text-orange-500" },
  ];

  const levelConfig = getLevelConfig(agent.level);

  // —— 绑定 / 修改银行卡 ——
  const cardModal =
    cardModalOpen && typeof document !== "undefined"
      ? createPortal(
          <div
            className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/35 px-4 py-8"
            onClick={() => setCardModalOpen(false)}
          >
            <div
              className="w-full max-w-[560px] max-h-[90vh] overflow-y-auto rounded-[28px] bg-white px-7 py-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                  <CreditCard size={22} weight="bold" />
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-800">{agent.bankCard ? "修改收款银行卡" : "绑定收款银行卡"}</div>
                  <div className="text-xs text-slate-500">提现款项将打款至该银行卡，请确认信息准确</div>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <div className="text-sm font-semibold text-slate-600">开户银行</div>
                  <Select
                    value={cardDraft.bankName}
                    onChange={(value) => setCardDraft((prev) => ({ ...prev, bankName: value }))}
                    options={bankOptions}
                    className="mt-2"
                    triggerClassName="h-12 rounded-2xl px-4"
                    dropdownClassName="rounded-2xl"
                  />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-600">银行卡号</div>
                  <input
                    value={cardDraft.cardNo}
                    onChange={(e) => setCardDraft((prev) => ({ ...prev, cardNo: e.target.value }))}
                    placeholder="请输入银行卡号"
                    className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none placeholder:font-medium placeholder:text-slate-400 focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <div className="text-sm font-semibold text-slate-600">持卡人</div>
                    <input
                      value={cardDraft.holder}
                      onChange={(e) => setCardDraft((prev) => ({ ...prev, holder: e.target.value }))}
                      placeholder="请输入持卡人姓名"
                      className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none placeholder:font-medium placeholder:text-slate-400 focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-600">预留手机号</div>
                    <input
                      value={cardDraft.phone}
                      onChange={(e) => setCardDraft((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="请输入银行预留手机号"
                      className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none placeholder:font-medium placeholder:text-slate-400 focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setCardModalOpen(false)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={saveCard}
                  disabled={!cardDraft.bankName || !cardDraft.cardNo.trim() || !cardDraft.holder.trim() || !cardDraft.phone.trim()}
                  className="flex-1 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  保存银行卡
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  // —— 提现 ——
  const withdrawModal =
    withdrawOpen && agent.bankCard && typeof document !== "undefined"
      ? createPortal(
          <div
            className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/35 px-4 py-8"
            onClick={() => setWithdrawOpen(false)}
          >
            <div
              className="w-full max-w-[520px] rounded-[28px] bg-white px-7 py-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CurrencyCircleDollar size={22} weight="bold" />
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-800">申请提现</div>
                  <div className="text-xs text-slate-500">
                    {agent.name} · 当前可提现 {money(summary.withdrawable)}
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">收款银行卡</span>
                  <span className="font-semibold text-slate-700">
                    {agent.bankCard.bankName} {agent.bankCard.cardNo}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-slate-400">持卡人</span>
                  <span className="font-semibold text-slate-700">{agent.bankCard.holder}</span>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-sm font-semibold text-slate-600">提现金额</div>
                <input
                  value={withdrawAmount}
                  inputMode="decimal"
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder={`最多可提现 ${summary.withdrawable.toFixed(2)}`}
                  className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-base font-semibold text-slate-700 outline-none placeholder:font-medium placeholder:text-slate-400 focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                />
                <button
                  type="button"
                  onClick={() => setWithdrawAmount(summary.withdrawable.toFixed(2))}
                  className="mt-2 text-xs font-medium text-primary-500 hover:text-primary-600"
                >
                  全部提现
                </button>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => setWithdrawOpen(false)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={submitWithdraw}
                  disabled={!withdrawValid}
                  className="flex-1 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  确认提现
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  const canWithdraw = agent.status === "启用" && !!agent.bankCard && summary.withdrawable > 0;

  return (
    <div className="min-h-full flex flex-col gap-4">
      <button
        onClick={() => navigate("/mall/agent")}
        className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft weight="bold" className="h-4 w-4" />
        返回代理商列表
      </button>

      {/* 代理商信息 + 可提现 */}
      <div className="bg-white rounded-2xl card-shadow border border-gray-100 overflow-hidden">
        <div className="flex flex-col gap-5 p-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl bg-primary-50 text-xl font-bold text-primary-600">
              {agent.name.slice(0, 1)}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[18px] font-bold leading-7 text-gray-900">{agent.name}</span>
                <span className="inline-flex items-center gap-1 rounded-full border border-primary-100 bg-primary-50 px-2.5 py-0.5 text-xs font-semibold text-primary-600">
                  <span className="font-mono tracking-wide">{agent.id}</span>
                </span>
                <span className={clsx("inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold", levelBadgeClass(agent.level))}>
                  {agent.level}
                </span>
                <StatusTag status={agent.status} tone={agent.status === "启用" ? "success" : "neutral"} />
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                <span>联系电话 {agent.phone}</span>
                <span>加入时间 {agent.createdAt}</span>
                <span className="font-semibold text-slate-600">分成比例 {agent.commissionRate}%</span>
              </div>
              {levelConfig && (
                <div className="mt-1.5 text-sm text-slate-400">当前等级门槛：{getLevelConditionText(levelConfig)}</div>
              )}
              {agent.remark && <div className="mt-1.5 text-sm text-slate-400">{agent.remark}</div>}
            </div>
          </div>

          <div className="flex flex-none items-center gap-5 rounded-2xl border border-gray-100 bg-gray-50/70 px-5 py-4">
            <div className="text-right">
              <div className="text-sm text-slate-500">可提现余额</div>
              <div className="mt-0.5 text-[26px] font-bold leading-9 text-primary-600">{money(summary.withdrawable)}</div>
            </div>
            <button
              disabled={!canWithdraw}
              onClick={() => {
                setWithdrawAmount("");
                setWithdrawOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary-500 px-5 py-3 text-sm font-semibold text-white hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-primary-300"
            >
              <CurrencyCircleDollar weight="bold" className="h-4 w-4" />
              提现
            </button>
          </div>
        </div>
        {!canWithdraw && (
          <div className="flex items-center gap-2 border-t border-gray-100 bg-slate-50/60 px-5 py-2.5 text-xs text-slate-500">
            <Info weight="bold" className="h-4 w-4 flex-none text-primary-500" />
            {agent.status === "停用"
              ? "该代理商已停用，暂不可提现。"
              : !agent.bankCard
                ? "尚未绑定收款银行卡，绑定后即可发起提现。"
                : "当前暂无可提现金额（仅「已结算」分成可提现，且需扣除提现处理中的金额）。"}
          </div>
        )}
      </div>

      {/* 收款银行卡（真实信用卡样式） + 分销二维码 */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* 收款银行卡 */}
        <div className="rounded-2xl card-shadow border border-gray-100 bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-semibold text-slate-700">
              <CreditCard weight="duotone" className="h-5 w-5 text-primary-500" />
              收款银行卡
            </div>
            <button
              onClick={openCardModal}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary-50 px-3.5 py-2 text-sm font-semibold text-primary-600 hover:bg-primary-100"
            >
              <PencilSimple weight="bold" className="h-4 w-4" />
              {agent.bankCard ? "修改银行卡" : "绑定银行卡"}
            </button>
          </div>

          {agent.bankCard ? (
            <div className="mt-4 flex justify-center">
              <div className="relative w-full max-w-[360px] aspect-[1.586/1] overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 p-5 text-white shadow-lg">
                {/* 装饰光斑 */}
                <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
                <div className="pointer-events-none absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-white/5" />
                <div className="relative flex h-full flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[11px] font-medium text-white/70">开户银行</div>
                      <div className="mt-0.5 text-base font-bold">{agent.bankCard.bankName}</div>
                    </div>
                    <CreditCard weight="duotone" className="h-7 w-7 text-white/80" />
                  </div>
                  {/* 芯片 */}
                  <div className="h-8 w-11 rounded-md bg-gradient-to-br from-amber-200 to-amber-400 shadow-inner">
                    <div className="grid h-full w-full grid-cols-3 grid-rows-3 gap-px p-1">
                      {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="rounded-[1px] bg-amber-300/60" />
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="font-mono text-lg tracking-[0.18em]">
                      {agent.bankCard.cardNo}
                    </div>
                    <div className="mt-2 flex items-end justify-between text-xs">
                      <div>
                        <div className="text-white/60">持卡人</div>
                        <div className="mt-0.5 text-sm font-semibold">{agent.bankCard.holder}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-white/60">预留手机号</div>
                        <div className="mt-0.5 text-sm font-semibold">{agent.bankCard.phone}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-6 text-sm text-slate-400">
              <WarningCircle weight="bold" className="h-4 w-4 flex-none text-orange-400" />
              该代理商尚未绑定收款银行卡，绑定后方可发起提现。
            </div>
          )}
        </div>

        {/* 分销二维码 */}
        <div className="rounded-2xl card-shadow border border-gray-100 bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-semibold text-slate-700">
              <QrCode weight="duotone" className="h-5 w-5 text-primary-500" />
              分销推广二维码
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
              分销 ID
              <span className="font-mono tracking-wide text-primary-600">{agent.id}</span>
            </span>
          </div>

          <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <div className="agent-share-qrcode flex-none rounded-2xl border border-gray-100 bg-white p-3">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=0&data=${encodeURIComponent(shareUrl)}`}
                alt={`分销二维码 ${agent.id}`}
                className="h-[180px] w-[180px]"
                onError={(e) => {
                  // 在线二维码不可用时降级显示占位
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <div className="text-sm text-slate-500">
                扫码或复制下方链接进入商城，下单将自动归属到该代理商名下并计算分成。
              </div>
              <div className="rounded-xl border border-gray-100 bg-slate-50/70 px-3 py-2">
                <div className="break-all font-mono text-xs text-slate-600">{shareUrl}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={copyShareUrl}
                  className={clsx(
                    "inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition",
                    copied
                      ? "bg-emerald-500 text-white"
                      : "bg-primary-500 text-white hover:bg-primary-600"
                  )}
                >
                  {copied ? <Check weight="bold" className="h-4 w-4" /> : <CopySimple weight="bold" className="h-4 w-4" />}
                  {copied ? "已复制" : "复制链接"}
                </button>
                <button
                  onClick={downloadQrCode}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  <DownloadSimple weight="bold" className="h-4 w-4" />
                  保存二维码
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 结算概览 */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-gray-100 bg-white p-4 card-shadow">
            <div className="text-sm text-slate-500">{stat.label}</div>
            <div className={clsx("mt-1.5 text-xl font-bold", stat.tone)}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* 明细 Tabs */}
      <div className="bg-white rounded-2xl card-shadow border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-1 border-b border-gray-100 px-2">
          {tabs.map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={clsx(
                "relative px-4 py-3.5 text-sm font-semibold transition",
                tab === item.key ? "text-primary-600" : "text-slate-500 hover:text-slate-700"
              )}
            >
              {item.label}
              <span className="ml-1.5 text-xs text-slate-400">
                {item.key === "orders" ? myOrders.length : myWithdraws.length}
              </span>
              {tab === item.key && <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary-500" />}
            </button>
          ))}
        </div>

        {tab === "orders" ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] table-fixed text-center">
              <colgroup>
                <col className="w-[15%]" />
                <col className="w-[11%]" />
                <col className="w-[25%]" />
                <col className="w-[7%]" />
                <col className="w-[11%]" />
                <col className="w-[11%]" />
                <col className="w-[9%]" />
                <col className="w-[11%]" />
              </colgroup>
              <thead className="bg-gray-50 text-xs uppercase tracking-[0.18em] text-gray-400">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">订单号</th>
                  <th className="px-4 py-3 text-left font-semibold">买家</th>
                  <th className="px-4 py-3 text-left font-semibold">商品</th>
                  <th className="px-4 py-3 text-center font-semibold">数量</th>
                  <th className="px-4 py-3 text-center font-semibold">订单金额</th>
                  <th className="px-4 py-3 text-center font-semibold">分成金额</th>
                  <th className="px-4 py-3 text-center font-semibold">结算状态</th>
                  <th className="px-4 py-3 text-center font-semibold">下单时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {myOrders.map((order) => {
                  const product = getAgentOrderProduct(order);
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-left font-semibold text-gray-900">{order.orderId}</td>
                      <td className="px-4 py-3 text-left text-gray-600">
                        <div className="truncate text-xs font-medium">{order.buyerName}</div>
                        <div className="truncate text-xs text-gray-400">{order.buyerPhone}</div>
                      </td>
                      <td className="px-4 py-3 text-left">
                        <div className="truncate font-medium text-gray-800">{product.name}</div>
                        <div className="mt-0.5 truncate text-xs text-gray-400">
                          {product.spec} · {order.skuId}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600">×{order.quantity}</td>
                      <td className="px-4 py-3 text-center font-medium text-gray-700">{money(order.amount)}</td>
                      <td className="px-4 py-3 text-center font-semibold text-primary-600">{money(order.commission)}</td>
                      <td className="px-4 py-3 text-center">
                        <StatusTag status={order.settleStatus} tone={settleTone[order.settleStatus]} />
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-gray-500">{order.createdAt}</td>
                    </tr>
                  );
                })}
                {myOrders.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-16 text-center text-sm text-gray-400">
                      该代理商暂无分销订单
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] table-fixed text-center">
              <colgroup>
                <col className="w-[16%]" />
                <col className="w-[12%]" />
                <col className="w-[24%]" />
                <col className="w-[10%]" />
                <col className="w-[16%]" />
                <col className="w-[22%]" />
              </colgroup>
              <thead className="bg-gray-50 text-xs uppercase tracking-[0.18em] text-gray-400">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">提现单号</th>
                  <th className="px-4 py-3 text-center font-semibold">提现金额</th>
                  <th className="px-4 py-3 text-left font-semibold">收款银行卡</th>
                  <th className="px-4 py-3 text-center font-semibold">状态</th>
                  <th className="px-4 py-3 text-center font-semibold">申请时间</th>
                  <th className="px-4 py-3 text-left font-semibold">处理说明</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {myWithdraws.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-left font-semibold text-gray-900">{record.id}</td>
                    <td className="px-4 py-3 text-center font-semibold text-gray-800">{money(record.amount)}</td>
                    <td className="px-4 py-3 text-left text-gray-600">
                      <div className="truncate text-xs font-medium">{record.bankCard.bankName}</div>
                      <div className="truncate text-xs text-gray-400">{record.bankCard.cardNo}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusTag status={record.status} tone={withdrawTone[record.status]} />
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-gray-500">
                      <div>{record.appliedAt}</div>
                      {record.handledAt && <div className="mt-0.5 text-gray-400">处理：{record.handledAt}</div>}
                    </td>
                    <td className="px-4 py-3 text-left text-xs">
                      {record.status === "失败" ? (
                        <span className="text-rose-500">{record.failReason ?? "提现失败"}</span>
                      ) : record.status === "待处理" ? (
                        <span className="text-slate-400">等待平台处理</span>
                      ) : (
                        <span className="text-emerald-600">已打款至银行卡</span>
                      )}
                    </td>
                  </tr>
                ))}
                {myWithdraws.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center text-sm text-gray-400">
                      该代理商暂无提现记录
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 说明 */}
      <div className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-white px-4 py-3 text-xs text-slate-500 card-shadow">
        <Receipt weight="bold" className="h-4 w-4 flex-none text-primary-500" />
        订单成交后分成进入「待结算」，平台确认后转为「已结算」；仅「已结算」分成可提现，且需扣除已提现与提现处理中的金额。
      </div>

      {cardModal}
      {withdrawModal}
    </div>
  );
}
